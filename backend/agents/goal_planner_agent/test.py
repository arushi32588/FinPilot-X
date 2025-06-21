from goal_planner import parse_goal_to_plan
import json
from datetime import datetime

def run_test_case(user_input, description):
    print(f"\n{'='*50}")
    print(f"Test Case: {description}")
    print(f"User Input: '{user_input}'")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-"*50)
    
    try:
        result = parse_goal_to_plan(user_input)
        print("Result:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {str(e)}")
    print("="*50)

# Test cases
test_cases = [
    {
        "input": "I want to go to Goa in December with a ₹15000 budget",
        "description": "Standard travel goal with month and amount"
    },
    {
        "input": "Need to save ₹50000 for emergency fund by next June",
        "description": "Emergency fund with future month"
    },
    {
        "input": "Planning for MBA admission requiring ₹200000 by August 2025",
        "description": "Education goal with year specified"
    },
    {
        "input": "Save ₹10000 for new phone",
        "description": "Missing deadline - should handle default"
    },
    {
        "input": "Want to buy a luxury watch worth ₹75000 by March",
        "description": "Luxury item with specific month"
    },
    {
        "input": "Medical operation costing ₹300000 needed soon",
        "description": "Health goal with urgency"
    },
    {
        "input": "₹5000 for birthday party",
        "description": "Minimal information provided"
    },
    {
        "input": "This is not a valid financial goal",
        "description": "Invalid input - should error gracefully"
    }
]

# Run all test cases
for case in test_cases:
    run_test_case(case["input"], case["description"])

# Additional edge case
current_month = datetime.now().strftime("%B")
run_test_case(
    f"I need ₹10000 by {current_month} for urgent car repairs",
    "Edge case - deadline in current month"
)