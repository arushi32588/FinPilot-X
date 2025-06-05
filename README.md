# FinPilot X: Your Finance AI Alter Ego!

> GenAI + Multi-Agent Fintech System with ML + Human-in-the-Loop Safety + Gamified UX  
> 🛠️ Built for students & early earners to take control of their finances — smartly, securely, and collaboratively.

---

## 🔍 Project Overview

**FinPilot X** is a real-time, AI-powered, multi-agent personal finance platform. It acts as your **autonomous financial co-pilot**, helping you:

- Track income and spending
- Plan goals using natural language
- Get investment suggestions
- Detect fraud or anomalies
- Make decisions together with AI
- And **gamify financial literacy**

It is **Gen Z-centric**, safety-first, and designed to be explainable, collaborative, and offline-capable.

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
    Backend --> IncomeAgent["Income Analyzer Agent"] & SpendingAgent["Spending Classifier Agent"] & GoalPlanner["Goal Planner Agent [GenAI]"] & InvestmentRec["Investment Recommender Agent"] & ChurnModel["Churn Prediction ML Model"] & DecisionAgent["Decision-Making Agent"] & ExplainerAgent["Explainer Agent [GenAI]"] & AnomalyAgent["Anomaly & Fraud Detection Agent"] & HITL["Human-in-the-loop Safety System"] & AuthService["Auth Service OAuth2 / Firebase Auth"] & CollabService["Collaborative Shared Expense Module"]
    DecisionAgent --> IncomeAgent & SpendingAgent & GoalPlanner & InvestmentRec & ChurnModel & AnomalyAgent & ExplainerAgent & HITL
    Backend -- Encrypted Reads/Writes --> DB["Encrypted Database"]
    DB --> IncomeAgent & SpendingAgent & GoalPlanner & InvestmentRec & ChurnModel & AnomalyAgent & DecisionAgent
    Frontend --> OfflineCache["Offline Storage IndexedDB / PWA Cache"]
    OfflineCache -- Sync --> Backend
    CollabService --> DB & DecisionAgent & Frontend
    InvestmentRec -- Calls --> FinanceAPIs["Mock Finance APIs Zerodha/Groww"]
    GoalPlanner -- Calls --> GPTAPI["OpenAI GPT-4 API"]
    ExplainerAgent -- Calls --> GPTAPI
    AuthService -- Token --> Frontend
    style UI fill:#f9f,stroke:#333,stroke-width:2px
    style Frontend fill:#aaf,stroke:#333,stroke-width:2px
    style Backend fill:#bbf,stroke:#333,stroke-width:2px
    style HITL fill:#fbb,stroke:#333,stroke-width:2px
    style DB fill:#afa,stroke:#333,stroke-width:2px
    style OfflineCache fill:#fea,stroke:#333,stroke-width:2px
    style GPTAPI fill:#fcf,stroke:#333,stroke-width:2px

