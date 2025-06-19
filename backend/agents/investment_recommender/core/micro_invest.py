import math
from datetime import datetime

def calculate_weeks_to_goal(goal_date_str):
    """
    Takes goal_date (YYYY-MM-DD) and returns weeks left from today.
    """
    goal_date = datetime.strptime(goal_date_str, "%Y-%m-%d")
    today = datetime.today()
    delta = goal_date - today
    return max(delta.days // 7, 1)  # at least 1 week

def suggest_micro_investments(goal_amount, goal_date_str, spending_score=0.5):
    """
    Suggests weekly micro-investment amount.
    `spending_score` ranges from 0 to 1. Lower means less affordability.
    """
    weeks_left = calculate_weeks_to_goal(goal_date_str)

    # Base contribution
    base_weekly = goal_amount / weeks_left

    # Adjust based on spending profile
    # Less affordability = lower weekly suggestion, but extend timeline if needed
    multiplier = 0.6 + (spending_score * 0.8)  # between 0.6x and 1.4x

    adjusted_weekly = base_weekly * multiplier
    adjusted_weekly = math.ceil(adjusted_weekly / 50) * 50  # round to nearest ₹50

    return {
        "weeks_left": weeks_left,
        "suggested_weekly": adjusted_weekly,
        "total_contribution": adjusted_weekly * weeks_left
    }
