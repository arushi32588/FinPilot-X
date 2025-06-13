# 🔐 Encrypted DB Schema & Plan for FinPilot X

## 🔸 Transactions (Collection)
| Field          | Type     | Description                              | Encrypted? |
|----------------|----------|------------------------------------------|------------|
| date           | string   | ISO date of transaction                  | ❌         |
| category       | string   | Main tag like Food, Transport            | ❌         |
| subcategory    | string   | Specific detail like "Zomato"            | ✅         |
| note           | string   | Optional free-text                       | ✅         |
| amount         | number   | INR value                                | ❌         |
| income_expense | string   | "Income" or "Expense"                    | ❌         |
| user_id        | string   | UID from Firebase Auth                   | ❌         |

## 🔸 UserSettings (Collection)
| Field            | Type     | Description                           | Encrypted? |
|------------------|----------|---------------------------------------|------------|
| user_id          | string   | Firebase Auth UID                     | ❌         |
| avatar_name      | string   | Chosen avatar name                    | ❌         |
| avatar_style     | string   | e.g. "Sassy", "Minimalist"            | ❌         |
| notify_goals     | boolean  | Enable goal reminders                 | ❌         |
| risk_preference  | string   | "Conservative", "Moderate", "Aggro"  | ❌         |

## 🔸 AgentResults (Collection)
| Field             | Type     | Description                              | Encrypted? |
|-------------------|----------|------------------------------------------|------------|
| user_id           | string   | Firebase UID                             | ❌         |
| agent_type        | string   | e.g., "ChurnPredictor", "Explainer"      | ❌         |
| timestamp         | string   | ISO datetime                             | ❌         |
| result_summary    | string   | Text summary from agent                  | ✅         |
| related_txn_ids   | array    | Related transaction IDs                  | ❌         |

## 🔐 Encryption Plan
- Sensitive text fields (like `note`, `subcategory`, `result_summary`) are AES-encrypted.
- Symmetric key stored securely using `.env` file.
- All encryption and decryption handled in backend only.

## ✅ DB Chosen: Firebase Firestore
- Pros: Seamless integration with Firebase Auth, real-time sync, no self-hosting
- Tradeoff: Pricing can increase at scale, but ideal for student MVP

