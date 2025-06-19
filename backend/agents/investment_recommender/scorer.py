import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InvestmentScorer:
    def __init__(self):
        self.risk_weights = {
            "Low": {"fixed_deposits": 0.6, "mutual_funds": 0.3, "stocks": 0.1},
            "Medium": {"fixed_deposits": 0.4, "mutual_funds": 0.4, "stocks": 0.2},
            "High": {"fixed_deposits": 0.2, "mutual_funds": 0.4, "stocks": 0.4}
        }

    def score_mutual_fund(self, fund_data: Dict, risk_tolerance: str, time_horizon: int, goal: str) -> float:
        """
        Score a mutual fund based on user profile and fund characteristics
        """
        try:
            if not fund_data or "data" not in fund_data:
                return 0

            nav_data = fund_data["data"]
            if len(nav_data) < 2:
                return 0

            # Calculate returns and risk
            returns = []
            for i in range(1, len(nav_data)):
                try:
                    prev_nav = float(nav_data[i-1]["nav"])
                    curr_nav = float(nav_data[i]["nav"])
                    if prev_nav > 0:
                        returns.append((curr_nav - prev_nav) / prev_nav)
                except (ValueError, ZeroDivisionError):
                    continue

            if not returns:
                return 0

            # Calculate metrics
            volatility = np.std(returns) * np.sqrt(252)  # Annualized volatility
            first_nav = float(nav_data[0]["nav"])
            last_nav = float(nav_data[-1]["nav"])
            days = (datetime.strptime(nav_data[-1]["date"], "%d-%b-%Y") - 
                   datetime.strptime(nav_data[0]["date"], "%d-%b-%Y")).days
            
            if first_nav > 0 and days > 0:
                annual_return = (last_nav / first_nav) ** (365/days) - 1
            else:
                return 0

            # Score based on risk tolerance
            risk_score = 0
            if risk_tolerance == "Low" and volatility < 0.15:
                risk_score = 1
            elif risk_tolerance == "Medium" and volatility < 0.25:
                risk_score = 1
            elif risk_tolerance == "High" and volatility < 0.35:
                risk_score = 1

            # Score based on time horizon
            time_score = 0
            if time_horizon < 12 and volatility < 0.15:  # Short term
                time_score = 1
            elif 12 <= time_horizon <= 60 and volatility < 0.25:  # Medium term
                time_score = 1
            elif time_horizon > 60:  # Long term
                time_score = 1

            # Score based on returns
            return_score = 0
            if annual_return > 0.12:  # 12% annual return
                return_score = 1
            elif annual_return > 0.08:  # 8% annual return
                return_score = 0.8
            elif annual_return > 0.05:  # 5% annual return
                return_score = 0.5

            # Calculate final score
            final_score = (risk_score * 0.4 + time_score * 0.3 + return_score * 0.3)
            return final_score

        except Exception as e:
            logger.error(f"Error scoring mutual fund: {str(e)}")
            return 0

    def score_stock(self, hist_data: pd.DataFrame, risk_tolerance: str, time_horizon: int, goal: str) -> float:
        """
        Score a stock based on user profile and stock characteristics
        """
        try:
            if hist_data is None or hist_data.empty:
                return 0

            # Calculate returns and risk
            returns = hist_data["Close"].pct_change().dropna()
            volatility = returns.std() * np.sqrt(252)  # Annualized volatility
            annual_return = returns.mean() * 252

            # Score based on risk tolerance
            risk_score = 0
            if risk_tolerance == "Low" and volatility < 0.15:
                risk_score = 1
            elif risk_tolerance == "Medium" and volatility < 0.25:
                risk_score = 1
            elif risk_tolerance == "High" and volatility < 0.35:
                risk_score = 1

            # Score based on time horizon
            time_score = 0
            if time_horizon < 12 and volatility < 0.15:  # Short term
                time_score = 1
            elif 12 <= time_horizon <= 60 and volatility < 0.25:  # Medium term
                time_score = 1
            elif time_horizon > 60:  # Long term
                time_score = 1

            # Score based on returns
            return_score = 0
            if annual_return > 0.15:  # 15% annual return
                return_score = 1
            elif annual_return > 0.10:  # 10% annual return
                return_score = 0.8
            elif annual_return > 0.05:  # 5% annual return
                return_score = 0.5

            # Calculate final score
            final_score = (risk_score * 0.4 + time_score * 0.3 + return_score * 0.3)
            return final_score

        except Exception as e:
            logger.error(f"Error scoring stock: {str(e)}")
            return 0

    def score_fixed_deposit(self, fd_info: Dict, risk_tolerance: str, time_horizon: int, goal: str) -> float:
        """
        Score a fixed deposit based on user profile and FD characteristics
        """
        try:
            if not fd_info:
                return 0

            rate = fd_info.get("rate", 0) / 100  # Convert percentage to decimal
            duration = fd_info.get("duration_months", 0)

            # Score based on risk tolerance
            risk_score = 1  # Fixed deposits are always low risk

            # Score based on time horizon
            time_score = 0
            if time_horizon < 12 and duration <= 12:  # Short term
                time_score = 1
            elif 12 <= time_horizon <= 60 and duration <= 60:  # Medium term
                time_score = 1
            elif time_horizon > 60:  # Long term
                time_score = 1

            # Score based on returns
            return_score = 0
            if rate > 0.08:  # 8% interest rate
                return_score = 1
            elif rate > 0.06:  # 6% interest rate
                return_score = 0.8
            elif rate > 0.04:  # 4% interest rate
                return_score = 0.5

            # Calculate final score
            final_score = (risk_score * 0.4 + time_score * 0.3 + return_score * 0.3)
            return final_score

        except Exception as e:
            logger.error(f"Error scoring fixed deposit: {str(e)}")
            return 0

