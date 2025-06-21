import firebase_admin
from firebase_admin import credentials, firestore
import os

# Get the absolute path to the firebase_key.json file
current_dir = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(current_dir, 'firebase_key.json')

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()
