📄 API Contracts
This document defines the input/output structure of key agent APIs used in the FinPilot X system.

🧠 /classify-spending
Method: POST
Description: Classifies a batch of transactions into predefined spending categories using ML.

🔸 Request Body
{
  "transactions": [
    {
      "id": "txn_001",
      "date": "2025-06-01",
      "description": "Domino's pizza dinner",
      "amount": 450.0,
      "merchant": "Domino's"
    },
    {
      "id": "txn_002",
      "date": "2025-06-02",
      "description": "Ola cab to airport",
      "amount": 670.0
    }
  ]
}

Fields:
id (optional): String — Transaction ID
date (required): String — Format YYYY-MM-DD
description (required): String — Free-form text
amount (required): Float — Transaction amount
merchant (optional): String — Vendor/merchant name

🔸 Success Response
If transaction id is provided:
{
  "classified_transactions": [
    {
      "id": "txn_001",
      "category": "Food"
    },
    {
      "id": "txn_002",
      "category": "Transportation"
    }
  ]
}

If transaction id is not provided:
{
  "classified_transactions": [
    {
      "index": 0,
      "category": "Food"
    },
    {
      "index": 1,
      "category": "Transportation"
    }
  ]
}

🔸 Error Response
{
  "error": "Missing required field 'description' in transaction 2."
}

🚀 /recommend-investments
Method: POST
Description: Suggests investment options based on user profile, savings, and preferences.

🔸 Request Body
{
  "user_profile": {
    "age": 21,
    "monthly_income": 25000,
    "risk_tolerance": "low",
    "current_savings": 30000,
    "goals": [
      {
        "name": "Goa Trip",
        "amount": 10000,
        "target_date": "2025-12-15"
      }
    ]
  }
}

Fields:
age: Integer — User’s age
monthly_income: Float — After-tax monthly income
risk_tolerance: String — low, medium, high
current_savings: Float — Current liquid savings
goals: List — Each goal with name, amount, target_date

🔸 Success Response
{
  "recommendations": [
    {
      "instrument": "Liquid Mutual Fund",
      "platform": "Groww",
      "expected_return": "6.5%",
      "risk_level": "Low",
      "reason": "Matches short-term low-risk goal: Goa Trip"
    },
    {
      "instrument": "Recurring Deposit",
      "platform": "BankMockAPI",
      "expected_return": "7%",
      "risk_level": "Low",
      "reason": "Low volatility + consistent return"
    }
  ]
}

🔸 Error Response
{
  "error": "Missing field 'current_savings' in user_profile"
}
