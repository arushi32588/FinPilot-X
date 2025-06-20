import csv
import json
import re
import statistics
from collections import Counter
from pathlib import Path
from typing import Dict, List, Any
from dotenv import load_dotenv
import requests
from jinja2 import Environment, FileSystemLoader
import os
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"


class IncomeAnalyzer:
    def __init__(self):
        self.categories = self._load_categories()
        self.primary_threshold = 5000  # INR
        self.GROQ_API_KEY = GROQ_API_KEY
        self.env = Environment(loader=FileSystemLoader("templates"))
        self.GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

    def _load_categories(self) -> Dict:
        with open(Path(__file__).parent / 'categories.json') as f:
            return json.load(f)

    def _read_csv(self, filepath: str) -> List[Dict]:
        with open(filepath, mode='r', encoding='utf-8-sig') as f:
            return list(csv.DictReader(f))

    def analyze(self, filepath: str) -> Dict[str, Any]:
        transactions = self._read_csv(filepath)
        credits = [t for t in transactions if t['Type'].lower() == 'credit']

        analyzed_transactions = []
        total_income = 0
        uncategorized = 0
        category_totals = {}
        income_values = []
        source_counter = Counter()

        for t in credits:
            result = self._classify_transaction(t)
            analyzed_transactions.append(result)
            amount = result['amount']
            source = result['source']

            income_values.append(amount)
            source_counter[source] += 1
            total_income += amount

            if source == 'other':
                uncategorized += amount
            else:
                category_totals[source] = category_totals.get(source, 0) + amount

        stability_score = self._calculate_stability_score(income_values)
        primary_sources, secondary_sources = self._split_primary_secondary(category_totals, source_counter)
        anomalies = self._detect_anomalies(analyzed_transactions)

        return {
            "currency": "INR",
            "monthly_total": total_income,
            "uncategorized": uncategorized,
            "sources": dict(sorted(category_totals.items(), key=lambda x: x[1], reverse=True)),
            "transactions": analyzed_transactions,
            "insights": {
                "income_stability_score": round(stability_score, 2),
                "primary_sources": primary_sources,
                "secondary_sources": secondary_sources,
                "anomalies": anomalies
            }
        }

    def explain_with_llm(self, analysis: Dict[str, Any]) -> str:
        template = self.env.get_template("summary.j2")
        prompt = template.render(**analysis)

        headers = {
            "Authorization": f"Bearer {self.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "llama3-8b-8192",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.4
        }

        response = requests.post(self.GROQ_ENDPOINT, headers=headers, json=payload)
        return response.json()["choices"][0]["message"]["content"]

    def _classify_transaction(self, transaction: Dict) -> Dict:
        desc = transaction['Description'].lower()
        amount = float(transaction['Amount'])

        category, confidence = self._match_category(desc)

        notes = []
        if 'razorpay' in desc:
            notes.append("Received via Razorpay")
        if 'gpay' in desc or 'google pay' in desc or 'upi' in desc:
            notes.append("Received via UPI")
        if amount > self.primary_threshold:
            notes.append("Likely primary income")

        return {
            "source": category,
            "amount": amount,
            "confidence": round(confidence, 2),
            "notes": "; ".join(notes) if notes else "No additional notes",
            "raw_description": desc
        }

    def _match_category(self, desc: str) -> (str, float):
        for category, keywords in self.categories.items():
            for kw in keywords:
                if re.search(rf"\b{kw}\b", desc):
                    return category, 0.9
        return 'other', 0.4

    def _calculate_stability_score(self, income_values: List[float]) -> float:
        if len(income_values) < 2:
            return 0.0
        mean = sum(income_values) / len(income_values)
        std_dev = statistics.stdev(income_values)
        return max(0.0, min(1.0, 1 - (std_dev / mean)))

    def _split_primary_secondary(self, category_totals: Dict[str, float], source_counter: Counter) -> (List[str], List[str]):
        primary, secondary = [], []
        for source, total in category_totals.items():
            if total >= self.primary_threshold or source_counter[source] > 1:
                primary.append(source)
            else:
                secondary.append(source)
        return primary, secondary

    def _detect_anomalies(self, transactions: List[Dict]) -> List[Dict]:
        amounts = [txn["amount"] for txn in transactions]
        if len(amounts) < 2:
            return []
        mean = sum(amounts) / len(amounts)
        std_dev = statistics.stdev(amounts)

        anomalies = []
        for txn in transactions:
            if abs(txn["amount"] - mean) > 2 * std_dev or txn["confidence"] < 0.5:
                anomalies.append({
                    "source": txn["source"],
                    "amount": txn["amount"],
                    "reason": "Low confidence or statistical outlier",
                    "notes": txn["notes"]
                })
        return anomalies
