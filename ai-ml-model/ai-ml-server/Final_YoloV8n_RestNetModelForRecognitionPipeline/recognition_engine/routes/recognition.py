"""
Recognition Routes
Handles face recognition and attendance marking.
"""

from flask import Blueprint, request, jsonify, current_app
from utils.image import decode_image
from db.operations import get_student_by_roll_no, load_all_enroll_embeddings

recognition_bp = Blueprint('recognition', __name__)


@recognition_bp.route("/recognize", methods=["POST"])
def recognize():
    """
    Recognize a face and return student details if matched.
    
    Expected input:
        - image: Image file (multipart/form-data)
    
    Returns:
        - match: Boolean indicating if a match was found
        - student: Student details if matched
        - similarity: Similarity score
        - bbox: Bounding box coordinates
        - threshold: Recognition threshold used
    """
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400

    img = decode_image(request.files["image"])
    
    # Get pipeline from app config
    pipe = current_app.config['RECOGNITION_PIPELINE']
    query_embedding, bbox = pipe.process_image(img)

    if query_embedding is None:
        return jsonify({
            "match": False,
            "error": "No face detected",
            "bbox": None
        }), 404

    gallery = load_all_enroll_embeddings()

    if len(gallery) == 0:
        return jsonify({
            "match": False,
            "error": "No enrolled students found",
            "bbox": bbox.tolist() if bbox is not None else None
        }), 404

    best_roll_no = None
    best_score = -1.0
    threshold = 0.45

    for roll_no, ref_emb in gallery:
        score = pipe.compute_similarity(query_embedding, ref_emb)
        if score > best_score:
            best_score = score
            best_roll_no = roll_no

    matched = best_score >= threshold if best_roll_no else False
    
    # Get student details if matched
    student_details = None
    if matched:
        student = get_student_by_roll_no(best_roll_no)
        if student:
            student_details = {
                "roll_no": best_roll_no,
                "name": student["FullName"],
                "faculty": str(student["Faculty"]),
                "email": student["Email"]
            }

    return jsonify({
        "match": matched,
        "student": student_details,
        "similarity": round(float(best_score), 4),
        "bbox": bbox.tolist() if bbox is not None else None,
        "threshold": threshold
    })
