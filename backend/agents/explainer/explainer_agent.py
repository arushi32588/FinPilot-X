import os
from groq import Groq
from jinja2 import Environment, FileSystemLoader
from typing import Dict, Literal
from datetime import datetime
from .safety_filters import validate_decision, sanitize_output
from ..config import Config

class ExplainerAgent:
    def __init__(self):
        self.client = Groq(api_key=Config.GROQ_API_KEY)
        self.env = Environment(loader=FileSystemLoader("backend/agents/prompts"))

    async def explain(
        self,
        decision: str,
        factors: Dict[str, float],
        style: Literal["professional", "emoji", "genz"] = "professional"
    ) -> Dict:
        """Generate a safe explanation for a financial decision."""
        
        if not validate_decision(decision, factors):
            raise ValueError("🚨 Blocked: Risky decision detected!")
        
        template = self.env.get_template(f"{style}.jinja2")
        
        response = self.client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{
                "role": "user",
                "content": template.render(
                    decision=decision,
                    factors=factors
                )
            }],
            temperature=0.3,  
            max_tokens=400
        )
        
        explanation = sanitize_output(response.choices[0].message.content)
        
        return {
            "decision": decision,
            "explanation": explanation,
            "risk_warning": self._generate_risk_warning(factors),
            "timestamp": datetime.now().isoformat()
        }

    def _generate_risk_warning(self, factors: Dict[str, float]) -> str:
        risk_score = factors.get("high_risk", 0)
        growth_score = factors.get("potential_growth", 0)

        if risk_score > 80:
            return "Extreme Risk - Not recommended"
        elif risk_score > 60:
            return "High Risk - Consult an advisor"
        elif risk_score > 40:
            return "Moderate Risk - Diversify"
        elif growth_score > 50:
            return "Good Potential - Monitor risks"
        else:
            return "Standard Risk - OK for long term"
        
    def _generate_confidence(factors: Dict[str, float]) -> float:
        risk = factors.get("high_risk", 0)
        growth = factors.get("potential_growth", 0)
        return max(0, growth - risk / 2)  