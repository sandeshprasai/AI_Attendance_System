import numpy as np
from models.detector import FaceDetector
from models.embedder import FaceEmbedder

class RecognitionPipeline:
    def __init__(self, detector_path, embedder_path):
        self.detector = FaceDetector(detector_path)
        self.embedder = FaceEmbedder(embedder_path)
        self._gallery_cache = None  # Cache for embeddings

    def set_gallery_cache(self, gallery):
        """Cache the gallery embeddings to avoid repeated DB queries"""
        self._gallery_cache = gallery
    
    def get_gallery_cache(self):
        """Get cached gallery"""
        return self._gallery_cache
    
    def clear_gallery_cache(self):
        """Clear cache when new enrollments occur"""
        self._gallery_cache = None

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
    
    @staticmethod
    def compute_similarity_batch(query_embedding, gallery_embeddings):
        """
        Vectorized similarity computation for speed.
        Args:
            query_embedding: (512,) numpy array
            gallery_embeddings: (N, 512) numpy array
        Returns:
            similarities: (N,) numpy array of cosine similarities
        """
        if len(gallery_embeddings) == 0:
            return np.array([])
        
        # Ensure query is 2D: (1, 512)
        query = query_embedding.reshape(1, -1)
        
        # Batch dot product: (1, 512) @ (512, N) -> (1, N) -> (N,)
        similarities = np.dot(query, gallery_embeddings.T).flatten()
        
        return similarities