from .glide_path import get_glide_weights, classify_fund_type

def allocate_investments(investments, user_profile):
    """
    Allocates investment percentages using scoring + glide logic.
    """
    months_left = user_profile["time_horizon_months"]
    glide_weights = get_glide_weights(months_left)

    allocations = []
    total_weight = 0

    # Classify funds & assign glide weight
    for fund in investments:
        category = classify_fund_type(fund["name"], fund["type"])
        glide_weight = glide_weights[category]
        total_score = fund["score"] * glide_weight
        allocations.append({**fund, "allocation_score": total_score})
        total_weight += total_score

    # Normalize allocations to 100%
    for fund in allocations:
        fund["recommended_allocation_pct"] = round((fund["allocation_score"] / total_weight) * 100, 2)

    # Sort by allocation
    allocations.sort(key=lambda x: x["recommended_allocation_pct"], reverse=True)
    return allocations
