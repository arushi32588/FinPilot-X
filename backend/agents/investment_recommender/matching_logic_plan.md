🎯 Goal:
To match users with 2–4 investment options that suit their:

Profile (e.g., student, freelancer)

Financial goal (e.g., save for Goa trip, emergency fund)

Time horizon (in months)

Risk tolerance (if known)

🧩 1. Inputs to the Agent
Input	Type	Example
goal	string (NL)	"I want to save for a Goa trip in 3 months"
profile_type	enum	Student, Freelancer, Part-Time, Full-Time
risk_preference	optional enum	Low, Medium, High
available_amount	number	5000
duration_months	derived or input	3

🧠 2. Matching Logic Flow

Step 1: Parse user's natural language goal (already being handled in Goal Planner)
→ extract goal_type & duration

Step 2: Filter `investment_mock_data.json` by:
  ✅ `duration_months` <= user duration
  ✅ `min_investment` <= available_amount
  ✅ `suitable_for` includes user's profile
  ✅ `goal_type` overlaps with user goal_type

Step 3: If risk_preference is provided, match that too
Else, default to: Student → Low, Freelancer → Medium, Full-Time → High

Step 4: Rank filtered options by:
  - Best match on goal_type
  - Closest match to risk
  - Highest return %

Step 5: Return top 2–4 suggestions
🧪 3. Example Output
{
  "recommendations": [
    {
      "id": "inv001",
      "name": "SBI Recurring Deposit",
      "expected_return": "6.5%",
      "reason": "Low-risk, suitable for student, matches goal 'Emergency Fund'"
    },
    {
      "id": "inv003",
      "name": "Nifty 50 Index Fund",
      "expected_return": "10.5%",
      "reason": "Medium-risk, good for 3+ month goal, fits freelancer profile"
    }
  ]
}
