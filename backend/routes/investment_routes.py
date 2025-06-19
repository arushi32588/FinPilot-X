from fastapi import APIRouter, HTTPException, Query
from backend.agents.investment_recommender.investment_recommender import InvestmentRecommender
from backend.agents.investment_recommender.core.micro_invest import suggest_micro_investments
from typing import List, Dict, Any, Optional
import logging
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class UserProfile(BaseModel):
    goal: str
    risk_tolerance: str
    time_horizon_months: int
    wants_micro_invest: bool
    target_amount: Optional[float] = 100000  # Default ₹1L
    monthly_investment: Optional[float] = 5000  # Default ₹5K
    current_investments: Optional[float] = 0  # Default no current investments
    income_range: Optional[str] = "5-10L"  # Default middle income range
    investment_experience: Optional[str] = "Intermediate"  # Default intermediate experience
    inflation_rate: Optional[float] = 6.0  # Default inflation rate

def format_growth_sim(sim):
    if isinstance(sim, dict) and "mean" in sim:
        return f"{sim['mean']}% growth"
    return sim

@router.post("/api/investment-recommender/recommend")
async def get_recommendations(user_profile: UserProfile) -> Dict[str, Any]:
    try:
        logger.info("Fetching investment recommendations...")
        
        # Convert income range to monthly income
        income_range_map = {
            "0-5L": 25000,
            "5-10L": 62500,
            "10-20L": 125000,
            "20-50L": 291666,
            "50L+": 500000
        }
        
        # Create a complete user profile for the recommender
        complete_profile = {
            "risk_tolerance": user_profile.risk_tolerance,
            "income": income_range_map.get(user_profile.income_range, 62500),  # Default to middle range
            "time_horizon_months": user_profile.time_horizon_months,
            "goal_amount": user_profile.target_amount,
            "goal_date": (datetime.now() + timedelta(days=user_profile.time_horizon_months * 30)).strftime("%Y-%m-%d"),
            "spending_score": 0.8,  # Default spending score
            "current_portfolio": {
                "total_value": user_profile.current_investments,
                "monthly_contribution": user_profile.monthly_investment
            },
            "goal": user_profile.goal,
            "wants_micro_invest": user_profile.wants_micro_invest,
            "investment_experience": user_profile.investment_experience
        }
        
        # Initialize recommender
        recommender = InvestmentRecommender(user_id="default_user")
        
        # Get recommendations using the full recommender logic
        recommendations = recommender.get_recommendations(complete_profile)
        
        if recommendations is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate investment recommendations. Please try again later."
            )
        
        # Calculate micro-investment plan
        micro_plan = suggest_micro_investments(
            goal_amount=user_profile.target_amount,
            goal_date_str=complete_profile["goal_date"],
            spending_score=complete_profile["spending_score"]
        )
        
        # Use Gemini's micro_investment_plan if available, else fallback to local calculation
        gemini_micro_plan = recommendations.get("micro_investment_plan")
        if gemini_micro_plan and isinstance(gemini_micro_plan, dict) and all(k in gemini_micro_plan for k in ("weekly_investment", "weeks_to_goal", "total_contribution")):
            micro_plan_to_use = gemini_micro_plan
        else:
            micro_plan_to_use = {
                "weekly_investment": micro_plan['suggested_weekly'],
                "weeks_to_goal": micro_plan['weeks_left'],
                "total_contribution": micro_plan['total_contribution'],
                "tips": [
                    {
                        "tip": "Start with small amounts and increase gradually",
                        "description": "Begin your investment journey with amounts you are comfortable with. As your confidence and financial situation improve, gradually increase your weekly contributions to accelerate your progress."
                    },
                    {
                        "tip": "Set up automatic weekly investments",
                        "description": "Automate your investments to ensure consistency and avoid missing contributions. This helps build a disciplined investment habit and leverages the power of compounding."
                    },
                    {
                        "tip": "Review and adjust your plan every 3 months",
                        "description": "Regularly review your micro-investment plan to ensure it aligns with your goals and financial situation. Adjust your contributions as needed to stay on track."
                    }
                ]
            }
        
        # Use Gemini's growth_simulations if available, else fallback to local calculation
        gemini_growth_sim = recommendations.get("growth_simulations")
        if gemini_growth_sim and isinstance(gemini_growth_sim, dict) and all(k in gemini_growth_sim for k in ("normal", "crash", "boom")):
            growth_sim_to_use = {
                "normal": format_growth_sim(gemini_growth_sim["normal"]),
                "crash": format_growth_sim(gemini_growth_sim["crash"]),
                "boom": format_growth_sim(gemini_growth_sim["boom"]),
                "analysis": {
                    "best_case": "In the best-case scenario, your portfolio benefits from strong market performance, resulting in higher-than-expected returns and faster achievement of your financial goals.",
                    "expected_case": "In the expected scenario, your portfolio grows at a steady pace based on historical averages, helping you stay on track to meet your investment objectives.",
                    "worst_case": "In the worst-case scenario, your portfolio faces adverse market conditions, leading to lower or even negative returns. However, diversification and regular investing can help mitigate losses and support recovery over time."
                }
            }
        else:
            growth_sim_to_use = {
                "normal": f"{recommendations.get('portfolio_metrics', {}).get('expected_return', 12):.1f}% growth",
                "crash": f"{max(recommendations.get('portfolio_metrics', {}).get('expected_return', 12) - 20, 0):.1f}% growth",
                "boom": f"{recommendations.get('portfolio_metrics', {}).get('expected_return', 12) + 10:.1f}% growth",
                "analysis": {
                    "best_case": "In a booming market, your portfolio could grow significantly above expectations",
                    "worst_case": "Even in a market crash, your diversified portfolio should maintain some value",
                    "expected_case": "Based on historical data, this allocation should help you reach your goals"
                }
            }
        
        # Use Gemini's improved portfolio if available and add rationale if present
        gemini_portfolio = recommendations.get("recommended_portfolio", [])
        if "improved_portfolio" in recommendations:
            gemini_portfolio = recommendations["improved_portfolio"]
        
        # --- Inflation and Future Value Logic (Rewritten) ---
        inflation_rate = float(getattr(user_profile, 'inflation_rate', 6.0) or 6.0) / 100
        years = user_profile.time_horizon_months / 12
        goal_amount = user_profile.target_amount or 100000
        monthly_investment = user_profile.monthly_investment or 0
        current_investments = user_profile.current_investments or 0

        # Separate mutual funds and others
        mf_funds = [f for f in gemini_portfolio if f.get('type') == 'mutual_fund']
        other_funds = [f for f in gemini_portfolio if f.get('type') != 'mutual_fund']
        mf_alloc_sum = sum(f.get('allocation', 0) for f in mf_funds) or 1
        other_alloc_sum = sum(f.get('allocation', 0) for f in other_funds) or 1

        total_corpus_nominal = 0
        investments_with_inflation = []
        for fund in gemini_portfolio:
            allocation = fund.get('allocation', 0)
            # Always extract expected return from Gemini's field if present
            if 'expected_return' in fund and fund['expected_return'] is not None:
                try:
                    nominal_return = float(fund['expected_return']) / 100
                except Exception:
                    nominal_return = 0.12 if fund.get('type') == 'mutual_fund' else 0.07 if fund.get('type') == 'fixed_deposit' else 0.15
            else:
                nominal_return = 0.12 if fund.get('type') == 'mutual_fund' else 0.07 if fund.get('type') == 'fixed_deposit' else 0.15
            # Calculate FV based on type
            if fund['type'] == 'mutual_fund':
                mf_monthly = monthly_investment * (allocation / mf_alloc_sum)
                fv = mf_monthly * (((1 + nominal_return/12) ** (years*12) - 1) / (nominal_return/12 + 1e-9)) * (1 + nominal_return/12)
            else:
                other_lump = current_investments * (allocation / other_alloc_sum)
                fv = other_lump * ((1 + nominal_return) ** years)
            total_corpus_nominal += fv
            # Inflation-adjusted value
            real_return = ((1 + nominal_return) / (1 + inflation_rate)) - 1
            inflation_adjusted_value = fv / ((1 + inflation_rate) ** years)
            investments_with_inflation.append({
                **fund,
                "expected_nominal_return": f"{nominal_return*100:.2f}%",
                "inflation_rate": f"{inflation_rate*100:.2f}%",
                "real_return": f"{real_return*100:.2f}%",
                "nominal_future_value": f"₹{fv:,.0f}",
                "inflation_adjusted_value": f"₹{inflation_adjusted_value:,.0f}",
                "what_this_means": "This is the estimated value of your investment in today's money, after accounting for inflation. It helps you understand the real purchasing power of your future corpus.",
                "expected_return": f"{nominal_return*100:.2f}%"
            })
        # Target goal future value (goal grown by inflation)
        target_goal_future_value = goal_amount * ((1 + inflation_rate) ** years)
        # Calculate total inflation-adjusted value for all investments
        total_inflation_adjusted = sum(
            float(f["inflation_adjusted_value"].replace('₹','').replace(',','')) for f in investments_with_inflation
        )
        # Goal gap (in future rupees, nominal terms)
        goal_gap = total_corpus_nominal - target_goal_future_value
        goal_gap_status = "Surplus" if goal_gap >= 0 else "Shortfall"
        # Add central summary section
        central_summary = {
            "total_corpus_nominal": f"₹{total_corpus_nominal:,.0f}",
            "inflation_adjusted_value": f"₹{total_inflation_adjusted:,.0f}",
            "target_goal_future_value": f"₹{target_goal_future_value:,.0f}",
            "goal_gap": f"₹{goal_gap:,.0f} {goal_gap_status}",
            "goal_gap_status": goal_gap_status
        }
        
        # Format the response to match test_recommender's output with additional details
        formatted_response = {
            "central_summary": central_summary,
            "recommended_portfolio": [
                {**fund, **{
                    "name": fund["name"],
                    "allocation": f"{fund['allocation'] * 100:.1f}%" if fund.get('allocation') is not None else None,
                    "type": fund["type"],
                    "risk_level": "Low" if fund["type"] == "fixed_deposit" else "Medium" if fund["type"] == "mutual_fund" else "High",
                    "expected_return": fund.get("expected_return", "N/A"),
                    "liquidity": "Low" if fund["type"] == "fixed_deposit" else "High",
                    "micro_invest_enabled": fund["type"] != "fixed_deposit",
                    "min_investment": fund.get("min_investment", fund.get("min_amount", 1000)),
                    "reasoning": fund.get("rationale") or f"Based on your {user_profile.goal} goal, {user_profile.risk_tolerance} risk tolerance, and {user_profile.investment_experience} experience level, this investment offers a good balance of risk and return."
                }} for fund in investments_with_inflation
            ],
            "micro_investment_plan": micro_plan_to_use,
            "growth_simulations": growth_sim_to_use,
            "risk_analysis": {
                "portfolio_risk": recommendations.get('portfolio_metrics', {}).get('risk_level', 'Medium'),
                "diversification_score": recommendations.get('portfolio_metrics', {}).get('diversification_score', 'Medium'),
                "liquidity_score": recommendations.get('portfolio_metrics', {}).get('liquidity_score', 'Medium'),
                "tips": [
                    "Your portfolio is well-diversified across different asset classes",
                    "Consider increasing equity exposure if you can handle more risk",
                    "Keep an emergency fund in liquid investments"
                ]
            },
            "nudge": recommendations.get("nudges", [])[0] if recommendations.get("nudges") else "Ready to start your investment journey?",
            "gamification": {
                "level": 1,
                "xp": 0,
                "streak": "0 weeks",
                "next_level": "Level 2",
                "xp_to_next": "1000 XP needed"
            },
            "investment_tips": [
                "Start investing early to benefit from compound growth",
                "Diversify across different asset classes",
                "Review your portfolio quarterly",
                "Consider tax implications of your investments",
                "Keep an emergency fund before investing"
            ]
        }
        
        return formatted_response
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        )

