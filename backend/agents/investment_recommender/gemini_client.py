import google.generativeai as genai
import json

GEMINI_API_KEY = "AIzaSyDgHmOnRFjDcb_G5Z3-gRBRq7QCQ3nZVMw"

genai.configure(api_key=GEMINI_API_KEY)

def improve_portfolio_with_gemini(user_profile, initial_portfolio):
    """
    Send user profile and initial portfolio to Gemini, get improved portfolio, micro-investment plan, and growth simulations based on Indian market trends.
    Returns a dict with keys: improved_portfolio, micro_investment_plan, growth_simulations.
    """
    prompt = f"""
You are a financial advisor specializing in the Indian market. Given the user's investment profile and the initial recommended portfolio (you can ignore and remove if you think it is not good), analyze and improve and diversify the portfolio (3 or more unless 2 gives extreme benefits) based on current Indian market trends, sector rotation, and best practices for Indian retail investors. Please give accurate numbers.

- Consider recent trends in Indian equities, mutual funds, and macroeconomic factors (e.g., RBI policy, inflation, sector performance).
- Suggest changes to asset allocation, fund/stock selection, or risk management if needed.
- If you recommend removing or adding any investment, explain why.
- Take into account that for short term (0-36 months) bank fd/debt mutual fund are best, for medium term (48-84 months) multi-asset fund/balanced-advantage fund are best, and for long term (84 months+) equity mutual funds/direct equity are best.
- Also consider the user's provided inflation rate to recommend the best asset allocation and ensure that the goal gap goes in surplus for sure but also ensure that the user doesnt invest more than his goal amount if provided (obviously).

- For each investment in the improved_portfolio array, include:
    - expected_return (float, %, annualized): The expected nominal annual return for this investment option, based on current market conditions and historical data.

In addition to the improved portfolio, also provide:
- A micro-investment plan as a JSON object with the following fields:
    - weekly_investment (float, INR)
    - weeks_to_goal (int)
    - total_contribution (float, INR).
Be accurate with your numbers (after looking at the user's salary, monthly investment capacity and target) and calculations.
- Growth simulations as a JSON object with three scenarios: normal, crash, boom. Each scenario should have:
    - mean (float, %)
    - std_dev (float, %)
    - percentile_5 (float, %)
    - percentile_95 (float, %)

Output a single JSON object with the following keys:
- improved_portfolio: JSON array (as before, with rationale for each investment, and now with expected_return for each)
- micro_investment_plan: JSON object (as above)
- growth_simulations: JSON object (as above)

User profile:
{json.dumps(user_profile, indent=2)}

Initial recommended portfolio:
{json.dumps(initial_portfolio, indent=2)}

Strictly output only the JSON object. Do not include any explanation or text outside the JSON.
"""

    client = genai.GenerativeModel("gemini-2.5-flash")
    response = client.generate_content(prompt)
    text = response.text

    # Extract the JSON object from the response
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        json_str = text[start:end]
        result = json.loads(json_str)
        return result
    except Exception as e:
        raise RuntimeError(f"Failed to parse Gemini response: {e}\nRaw response: {text}")