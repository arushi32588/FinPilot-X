from fastapi import APIRouter
from pydantic import BaseModel
from backend.agents.spending_classifier.classifier import SpendingClassifier

router = APIRouter()
clf = SpendingClassifier(
    model_path="backend/agents/spending_classifier/model.pkl",
    vec_path="backend/agents/spending_classifier/vectorizer.pkl"
)

class Input(BaseModel):
    description: str

@router.post("/classify")
def classify_transaction(input: Input):
    category = clf.predict(input.description)
    return {"category": category}
