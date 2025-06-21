from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.agents.spending_classifier.classifier import SpendingClassifier
import os
import logging
from typing import List

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()
base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
clf = SpendingClassifier(
    model_path=os.path.join(base_path, "backend", "agents", "spending_classifier", "model.pkl"),
    vec_path=os.path.join(base_path, "backend", "agents", "spending_classifier", "vectorizer.pkl")
)

class Transaction(BaseModel):
    date: str = ""
    amount: str = ""
    description: str
    merchant: str = ""

class Input(BaseModel):
    transactions: List[Transaction]

@router.post("/api/classify-spending")
def classify_transactions(input: Input):
    try:
        logger.debug(f"Received {len(input.transactions)} transactions")
        
        if not input.transactions:
            raise HTTPException(status_code=400, detail="No transactions provided")
            
        results = []
        for i, transaction in enumerate(input.transactions):
            logger.debug(f"Processing transaction {i+1}: {transaction.description}")
            
            if not transaction.description or not transaction.description.strip():
                logger.warning(f"Skipping transaction {i+1} - empty description")
                continue
                
            category = clf.predict(transaction.description)
            logger.debug(f"Transaction {i+1} classified as: {category}")
            
            if not category:
                logger.error(f"Failed to classify transaction {i+1}")
                continue
                
            results.append({
                "id": i + 1,
                "description": transaction.description,
                "category": str(category).strip()
            })
            
        if not results:
            raise HTTPException(status_code=400, detail="No valid transactions to classify")
            
        logger.debug(f"Returning {len(results)} classifications")
        return {"results": results}
    except Exception as e:
        logger.error(f"Error during classification: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
