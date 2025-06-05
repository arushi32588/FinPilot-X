# 💸 FinPilot X: Your Autonomous AI Wealth Avatar

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

## 🚀 MVP Feature List

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

## 🧠 System Architecture (Mermaid.js)

```mermaid
graph TD
  A[FinPilot X System] --> B[Frontend (React + PWA)]
  A --> C[Backend (FastAPI)]
  A --> D[Multi-Agent Core (LangGraph)]
  A --> E[ML Models]
  A --> F[GenAI Integrations]
  A --> G[Storage & Security]
  A --> H[Auth & Identity]
  A --> I[Offline + Shared Mode]
  
  B --> B1[React + Tailwind UI]
  B --> B2[Lottie Avatars + Charts]
  B --> B3[PWA + IndexedDB: Offline Sync]

  C --> C1[FastAPI Routes]
  C --> C2[LangGraph Orchestrator]
  C --> C3[LangChain for LLMs]

  D --> D1[Income Agent]
  D --> D2[Spending Classifier]
  D --> D3[Goal Planner (GenAI)]
  D --> D4[Investment Recommender]
  D --> D5[Decision Maker]
  D --> D6[Explainer (GenAI)]
  D --> D7[Anomaly/Fraud Detector]

  E --> E1[Churn Predictor (scikit-learn)]
  E --> E2[Behavior Clusterer]
  E --> E3[Anomaly Detector]

  F --> F1[GPT-4 for Goal Planning]
  F --> F2[Whisper Voice Interface]
  F --> F3[Output Validators]

  G --> G1[Encrypted PostgreSQL/Firebase]
  G --> G2[SQLAlchemy ORM]
  G --> G3[AES Encryption Layer]

  H --> H1[OAuth2 or Firebase Auth]
  H --> H2[JWT Token Handling]
  
  I --> I1[Shared Wallet Rooms]
  I --> I2[Offline Transaction Cache]

