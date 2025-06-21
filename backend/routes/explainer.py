from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.agents.explainer_agent.explainer import ExplainerAgent

router = APIRouter()

class ExplainRequest(BaseModel):
    portfolio: List[Dict[str, Any]]
    user_profile: Dict[str, Any]

@router.post("/decision-explainer/explain")
async def explain_portfolio(request: ExplainRequest):
    try:
        agent = ExplainerAgent()
        decision = f"Recommended portfolio for goal: {request.user_profile.get('goal', 'N/A')}, risk: {request.user_profile.get('risk_tolerance', 'N/A')}"
        avg_risk = sum(float(f.get('risk_level', 0) if isinstance(f.get('risk_level', 0), (int, float)) else 50) for f in request.portfolio) / max(len(request.portfolio), 1)
        factors = {
            "high_risk": avg_risk,
            "potential_growth": 50
        }
        result = await agent.explain(decision, factors)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 