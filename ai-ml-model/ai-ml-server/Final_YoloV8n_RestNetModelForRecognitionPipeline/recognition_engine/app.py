import os
import cv2
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.datastructures import FileStorage

from pipeline import RecognitionPipeline

# =========================================================
# Flask App
# =========================================================
app = Flask(__name__)
CORS(app)

# =========================================================
# Paths & Storage
# =========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
IMAGES_DIR = os.path.join(DATA_DIR, "images")
EMBEDDINGS_DIR = os.path.join(DATA_DIR, "embeddings")

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(EMBEDDINGS_DIR, exist_ok=True)

# =========================================================
# Models
# =========================================================
DETECTOR_PATH = os.path.join(BASE_DIR, "../Detector/best.onnx")
EMBEDDER_PATH = os.path.join(BASE_DIR, "../embedding/w600k_r50.onnx")

pipe = RecognitionPipeline(
    detector_path=DETECTOR_PATH,
    embedder_path=EMBEDDER_PATH
)

# =========================================================
# Utility Functions
# =========================================================
def decode_image(file):
    """Decode image from file upload"""
    # Read the file content
    file_bytes = file.read()
    # Reset file pointer for potential re-reads
    file.seek(0)
    
    # Convert to numpy array
    nparr = np.frombuffer(file_bytes, np.uint8)
    
    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image")
    
    return img


def save_image(img, student_id, operation, index=None):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if index is not None:
        filename = f"{student_id}_{operation}_{index}_{timestamp}.jpg"
    else:
        filename = f"{student_id}_{operation}_{timestamp}.jpg"
    path = os.path.join(IMAGES_DIR, filename)
    cv2.imwrite(path, img)
    return path


def get_student_dir(student_id):
    path = os.path.join(EMBEDDINGS_DIR, student_id)
    os.makedirs(path, exist_ok=True)
    return path


def save_embedding(embedding, student_id, operation):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{operation}_{timestamp}.npy"
    student_dir = get_student_dir(student_id)
    path = os.path.join(student_dir, filename)
    np.save(path, embedding.astype(np.float32))
    return path


def load_all_enroll_embeddings():
    gallery = []

    for student_id in os.listdir(EMBEDDINGS_DIR):
        student_dir = os.path.join(EMBEDDINGS_DIR, student_id)
        if not os.path.isdir(student_dir):
            continue

        for file in os.listdir(student_dir):
            if file.startswith("enroll") and file.endswith(".npy"):
                emb = np.load(os.path.join(student_dir, file))
                gallery.append((student_id, emb))

    return gallery


# =========================================================
# Face Detection Only (Bounding Box Streaming)
# =========================================================
@app.route("/detect-face", methods=["POST"])
def detect_face():
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400

    img = decode_image(request.files["image"])

    _, bbox = pipe.process_image(img)

    if bbox is None:
        return jsonify({"bbox": None})

    x1, y1, x2, y2 = map(int, bbox)

    return jsonify({
        "bbox": [x1, y1, x2, y2]
    })


# =========================================================
# Enrollment with Face Cropping and Embedding Extraction
# =========================================================
@app.route("/enroll", methods=["POST"])
def enroll():
    try:
        # Validate required fields
        if "student_id" not in request.form or "name" not in request.form:
            return jsonify({
                "status": "error",
                "message": "student_id and name are required",
                "data": []
            }), 400

        student_id = request.form["student_id"]
        student_name = request.form["name"]

        # Get all uploaded images
        image_files = request.files.getlist("images")
        if not image_files:
            return jsonify({
                "status": "error",
                "message": "At least one image is required",
                "data": []
            }), 400

        embeddings = []
        saved_images = []
        failed_images = []

        for idx, image_file in enumerate(image_files):
            try:
                img = decode_image(image_file)
                
                # -------------------------------
                # 1. Detect face using YOLOv8n
                # -------------------------------
                _, bbox = pipe.process_image(img)  # Assuming bbox = [x1, y1, x2, y2]

                if bbox is None:
                    failed_images.append({
                        "index": idx + 1,
                        "reason": "No face detected"
                    })
                    continue

                x1, y1, x2, y2 = map(int, bbox)

                # Clamp coordinates to image size
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(img.shape[1], x2), min(img.shape[0], y2)

                # -------------------------------
                # 2. Crop face
                # -------------------------------
                face_crop = img[y1:y2, x1:x2]

                if face_crop.size == 0:
                    failed_images.append({
                        "index": idx + 1,
                        "reason": "Invalid crop"
                    })
                    continue

                # -------------------------------
                # 3. Resize to 112x112
                # -------------------------------
                face_crop_resized = cv2.resize(face_crop, (112, 112))

                # -------------------------------
                # 4. Compute embedding
                # -------------------------------
                embedding, _ = pipe.process_image(face_crop_resized)

                if embedding is None:
                    failed_images.append({
                        "index": idx + 1,
                        "reason": "Embedding failed"
                    })
                    continue

                embeddings.append(embedding)

                # -------------------------------
                # 5. Save cropped image
                # -------------------------------
                image_path = save_image(face_crop_resized, student_id, "enroll", index=idx + 1)
                saved_images.append({
                    "index": idx + 1,
                    "path": image_path,
                    "bbox": bbox.tolist()
                })

            except Exception as e:
                failed_images.append({
                    "index": idx + 1,
                    "reason": str(e)
                })

        if len(embeddings) == 0:
            return jsonify({
                "status": "error",
                "message": "No valid faces detected",
                "data": [{"failed_images": failed_images}]
            }), 422

        # -------------------------------
        # 6. Average embedding
        # -------------------------------
        avg_embedding = np.mean(embeddings, axis=0)
        norm = np.linalg.norm(avg_embedding)
        if norm > 0:
            avg_embedding = avg_embedding / norm

        
        print(f"Final normalized embedding for student {student_id}:")
        print(avg_embedding)
        # Save embedding
        embedding_path = save_embedding(avg_embedding, student_id, "enroll")

        return jsonify({
            "status": "success",
            "message": f"Student enrolled successfully with {len(embeddings)} image(s)",
            "data": [
                {
                    "student_id": student_id,
                    "student_name": student_name,
                    "images_processed": len(embeddings),
                    "images_failed": len(failed_images),
                    "embedding_saved": embedding_path,
                    "saved_images": saved_images,
                    "failed_images": failed_images if failed_images else []
                }
            ]
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"Enrollment failed: {str(e)}",
            "data": []
        }), 500


# =========================================================
# Recognition / Attendance
# =========================================================
@app.route("/recognize", methods=["POST"])
def recognize():
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400

    img = decode_image(request.files["image"])
    query_embedding, bbox = pipe.process_image(img)

    if query_embedding is None:
        return jsonify({
            "match": False,
            "error": "No face detected",
            "bbox": None
        }), 404

    gallery = load_all_enroll_embeddings()

    best_id = None
    best_score = -1.0
    threshold = 0.45

    for student_id, ref_emb in gallery:
        score = pipe.compute_similarity(query_embedding, ref_emb)
        if score > best_score:
            best_score = score
            best_id = student_id

    matched = best_score >= threshold if best_id else False
    final_id = best_id if matched else "unknown"

    image_path = save_image(img, final_id, "recognize")
    embedding_path = save_embedding(query_embedding, final_id, "recognize")

    return jsonify({
        "match": matched,
        "student_id": final_id if matched else None,
        "similarity": round(float(best_score), 4),
        "bbox": bbox.tolist() if bbox is not None else None,
        "image_saved": image_path,
        "embedding_saved": embedding_path
    })


# =========================================================
# Run Server
# =========================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True  # Enable debug mode to see errors
    )