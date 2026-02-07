import numpy as np
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from config import MONGO_URI, DB_NAME, STUDENTS_COLLECTION, EMBEDDINGS_COLLECTION

# Initialize MongoDB Client
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]

students_collection = db[STUDENTS_COLLECTION]
embeddings_collection = db[EMBEDDINGS_COLLECTION]

def get_student_by_roll_no(roll_no):
    """Fetch student from MongoDB by roll number"""
    try:
        student = students_collection.find_one({"RollNo": int(roll_no)})
        return student
    except Exception as e:
        print(f"Error fetching student: {str(e)}")
        return None

def save_embedding_to_db(student_id, roll_no, embedding, images_processed, images_failed):
    """Save or update embedding in MongoDB"""
    try:
        embedding_list = embedding.tolist()  # Convert numpy array to list
        
        embedding_doc = {
            "StudentId": ObjectId(student_id),
            "RollNo": int(roll_no),
            "Embedding": embedding_list,
            "EmbeddingMetadata": {
                "ImagesProcessed": images_processed,
                "ImagesFailed": images_failed,
                "EnrollmentDate": datetime.utcnow()
            },
            "LastUpdated": datetime.utcnow()
        }
        
        # Update if exists, insert if not
        result = embeddings_collection.update_one(
            {"RollNo": int(roll_no)},
            {"$set": embedding_doc},
            upsert=True
        )
        
        return result.acknowledged
    except Exception as e:
        print(f"Error saving embedding to database: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def load_all_enroll_embeddings():
    """Load all embeddings from MongoDB"""
    gallery = []
    
    try:
        embeddings = embeddings_collection.find()
        
        for emb_doc in embeddings:
            roll_no = emb_doc["RollNo"]
            embedding = np.array(emb_doc["Embedding"], dtype=np.float32)
            gallery.append((roll_no, embedding))
        
        print(f"Loaded {len(gallery)} embeddings from database")
        return gallery
    except Exception as e:
        print(f"Error loading embeddings: {str(e)}")
        return []

def check_student_enrollment(student_id):
    """
    Check if a student is already enrolled (has an embedding).
    
    Args:
        student_id: Student's ID (string or ObjectId)
    
    Returns:
        bool: True if enrolled, False otherwise
    """
    try:
        # Convert string to ObjectId if needed
        if isinstance(student_id, str):
            student_id = ObjectId(student_id)
        
        # Check if embedding exists for this student
        # Use the correct field name: "StudentId" (capital S)
        existing = embeddings_collection.find_one({"StudentId": student_id})
        
        print(f"Checking enrollment for StudentId: {student_id}")
        print(f"Found existing embedding: {existing is not None}")
        
        return existing is not None
        
    except Exception as e:
        print(f"Error checking enrollment: {str(e)}")
        import traceback
        traceback.print_exc()