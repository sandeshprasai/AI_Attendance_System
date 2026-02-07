"""
ML models package.
Contains face detection and embedding models.
"""

from .detector import FaceDetector
from .embedder import FaceEmbedder

__all__ = ['FaceDetector', 'FaceEmbedder']
