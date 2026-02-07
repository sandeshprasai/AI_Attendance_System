import cv2
import numpy as np
import os
from datetime import datetime
from config import IMAGES_DIR

def decode_image(file):
    """Decode image from file upload"""
    file_bytes = file.read()
    file.seek(0)
    
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image")
    
    return img

def save_image(img, roll_no, operation, index=None):
    """Save image to disk with timestamped filename"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if index is not None:
        filename = f"{roll_no}_{operation}_{index}_{timestamp}.jpg"
    else:
        filename = f"{roll_no}_{operation}_{timestamp}.jpg"
    path = os.path.join(IMAGES_DIR, filename)
    cv2.imwrite(path, img)
    return path
