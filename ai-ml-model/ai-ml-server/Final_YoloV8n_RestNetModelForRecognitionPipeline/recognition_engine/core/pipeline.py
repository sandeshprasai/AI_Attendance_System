import numpy as np
from models.detector import FaceDetector
from models.embedder import FaceEmbedder

class RecognitionPipeline:
    def __init__(self, detector_path, embedder_path):
        self.detector = FaceDetector(detector_path)
        self.embedder = FaceEmbedder(embedder_path)

    def process_all_faces(self, image):
        """
        Detect all faces and extract embeddings for each.
        Returns: List of dicts mapping {'embedding': np.array, 'bbox': [x1, y1, x2, y2]}
        """
        faces = self.detector.detect(image)
        if not faces:
            return []
            
        results = []
        for face in faces:
            x1, y1, x2, y2 = face['bbox']
            face_crop = image[y1:y2, x1:x2]
            
            if face_crop.size == 0:
                continue
                
            embedding = self.embedder.get_embedding(face_crop)
            results.append({
                "embedding": embedding,
                "bbox": [int(x1), int(y1), int(x2), int(y2)]
            })
        return results

    def process_image(self, image):
        """Processes only the first detected face (kept for backward compatibility)"""
        results = self.process_all_faces(image)
        if not results:
            return None, None
        return results[0]['embedding'], results[0]['bbox']

    @staticmethod
    def compute_similarity(feat1, feat2):
        # Dot product of L2 normalized vectors
        return float(np.dot(feat1.flatten(), feat2.flatten()))