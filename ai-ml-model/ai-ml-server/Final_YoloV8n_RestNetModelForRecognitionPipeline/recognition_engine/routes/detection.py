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
    Detect face in an image and return bounding box coordinates.
    
    Expected input:
        - image: Image file (multipart/form-data)
    
    Returns:
        - bbox: [x1, y1, x2, y2] or None if no face detected
    """
    if "image" not in request.files:
        return jsonify({"error": "image required"}), 400

    img = decode_image(request.files["image"])
    
    # Get pipeline from app config
    pipe = current_app.config['RECOGNITION_PIPELINE']
    _, bbox = pipe.process_image(img)

    if bbox is None:
        return jsonify({"bbox": None})

    x1, y1, x2, y2 = map(int, bbox)

    return jsonify({
        "bbox": [x1, y1, x2, y2]
    })
