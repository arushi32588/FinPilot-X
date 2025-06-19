from datetime import datetime, timedelta
import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from investment_recommender.investment_recommender import InvestmentRecommender
from investment_recommender.market_fetcher import get_alpha_vantage_time_series, get_yfinance_history, get_mfapi_nav

def test_recommender():
    # Create a sample user profile
    user_profile = {
        "risk_tolerance": "High",  # Mapped float 0.7 to string "High"
        "income": 50000,  # Monthly income in INR
        "time_horizon_months": 24,  # Renamed from timeline_months
        "goal_amount": 100000,  # Goal of ₹1L
        "goal_date": (datetime.now() + timedelta(days=730)).strftime("%Y-%m-%d"),  # 2 years from now
        "spending_score": 0.8,  # Good spending habits (0-1 scale)
        "current_portfolio": {
            "Nifty 50 Index Fund": 0.6,
            "Liquid Fund": 0.4
        },
        "goal": "Wealth Growth",  # Added goal key
        "wants_micro_invest": True  # Added wants_micro_invest key
    }

    # Initialize recommender
    recommender = InvestmentRecommender(user_id="test_user_123")

    # Get recommendations
    recommendations = recommender.get_recommendations(user_profile)

    # Print results in a readable format
    print("\n=== Investment Recommendations ===")
    
    print("\n1. Recommended Portfolio:")
    for fund in recommendations["recommended_portfolio"]:
        print(f"- {fund['name']}: {fund['recommended_allocation_pct']}%")

    print("\n2. Micro-Investment Plan:")
    plan = recommendations["micro_investment_plan"]
    print(f"- Weekly Investment: ₹{plan['suggested_weekly']}")
    print(f"- Weeks to Goal: {plan['weeks_left']}")
    print(f"- Total Contribution: ₹{plan['total_contribution']}")

    print("\n3. Growth Simulations:")
    for scenario, growth in recommendations["growth_simulations"].items():
        final_value = growth[-1] * 100  # Convert to percentage
        print(f"- {scenario.capitalize()}: {final_value:.1f}% growth")

    if recommendations["drift_alerts"]:
        print("\n4. Portfolio Drift Alerts:")
        for alert in recommendations["drift_alerts"]:
            print(f"- {alert}")

    if recommendations["nudge"]:
        print("\n5. Investment Nudge:")
        print(f"- {recommendations['nudge']}")

    print("\n6. Gamification Status:")
    gamification = recommendations["gamification"]
    print(f"- Level: {gamification['level']}")
    print(f"- XP: {gamification['xp']}")
    print(f"- Streak: {gamification['streak']} weeks")
    if gamification["badges"]:
        print(f"- Badges: {', '.join(gamification['badges'])}")

def test_market_apis():
    print("\n=== Testing Market APIs ===")
    
    # Test Alpha Vantage
    print("\n1. Alpha Vantage Test:")
    av_data = get_alpha_vantage_time_series("AAPL")
    if av_data and "Weekly Time Series" in av_data:
        print("Alpha Vantage data received:", list(av_data["Weekly Time Series"].keys())[:3])
    else:
        print("Alpha Vantage data not received or invalid.")
    
    # Test yFinance
    print("\n2. yFinance Test:")
    yf_data = get_yfinance_history("AAPL")
    if yf_data is not None and not yf_data.empty:
        print("yFinance data received:", yf_data.head())
    else:
        print("yFinance data not received or empty.")
    
    # Test MFAPI
    print("\n3. MFAPI Test:")
    mf_data = get_mfapi_nav("119551")  # SBI Bluechip Fund
    if mf_data and "data" in mf_data:
        print("MFAPI data received:", mf_data["data"][0])
    else:
        print("MFAPI data not received or invalid.")

if __name__ == "__main__":
    test_market_apis()  # Run API tests first
    test_recommender()  # Then run the recommender test 