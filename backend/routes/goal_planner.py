from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.agents.goal_planner_agent.goal_planner import parse_goal_to_plan

router = APIRouter()

class GoalRequest(BaseModel):
    user_input: str

class GoalResponse(BaseModel):
    goal: str
    goal_type: str
    target_amount: float
    deadline: str
    monthly_plan: float
    months_remaining: int
    suggested_actions: List[str]
    motivation_quote: str

@router.post("/goal-planner/plan", response_model=GoalResponse)
async def create_goal_plan(request: GoalRequest):
    """
    Create a financial goal plan based on user input.
    
    Args:
        request: Contains the user's goal description
        
    Returns:
        A structured goal plan with monthly savings and suggestions
    """
    try:
        print(f"\n=== GOAL PLANNER REQUEST ===")
        print(f"User input: {request.user_input}")
        
        # Parse the goal using the goal planner agent
        result = parse_goal_to_plan(request.user_input)
        
        print(f"Goal plan result: {result}")
        
        # Check if there was an error in parsing
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return GoalResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in goal planner: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating goal plan: {str(e)}")
    finally:
        print("=== GOAL PLANNER REQUEST END ===\n")

@router.get("/goal-planner/health")
async def goal_planner_health():
    """Health check endpoint for the goal planner."""
    return {"status": "healthy", "service": "goal_planner"} 