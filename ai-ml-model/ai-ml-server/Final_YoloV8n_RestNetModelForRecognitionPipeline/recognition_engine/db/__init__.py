"""
Database operations package.
Contains MongoDB operations for students and embeddings.
"""

from .operations import (
    get_student_by_roll_no,
    save_embedding_to_db,
    load_all_enroll_embeddings
)

__all__ = [
    'get_student_by_roll_no',
    'save_embedding_to_db',
    'load_all_enroll_embeddings'
]