def map_risk_to_score(user_risk, fund_risk, investment_experience):
    levels = {"Low": 1, "Medium": 2, "High": 3}
    base_score = 1 - abs(levels[user_risk] - levels[fund_risk]) / 2  # Normalized
    
    # Adjust risk score based on experience
    experience_multiplier = {
        "Beginner": 0.8,  # More conservative for beginners
        "Intermediate": 1.0,  # No adjustment
        "Advanced": 1.2  # More aggressive for experienced investors
    }
    
    return base_score * experience_multiplier.get(investment_experience, 1.0)

def score_investment(fund, user_profile):
    weights = {
        "goal_match": 0.2,
        "risk_score": 0.25,
        "time_horizon_score": 0.2,
        "micro_fit": 0.15,
        "return_score": 0.1,
        "popularity_score": 0.1,
    }

    # 1. Goal Type Match (manual mapping for now)
    goal_map = {
        "Retirement": ["PPF", "NPS (Tier I)"],
        "Tax Saving": ["ELSS Tax Saver Fund"],
        "Travel": ["Liquid funds", "FD - SBI Bank", "Short Term Debt"],
        "Wealth Growth": ["Axis Bluechip Fund", "Nifty50 ETF"],
    }
    matched = fund["name"] in goal_map.get(user_profile["goal"], [])
    goal_match = 1.0 if matched else 0.5

    # 2. Risk match with experience adjustment
    risk_score = map_risk_to_score(
        user_profile["risk_tolerance"], 
        fund["risk_level"],
        user_profile.get("investment_experience", "Intermediate")
    )

    # 3. Time Horizon Fit
    liquidity_score = 1 - min(fund["liquidity_days"] / (user_profile["time_horizon_months"] * 30), 1)

    # 4. Micro-Investment Suitability
    micro_fit = 1.0 if user_profile["wants_micro_invest"] and fund["micro_invest_enabled"] else 0.5

    # 5. Return Score (normalized and adjusted for experience)
    base_return_score = fund["expected_annual_return_pct"] / 15  # Assuming 15% is upper bound
    
    # Adjust return expectations based on experience
    experience_return_multiplier = {
        "Beginner": 0.9,  # More conservative return expectations
        "Intermediate": 1.0,  # No adjustment
        "Advanced": 1.1  # Higher return expectations
    }
    
    return_score = base_return_score * experience_return_multiplier.get(
        user_profile.get("investment_experience", "Intermediate"), 
        1.0
    )

    # 6. Popularity Score
    popularity_score = fund["popular_with_users"] / 10  # Normalize to 0-1

    total_score = (
        goal_match * weights["goal_match"] +
        risk_score * weights["risk_score"] +
        liquidity_score * weights["time_horizon_score"] +
        micro_fit * weights["micro_fit"] +
        return_score * weights["return_score"] +
        popularity_score * weights["popularity_score"]
    )

    return round(total_score, 4)

def score_investments(funds, user_profile):
    """
    Scores a list of funds using the user's profile.
    Returns a list of funds with an added 'score' field.
    """
    scored = []
    for fund in funds:
        fund_copy = fund.copy()
        fund_copy['score'] = score_investment(fund, user_profile)
        scored.append(fund_copy)
    return scored
