from explainer import explain_decision

user_input = "Invest in government bonds to balance your high-risk crypto portfolio."

tone = "normal" 

result = explain_decision(user_input, tone)
print(f"\n[{tone.upper()} Explanation]")
print(result)
