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
    Recognize faces and return student details if matched.
    
    Expected input:
        - image: Image file (multipart/form-data)
        - roll_nos: List of roll numbers to filter by (optional, comma-separated or multiple values)
    
    Returns:
        - results: List of match objects
            - match: Boolean
            - student: Student details if matched
            - similarity: Similarity score
            - bbox: Bounding box coordinates
    """
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400

    img = decode_image(request.files["image"])
    
    # Extract roll_nos from form data if present
    raw_roll_nos = request.form.getlist("roll_nos")
    roll_nos = []
    for item in raw_roll_nos:
        # Split by comma if it's a comma-separated string
        if "," in item:
            roll_nos.extend([r.strip() for r in item.split(",") if r.strip()])
        elif item.strip():
            roll_nos.append(item.strip())

    # Get pipeline from app config
    pipe = current_app.config['RECOGNITION_PIPELINE']
    
    # Process all faces in the image
    detected_faces = pipe.process_all_faces(img)
    
    if not detected_faces:
        return jsonify({
            "faces_detected": 0,
            "results": []
        })

    # Load gallery (filtered if roll_nos provided)
    gallery = load_all_enroll_embeddings(roll_nos=roll_nos if roll_nos else None)
    
    threshold = 0.45
    recognition_results = []

    for face in detected_faces:
        query_embedding = face['embedding']
        bbox = face['bbox']
        
        best_roll_no = None
        best_score = -1.0

        if len(gallery) > 0:
            for roll_no, ref_emb in gallery:
                score = pipe.compute_similarity(query_embedding, ref_emb)
                if score > best_score:
                    best_score = score
                    best_roll_no = roll_no

        matched = best_score >= threshold if best_roll_no else False
        
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

        recognition_results.append({
            "match": matched,
            "student": student_details,
            "similarity": round(float(best_score), 4),
            "bbox": bbox,
            "threshold": threshold
        })

    return jsonify({
        "faces_detected": len(detected_faces),
        "results": recognition_results
    })
