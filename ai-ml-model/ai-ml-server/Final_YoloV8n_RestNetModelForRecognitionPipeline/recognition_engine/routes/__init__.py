"""
Routes package for the Recognition Engine.
Contains all API endpoints organized by functionality.
"""

from .detection import detection_bp
from .enrollment import enrollment_bp
from .recognition import recognition_bp

__all__ = ['detection_bp', 'enrollment_bp', 'recognition_bp']
