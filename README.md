# FinPilot X: Your Finance AI Alter Ego!

> GenAI + Multi-Agent Fintech System with ML + Human-in-the-Loop Safety + Gamified UX  
> Built for students & early earners to take control of their finances — smartly, securely, and collaboratively.

---

## Project Overview

**FinPilot X** is a real-time, AI-based, multi-agent personal finance platform. It acts as your **autonomous financial co-pilot**, helping you:

- Track income and spending
- Plan goals using natural language
- Get investment suggestions
- Detect fraud or anomalies
- Make decisions together with AI
- And **gamify financial literacy**

It is a safety-first platform, and is designed to be explainable, collaborative, and offline-capable.

---

## Feature List

| Feature                             | Description                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| Income Analyzer Agent               | Parses income streams: salary, gifts, freelance                            |
| Spending Classifier Agent          | Tags and classifies real-time or uploaded transactions                     |
| Goal Planner Agent (GenAI)         | Converts vague goals into structured savings plans                         |
| Investment Recommender Agent       | Recommends mock low-risk or growth investments                             |
| Churn Prediction ML Model          | Flags high-risk months for overspending                                    |
| Decision-Making Agent              | Aggregates inputs, makes suggestions (user-approved only)                  |
| Explainer Agent (GenAI)            | Explains why a financial action was suggested (e.g., move ₹2,000 to savings)|
| Anomaly & Fraud Detector Agent     | Uses ML to catch suspicious transactions                                   |
| Offline Mode                       | Allows local tracking, syncs later                                          |
| Shared Collaborative Expenses      | Manage shared budgets with roommates/family                                |
| Encrypted Storage                  | Secure, AES-encrypted PostgreSQL or Firebase                               |
| Authentication                     | OAuth2 / Firebase Auth with JWT support                                    |
| React Dashboard                    | Clean UI with avatars, charts, summaries                                   |
| CSV Import                         | Upload bank statements or transaction files                                |
| Gamified UX                        | XP system, evolving avatars, unlockable badges                             |

---

## System Architecture

```mermaid

flowchart TD
    UI["User Interfaces"] -- React Web Dashboard --> Frontend["Frontend: React + Tailwind"]
    UI -- CSV Upload --> Frontend
    UI -- Auth OAuth2/Firebase --> Frontend
    UI -- Offline Mode Sync --> Frontend
    Frontend -- REST/gRPC/WebSocket --> Backend["Backend: FastAPI"]
    Backend --> IncomeAgent["Income Analyzer Agent"] 
    Backend --> SpendingAgent["Spending Classifier Agent"] 
    Backend --> GoalPlanner["Goal Planner Agent [GenAI]"] 
    Backend --> InvestmentRec["Investment Recommender Agent"] 
    Backend --> ChurnModel["Churn Prediction ML Model"] 
    Backend --> DecisionAgent["Decision-Making Agent"] 
    Backend --> ExplainerAgent["Explainer Agent [GenAI]"] 
    Backend --> AnomalyAgent["Anomaly & Fraud Detection Agent"] 
    Backend --> HITL["Human-in-the-loop Safety System"] 
    Backend --> AuthService["Auth Service OAuth2 / Firebase Auth"] 
    Backend --> CollabService["Collaborative Shared Expense Module"]

    DecisionAgent --> IncomeAgent 
    DecisionAgent --> SpendingAgent 
    DecisionAgent --> GoalPlanner 
    DecisionAgent --> InvestmentRec 
    DecisionAgent --> ChurnModel 
    DecisionAgent --> AnomalyAgent 
    DecisionAgent --> ExplainerAgent 
    DecisionAgent --> HITL

    Backend -- Encrypted Reads/Writes --> DB["Encrypted Database"]
    DB --> IncomeAgent 
    DB --> SpendingAgent 
    DB --> GoalPlanner 
    DB --> InvestmentRec 
    DB --> ChurnModel 
    DB --> AnomalyAgent 
    DB --> DecisionAgent

    Frontend --> OfflineCache["Offline Storage IndexedDB / PWA Cache"]
    OfflineCache -- Sync --> Backend

    CollabService --> DB 
    CollabService --> DecisionAgent 
    CollabService --> Frontend

    InvestmentRec -- Calls --> FinanceAPIs["Mock Finance APIs Zerodha/Groww"]
    GoalPlanner -- Calls --> GPTAPI["OpenAI GPT-4 API"]
    ExplainerAgent -- Calls --> GPTAPI
    AuthService -- Token --> Frontend


