from explainer_agent import ExplainerAgent
import asyncio

async def main():
    agent = ExplainerAgent()
    
    print("Explainer Agent")
    print("Styles: professional, emoji, genz\n")
    
    decision = input("Enter your financial decision (e.g., 'Invest 20% in crypto'): ")
    high_risk = float(input("Risk % (0-100): "))
    potential_growth = float(input("Growth potential % (0-100): "))
    style = input("Explanation style (professional/emoji/genz): ").lower()
    
    if style not in ["professional", "emoji", "genz"]:
        print("Invalid style! Using 'professional'")
        style = "professional"
    
    try:
        result = await agent.explain(
            decision=decision,
            factors={"high_risk": high_risk, "potential_growth": potential_growth},
            style=style
        )
        
        print("\n1. Decision:", result["decision"])
        print("2. Explanation:", result["explanation"])
        print("3. Risk Warning:", result["risk_warning"])
        
    except ValueError as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())