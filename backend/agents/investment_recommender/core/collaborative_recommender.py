from collections import defaultdict

def recommend_collaborative(user_profile, all_users_data, top_n=3):
    """
    Recommend popular funds among users with similar goals/risk/income.

    user_profile: dict with keys like "risk", "income", "timeline"
    all_users_data: list of dicts with keys: "risk", "income", "timeline", "invested_funds"
    """
    similarity_scores = []
    
    # Compare current user to each historical user
    for other in all_users_data:
        risk_score = 1 - abs(user_profile["risk"] - other["risk"])  # normalized
        income_score = 1 - abs(user_profile["income"] - other["income"]) / max(user_profile["income"], 1)
        time_score = 1 - abs(user_profile["timeline"] - other["timeline"]) / max(user_profile["timeline"], 1)

        overall_similarity = (risk_score + income_score + time_score) / 3
        similarity_scores.append((overall_similarity, other["invested_funds"]))

    # Weighted vote for each fund
    fund_votes = defaultdict(float)

    for sim, funds in similarity_scores:
        for fund in funds:
            fund_votes[fund] += sim

    # Sort top funds
    sorted_funds = sorted(fund_votes.items(), key=lambda x: x[1], reverse=True)
    recommendations = [fund for fund, score in sorted_funds[:top_n]]

    return recommendations
