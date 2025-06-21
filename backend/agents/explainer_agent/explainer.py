import os
import requests
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

<<<<<<< HEAD
# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))
prompts_dir = os.path.join(current_dir, "prompts")
env = Environment(loader=FileSystemLoader(prompts_dir))
=======
env = Environment(loader=FileSystemLoader("prompts"))
>>>>>>> origin/master

def get_prompt(decision: str, tone: str) -> str:
    template = env.get_template(f"{tone}.j2")
    return template.render(decision=decision)

def explain_decision(decision: str, tone: str = "normal"):
    prompt = get_prompt(decision, tone)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": prompt}
        ],
        "temperature": 0.7
    }

    response = requests.post(GROQ_ENDPOINT, headers=headers, json=payload)

    try:
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print("Error:", response.text)
        raise e
<<<<<<< HEAD

class ExplainerAgent:
    def __init__(self):
        pass
    
    async def explain(self, decision: str, factors: dict) -> dict:
        """
        Explain a decision based on the given factors.
        
        Args:
            decision: The decision to explain
            factors: Dictionary of factors that influenced the decision
            
        Returns:
            Dictionary containing the explanation
        """
        try:
            # Create a comprehensive explanation using the factors
            explanation_text = explain_decision(decision, "normal")
            
            return {
                "explanation": explanation_text,
                "factors": factors,
                "decision": decision
            }
        except Exception as e:
            return {
                "explanation": f"Unable to generate explanation: {str(e)}",
                "factors": factors,
                "decision": decision
            }
=======
>>>>>>> origin/master
