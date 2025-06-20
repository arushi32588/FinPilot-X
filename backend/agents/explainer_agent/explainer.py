import os
import requests
from jinja2 import Environment, FileSystemLoader
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

env = Environment(loader=FileSystemLoader("prompts"))

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
