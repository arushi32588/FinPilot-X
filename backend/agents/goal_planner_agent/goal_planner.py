import os
import requests
import json
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv
from datetime import datetime

<<<<<<< HEAD
# Load .env file from the backend directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)  # Go up one level to backend/
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)
=======
load_dotenv()
>>>>>>> origin/master

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

<<<<<<< HEAD
# Debug: Check if API key is loaded
if GROQ_API_KEY:
    print(f"API Key loaded: {GROQ_API_KEY[:10]}...")
else:
    print("No API key found in environment")

# Get the directory where this script is located
templates_dir = os.path.join(current_dir, "templates")
env = Environment(loader=FileSystemLoader(templates_dir))
=======
env = Environment(loader=FileSystemLoader("templates"))
>>>>>>> origin/master

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
<<<<<<< HEAD
        
        # First, try to find JSON within markdown code blocks
        import re
        
        # Look for JSON in markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Look for JSON object in the text (anything between { and })
        json_match = re.search(r'\{.*?\}', response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        # If no JSON found, try to parse the entire response
        clean_text = response_text.strip()
        return json.loads(clean_text)
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse response: {response_text}")
        print(f"JSON decode error: {str(e)}")
=======
            
        # Remove markdown code blocks if present
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except json.JSONDecodeError:
        print(f"Failed to parse response: {response_text}")
>>>>>>> origin/master
        return None

def make_llm_request(headers, payload):
    """Make LLM request with improved error handling."""
    try:
        response = requests.post(GROQ_ENDPOINT, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {str(e)}")
<<<<<<< HEAD
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response content: {e.response.text}")
=======
>>>>>>> origin/master
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
    
<<<<<<< HEAD
    # Check if API key is available
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
        # Provide a mock response for testing
        print("No valid GROQ_API_KEY found. Using mock response for testing.")
        return create_mock_goal_plan(user_input)
    
=======
>>>>>>> origin/master
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
<<<<<<< HEAD
=======
            "response_format": {"type": "json_object"},
>>>>>>> origin/master
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
<<<<<<< HEAD
=======
            "response_format": {"type": "json_object"},
>>>>>>> origin/master
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
<<<<<<< HEAD
        return default_response

def create_mock_goal_plan(user_input: str) -> dict:
    """Create a mock goal plan for testing when API key is not available."""
    import re
    
    # Simple parsing for common patterns
    amount_match = re.search(r'₹?(\d+(?:,\d+)*(?:\.\d+)?)', user_input)
    target_amount = float(amount_match.group(1).replace(',', '')) if amount_match else 50000
    
    # Determine goal type based on keywords
    goal_type = "other"
    if any(word in user_input.lower() for word in ['trip', 'travel', 'vacation', 'goa', 'bali']):
        goal_type = "travel"
    elif any(word in user_input.lower() for word in ['education', 'course', 'study', 'mba', 'degree']):
        goal_type = "education"
    elif any(word in user_input.lower() for word in ['emergency', 'fund', 'safety']):
        goal_type = "emergency"
    elif any(word in user_input.lower() for word in ['luxury', 'watch', 'car', 'expensive']):
        goal_type = "luxury"
    elif any(word in user_input.lower() for word in ['health', 'medical', 'operation', 'treatment']):
        goal_type = "health"
    
    # Extract deadline if mentioned
    deadline = "Not specified"
    month_patterns = [
        r'by\s+(january|february|march|april|may|june|july|august|september|october|november|december)',
        r'in\s+(january|february|march|april|may|june|july|august|september|october|november|december)',
        r'next\s+(january|february|march|april|may|june|july|august|september|october|november|december)'
    ]
    
    for pattern in month_patterns:
        match = re.search(pattern, user_input.lower())
        if match:
            deadline = match.group(1).title()
            break
    
    months_remaining = calculate_months_remaining(deadline)
    monthly_plan = round(target_amount / months_remaining, 2)
    
    # Create goal name
    goal = f"Save ₹{target_amount:,.0f}"
    if goal_type == "travel":
        goal = f"Travel Fund - ₹{target_amount:,.0f}"
    elif goal_type == "education":
        goal = f"Education Fund - ₹{target_amount:,.0f}"
    elif goal_type == "emergency":
        goal = f"Emergency Fund - ₹{target_amount:,.0f}"
    elif goal_type == "luxury":
        goal = f"Luxury Purchase - ₹{target_amount:,.0f}"
    elif goal_type == "health":
        goal = f"Healthcare Fund - ₹{target_amount:,.0f}"
    
    # Mock suggestions based on goal type
    suggestions_map = {
        "travel": [
            f"Set aside ₹{monthly_plan:,.0f} every month in a travel savings account",
            "Look for travel deals and discounts to maximize your budget",
            "Consider using travel credit cards for additional benefits"
        ],
        "education": [
            f"Save ₹{monthly_plan:,.0f} monthly in an education-focused investment",
            "Research scholarships and financial aid opportunities",
            "Consider part-time work or freelance opportunities"
        ],
        "emergency": [
            f"Build your emergency fund with ₹{monthly_plan:,.0f} monthly contributions",
            "Keep emergency savings in a high-yield savings account",
            "Aim for 3-6 months of living expenses"
        ],
        "luxury": [
            f"Save ₹{monthly_plan:,.0f} each month for your luxury purchase",
            "Consider if this purchase aligns with your long-term financial goals",
            "Look for financing options with low interest rates"
        ],
        "health": [
            f"Contribute ₹{monthly_plan:,.0f} monthly to your healthcare fund",
            "Review your health insurance coverage",
            "Consider health savings accounts (HSA) if eligible"
        ],
        "other": [
            f"Save ₹{monthly_plan:,.0f} every month towards your goal",
            "Review your budget to identify additional savings opportunities",
            "Consider setting up automatic transfers to stay on track"
        ]
    }
    
    motivation_quotes = [
        "The best time to start saving was yesterday. The second best time is now.",
        "Small steps today lead to big achievements tomorrow.",
        "Your future self will thank you for the sacrifices you make today.",
        "Financial freedom is not about having money, it's about having choices.",
        "Every rupee saved is a step closer to your dreams."
    ]
    
    import random
    return {
        "goal": goal,
        "goal_type": goal_type,
        "target_amount": target_amount,
        "deadline": deadline,
        "monthly_plan": monthly_plan,
        "months_remaining": months_remaining,
        "suggested_actions": suggestions_map.get(goal_type, suggestions_map["other"]),
        "motivation_quote": random.choice(motivation_quotes)
    }
=======
        return default_response
>>>>>>> origin/master
