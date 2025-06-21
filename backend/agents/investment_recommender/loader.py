import csv

def load_investment_data(csv_path):
    investments = []
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Convert types properly
            investment = {
                "id": int(row["id"]),
                "name": row["name"],
                "type": row["type"],
                "expected_annual_return_pct": float(row["expected_annual_return_pct"]),
                "risk_level": row["risk_level"],
                "min_investment": int(row["min_investment"]),
                "liquidity_days": int(row["liquidity_days"]),
                "volatility_index": float(row["volatility_index"]),
                "micro_invest_enabled": row["micro_invest_enabled"].lower() == "true",
                "popular_with_users": float(row["popular_with_users"]),
            }
            investments.append(investment)
    return investments

# Example usage
investments = load_investment_data("backend/data/mock_investments.csv")
print(investments[:2])  # See the first 2 to check
