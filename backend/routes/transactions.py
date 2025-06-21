from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.utils.encryption import encrypt_text, decrypt_text
from backend.firebase_client import db  # adjust if your import path is different

router = APIRouter()

class Transaction(BaseModel):
    date: str
    category: str
    subcategory: str
    note: str = None
    amount: float
    income_expense: str

# Dummy "DB" list for example (replace with real DB later)
DB = []

@router.post("/transactions")
async def add_transaction(tx: Transaction):
    encrypted_subcategory = encrypt_text(tx.subcategory)
    encrypted_note = encrypt_text(tx.note) if tx.note else ""

    record = {
        "date": tx.date,
        "category": tx.category,
        "subcategory": encrypted_subcategory,
        "note": encrypted_note,
        "amount": tx.amount,
        "income_expense": tx.income_expense
    }
    # Save to Firestore instead of local list
    doc_ref = db.collection('transactions').document()
    doc_ref.set(record)

    return {"message": "Transaction saved encrypted successfully."}

@router.get("/transactions")
async def get_transactions():
    decrypted_list = []
    docs = db.collection('transactions').stream()
    for doc in docs:
        tx = doc.to_dict()
        decrypted_list.append({
            "date": tx["date"],
            "category": tx["category"],
            "subcategory": decrypt_text(tx["subcategory"]),
            "note": decrypt_text(tx["note"]) if tx["note"] else "",
            "amount": tx["amount"],
            "income_expense": tx["income_expense"]
        })
    return decrypted_list

