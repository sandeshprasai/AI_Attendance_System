import numpy as np
from detector import FaceDetector
from embedder import FaceEmbedder

class RecognitionPipeline:
    def __init__(self, detector_path, embedder_path):
        self.detector = FaceDetector(detector_path)
        self.embedder = FaceEmbedder(embedder_path)

    def process_image(self, image):
        faces = self.detector.detect(image)
        if not faces:
            return None, None
            
        # Extract highest confidence face crop
        x1, y1, x2, y2 = faces[0]['bbox']
        face_crop = image[y1:y2, x1:x2]
        
        if face_crop.size == 0:
            return None, None
            
        embedding = self.embedder.get_embedding(face_crop)
        return embedding, [x1, y1, x2, y2]

    @staticmethod
    def compute_similarity(feat1, feat2):
        # Dot product of L2 normalized vectors
        return float(np.dot(feat1.flatten(), feat2.flatten()))