import os
import requests
import json
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

env = Environment(loader=FileSystemLoader("templates"))

def calculate_months_remaining(deadline_str):
    """Calculate months between now and the deadline month."""
    try:
        if not deadline_str or deadline_str.lower() == "not specified":
            return 3  # Default if no deadline
        
        current_date = datetime.now()
        # Extract just the month name (handles "June 2025" or "next June")
        month_name = deadline_str.split()[0].strip()
        deadline_month = datetime.strptime(month_name, "%B").month
        
        months_remaining = deadline_month - current_date.month
        if months_remaining <= 0:
            months_remaining += 12
        return max(1, months_remaining)  # Ensure at least 1 month
    except:
        return 3  # Default value if parsing fails

def parse_json_response(response_text):
    """Extract JSON from LLM response text."""
    try:
        if not response_text:
            return None
            
        # Remove markdown code blocks if present
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except json.JSONDecodeError:
        print(f"Failed to parse response: {response_text}")
        return None

def make_llm_request(headers, payload):
    """Make LLM request with improved error handling."""
    try:
        response = requests.post(GROQ_ENDPOINT, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
        return None

def validate_extracted_data(data):
    """Validate the extracted data from LLM."""
    if not data:
        return False
        
    required_fields = ["goal", "goal_type", "target_amount"]
    for field in required_fields:
        if field not in data or not data[field]:
            return False
            
    try:
        target_amount = float(data["target_amount"])
        if target_amount <= 0:
            return False
    except (ValueError, TypeError):
        return False
        
    return True

def parse_goal_to_plan(user_input: str) -> dict:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    default_response = {
        "goal": "Error",
        "goal_type": "other",
        "target_amount": 0,
        "deadline": "Not specified",
        "monthly_plan": 0,
        "months_remaining": 0,
        "suggested_actions": ["Please check your input and try again"],
        "motivation_quote": "Every problem is an opportunity in disguise"
    }
    
    try:
        # Step 1: Extract structured data from input
        template = env.get_template("extraction_prompt.j2")
        extraction_prompt = template.render(user_input=user_input)
        
        extraction_payload = {
            "model": "llama3-8b-8192",
            "messages": [
                {
                    "role": "system", 
                    "content": "Extract financial goal details from user input. Return ONLY valid JSON."
                },
                {"role": "user", "content": extraction_prompt}
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "max_tokens": 200
        }
        
        response_text = make_llm_request(headers, extraction_payload)
        if not response_text:
            default_response["error"] = "Failed to get response from API"
            return default_response
            
        extracted_data = parse_json_response(response_text)
        if not validate_extracted_data(extracted_data):
            default_response["error"] = "Invalid data extracted from input"
            return default_response
        
        # Process extracted data
        target_amount = float(extracted_data["target_amount"])
        deadline = extracted_data.get("deadline", "Not specified")
        goal = extracted_data["goal"]
        goal_type = extracted_data["goal_type"]
        
        months_remaining = calculate_months_remaining(deadline)
        monthly_plan = round(target_amount / months_remaining, 2)
        
        # Step 2: Get suggestions
        suggestion_prompt = env.get_template("suggestion_prompt.j2")
        suggestion_prompt_text = suggestion_prompt.render(
            goal=goal,
            goal_type=goal_type,
            target_amount=target_amount,
            months_remaining=months_remaining,
            monthly_plan=monthly_plan
        )
        
        suggestion_payload = {
            "model": "llama3-8b-8192",
            "messages": [
                {
                    "role": "system", 
                    "content": "Provide financial planning suggestions. Return ONLY valid JSON."
                },
                {"role": "user", "content": suggestion_prompt_text}
            ],
            "temperature": 0.7,
            "response_format": {"type": "json_object"},
            "max_tokens": 300
        }
        
        suggestions_text = make_llm_request(headers, suggestion_payload)
        suggestions = parse_json_response(suggestions_text) if suggestions_text else None
        
        if not suggestions:
            suggestions = {
                "actions": [
                    f"Set aside ₹{monthly_plan} every month",
                    "Review your budget for savings opportunities"
                ],
                "quote": "Start saving today for a better tomorrow"
            }
        
        return {
            "goal": goal,
            "goal_type": goal_type,
            "target_amount": target_amount,
            "deadline": deadline,
            "monthly_plan": monthly_plan,
            "months_remaining": months_remaining,
            "suggested_actions": suggestions.get("actions", []),
            "motivation_quote": suggestions.get("quote", "")
        }
        
    except ValueError as e:
        default_response["error"] = f"Value error: {str(e)}"
        return default_response
    except Exception as e:
        default_response["error"] = f"Unexpected error: {str(e)}"
        return default_response