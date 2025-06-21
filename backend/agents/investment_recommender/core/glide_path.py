def get_glide_weights(months_left):
    """
    Returns equity/debt/safe weights depending on how far the goal is.
    """
    if months_left >= 60:  # 5+ years
        return {"Equity": 0.7, "Debt": 0.2, "Safe": 0.1}
    elif months_left >= 36:
        return {"Equity": 0.55, "Debt": 0.35, "Safe": 0.1}
    elif months_left >= 24:
        return {"Equity": 0.4, "Debt": 0.4, "Safe": 0.2}
    elif months_left >= 12:
        return {"Equity": 0.25, "Debt": 0.45, "Safe": 0.3}
    else:
        return {"Equity": 0.1, "Debt": 0.4, "Safe": 0.5}

def classify_fund_type(fund_name, fund_type):
    """
    Maps the fund into high-level asset class for glide path.
    """
    if fund_type in ["Equity", "Commodity"]:
        return "Equity"
    elif fund_type in ["Debt", "Hybrid"]:
        return "Debt"
    else:
        return "Safe"
