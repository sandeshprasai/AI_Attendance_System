import os
import cv2
import numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

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
    data = file.read()
    img = np.frombuffer(data, np.uint8)
    return cv2.imdecode(img, cv2.IMREAD_COLOR)


def save_image(img, student_id, operation):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
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
# NEW: Face Detection Only (Bounding Box Streaming)
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
# Enrollment
# =========================================================
@app.route("/enroll", methods=["POST"])
def enroll():
    if "image" not in request.files or "student_id" not in request.form:
        return jsonify({"error": "image and student_id required"}), 400

    student_id = request.form["student_id"]
    img = decode_image(request.files["image"])

    embedding, bbox = pipe.process_image(img)

    if embedding is None:
        return jsonify({"error": "No face detected"}), 422

    image_path = save_image(img, student_id, "enroll")
    embedding_path = save_embedding(embedding, student_id, "enroll")

    return jsonify({
        "status": "success",
        "student_id": student_id,
        "bbox": bbox,
        "image_saved": image_path,
        "embedding_saved": embedding_path
    })


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
        "bbox": bbox,
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
        debug=False
    )