@router.post("/api/investment-recommender/save")
async def save_recommendation(payload: Dict[str, Any]):
    """
    Save a user's investment recommendation to their library (simple JSON file for demo).
    Expects: { "user_id": str, "recommendation": dict }
    """
    try:
        user_id = payload.get("user_id")
        recommendation = payload.get("recommendation")
        if not user_id or not recommendation:
            raise HTTPException(status_code=400, detail="user_id and recommendation are required")
        # Save to a user-specific JSON file (for demo; use DB in production)
        save_path = os.path.join(os.path.dirname(__file__), f"saved_recommendations_{user_id}.json")
        # Load existing
        if os.path.exists(save_path):
            with open(save_path, 'r') as f:
                data = json.load(f)
        else:
            data = []
        # Save the ENTIRE recommendation object
        data.append({"timestamp": datetime.now().isoformat(), "recommendation": recommendation})
        with open(save_path, 'w') as f:
            json.dump(data, f, indent=2)
        return {"message": "Recommendation saved successfully!"}
    except Exception as e:
        logger.error(f"Error saving recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving recommendation: {str(e)}")

@router.get("/api/investment-recommender/library")
async def get_library(user_id: str = Query(...)):
    """
    Get all saved recommendations for a user.
    """
    import os, json
    save_path = os.path.join(os.path.dirname(__file__), f"saved_recommendations_{user_id}.json")
    if not os.path.exists(save_path):
        return []
    with open(save_path, 'r') as f:
        data = json.load(f)
    return data 