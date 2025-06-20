import json
from income_analyzer import IncomeAnalyzer

def test_analysis():
    analyzer = IncomeAnalyzer()
    result = analyzer.analyze("test.csv")

    print("\n📊 Classified Transactions:\n")
    for txn in result["transactions"]:
        clean_txn = {
            "source": txn["source"],
            "amount": txn["amount"],
            "confidence": txn["confidence"],
            "notes": txn["notes"]
        }
        print(json.dumps(clean_txn, indent=2))

    print("\n📈 Insights:\n")
    print(json.dumps(result["insights"], indent=2))

    print("\n🧾 LLM Summary:\n")
    summary = analyzer.explain_with_llm(result)
    print(summary)


if __name__ == "__main__":
    test_analysis()
