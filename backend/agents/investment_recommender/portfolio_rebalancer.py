# portfolio_rebalancer.py

def calculate_target_allocation(time_remaining_years: float, risk_level: str):
    """
    Glide path logic: dynamically shift asset allocation
    """
    if risk_level == "low":
        equity = max(0.2, 0.6 - 0.05 * time_remaining_years)
    elif risk_level == "high":
        equity = min(0.9, 0.8 - 0.02 * time_remaining_years)
    else:  # medium
        equity = min(0.75, 0.7 - 0.03 * time_remaining_years)

    debt = 1.0 - equity
    return {"equity": round(equity, 2), "debt": round(debt, 2)}


def detect_allocation_drift(current_allocation: dict, target_allocation: dict, threshold: float = 0.1):
    """
    Compares current and target allocations.
    Returns True if rebalancing is needed.
    """
    drift_report = {}
    rebalance_needed = False

    for asset in target_allocation:
        drift = abs(current_allocation.get(asset, 0) - target_allocation[asset])
        drift_report[asset] = round(drift, 2)
        if drift > threshold:
            rebalance_needed = True

    return rebalance_needed, drift_report


def suggest_rebalance(current_allocation, goal_time_years, user_risk):
    """
    Main rebalancer logic
    """
    target = calculate_target_allocation(goal_time_years, user_risk)
    should_rebalance, drift = detect_allocation_drift(current_allocation, target)

    return {
        "target_allocation": target,
        "drift": drift,
        "rebalance_required": should_rebalance
    }
