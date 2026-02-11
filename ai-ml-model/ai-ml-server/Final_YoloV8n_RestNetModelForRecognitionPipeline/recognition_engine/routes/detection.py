"""
Face Detection Routes
Handles face detection endpoints for bounding box streaming.
"""

from flask import Blueprint, request, jsonify, current_app
from utils.image import decode_image

detection_bp = Blueprint('detection', __name__)


@detection_bp.route("/detect-face", methods=["POST"])
def detect_face():
    """
    Detect faces in an image and return bounding box coordinates.
    
    Expected input:
        - image: Image file (multipart/form-data)
    
    Returns:
        - bboxes: List of [x1, y1, x2, y2] coordinates
    """
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400

    img = decode_image(request.files["image"])
    
    # Get pipeline from app config
    pipe = current_app.config['RECOGNITION_PIPELINE']
    results = pipe.process_all_faces(img)

    bboxes = [face['bbox'] for face in results]

    return jsonify({
        "faces_detected": len(bboxes),
        "bboxes": bboxes
    })
