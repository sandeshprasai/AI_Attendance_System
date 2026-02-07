"""
Enrollment Routes
Handles student enrollment with face cropping and embedding extraction.
"""

import cv2
import numpy as np
from flask import Blueprint, request, jsonify, current_app
from utils.image import decode_image, save_image
from db.operations import get_student_by_roll_no, save_embedding_to_db

enrollment_bp = Blueprint('enrollment', __name__)


@enrollment_bp.route("/enroll", methods=["POST"])
def enroll():
    """
    Enroll a student with multiple face images.
    
    Expected input:
        - roll_no: Student roll number (form data)
        - images: Multiple image files (multipart/form-data)
    
    Returns:
        - status: success/error
        - message: Description of the result
        - data: Enrollment details including processed/failed images
    """
    try:
        # Validate required fields
        if "roll_no" not in request.form:
            return jsonify({
                "status": "error",
                "message": "roll_no is required",
                "data": []
            }), 400

        roll_no = request.form["roll_no"]

        # Fetch student from database
        student = get_student_by_roll_no(roll_no)
        
        if not student:
            return jsonify({
                "status": "error",
                "message": f"Student with Roll No {roll_no} not found in database",
                "data": []
            }), 404

        student_id = str(student["_id"])
        student_name = student["FullName"]

        print(f"Processing enrollment for: {student_name} (Roll No: {roll_no}, ID: {student_id})")

        # Get all uploaded images
        image_files = request.files.getlist("images")
        if not image_files:
            return jsonify({
                "status": "error",
                "message": "At least one image is required",
                "data": []
            }), 400

        # Get pipeline from app config
        pipe = current_app.config['RECOGNITION_PIPELINE']
        
        embeddings = []
        saved_images = []
        failed_images = []

        for idx, image_file in enumerate(image_files):
            try:
                img = decode_image(image_file)
                
                # Detect face using YOLO
                _, bbox = pipe.process_image(img)

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

                # Crop face
                face_crop = img[y1:y2, x1:x2]

                if face_crop.size == 0:
                    failed_images.append({
                        "index": idx + 1,
                        "reason": "Invalid crop"
                    })
                    continue

                # Resize to 112x112
                face_crop_resized = cv2.resize(face_crop, (112, 112))

                # Compute embedding directly from the resized crop
                # This avoids redundant face detection in an already cropped image
                embedding = pipe.embedder.get_embedding(face_crop_resized)

                if embedding is None:
                    failed_images.append({
                        "index": idx + 1,
                        "reason": "Embedding extraction failed"
                    })
                    continue

                embeddings.append(embedding)

                # Save cropped image
                image_path = save_image(face_crop_resized, roll_no, "enroll", index=idx + 1)
                saved_images.append({
                    "index": idx + 1,
                    "path": image_path,
                    "bbox": bbox.tolist()
                })

                print(f"Image {idx + 1} processed successfully")

            except Exception as e:
                print(f"Error processing image {idx + 1}: {str(e)}")
                failed_images.append({
                    "index": idx + 1,
                    "reason": str(e)
                })

        if len(embeddings) == 0:
            return jsonify({
                "status": "error",
                "message": "No valid faces detected in any image",
                "data": [{"failed_images": failed_images}]
            }), 422

        print(f"Successfully processed {len(embeddings)} images")

        # Calculate average embedding
        avg_embedding = np.mean(embeddings, axis=0)
        
        # Normalize the average embedding
        norm = np.linalg.norm(avg_embedding)
        if norm > 0:
            avg_embedding = avg_embedding / norm

        print(f"Average embedding calculated. Shape: {avg_embedding.shape}")

        # Save embedding to MongoDB
        db_saved = save_embedding_to_db(
            student_id=student_id,
            roll_no=roll_no,
            embedding=avg_embedding,
            images_processed=len(embeddings),
            images_failed=len(failed_images)
        )

        if not db_saved:
            return jsonify({
                "status": "error",
                "message": "Failed to save embedding to database",
                "data": []
            }), 500

        print(f"Embedding saved to database for Roll No: {roll_no}")

        # Prepare response
        return jsonify({
            "status": "success",
            "message": f"Student enrolled successfully with {len(embeddings)} image(s)",
            "data": [
                {
                    "student_id": student_id,
                    "roll_no": roll_no,
                    "student_name": student_name,
                    "images_processed": len(embeddings),
                    "images_failed": len(failed_images),
                    "saved_images": saved_images,
                    "failed_images": failed_images if failed_images else []
                }
            ]
        }), 200

    except Exception as e:
        print(f"Enrollment error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "status": "error",
            "message": f"Enrollment failed: {str(e)}",
            "data": []
        }), 500
