from typing import Dict


BLOCKLIST = {
    "all savings": "Never invest all your savings",
    "leveraged": "Avoid leveraged trading",
    "100% crypto": "Diversify investments"
}

def validate_decision(decision: str, factors: Dict[str, float]) -> bool:
    """Check if the decision is too risky."""
    decision_lower = decision.lower()
    
    for term, reason in BLOCKLIST.items():
        if term in decision_lower:
            return False
    
    if factors.get("high_risk", 0) > 80 and "diversify" not in decision_lower:
        return False
    
    return True

def sanitize_output(text: str) -> str:
    """Remove unrealistic promises."""
    import re
    
    text = re.sub(r"\d{2,}% (guaranteed|safe) (return|profit)", "potential returns", text, flags=re.IGNORECASE)
    
    if "crypto" in text.lower():
        text += "\n\n⚠️ Crypto Warning: High volatility | Not FDIC insured"
    
    return text