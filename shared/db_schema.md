# Database Schema for FinPilot X

## Collection: transactions

| Field        | Type     | Encrypted? | Description                           |
|--------------|----------|------------|-------------------------------------|
| user_id      | string   | No         | User unique ID                      |
| timestamp    | datetime | No         | When transaction happened           |
| amount       | number   | No         | Amount of transaction                |
| type         | string   | No         | 'income' or 'expense'                |
| category     | string   | No         | Classified category (e.g. Food)      |
| subcategory  | string   | Yes        | Detailed description (encrypted)    |
| note         | string   | Yes        | Additional notes (encrypted)         |
| description  | string   | Yes        | Original transaction description (encrypted) |

## Encryption Strategy

- Use AES symmetric encryption via `cryptography.fernet`.
- Encrypt `subcategory`, `note`, `description` fields before saving.
- Store encryption key securely in environment variable `FINPILOT_ENC_KEY`.
- Decrypt fields after fetching before displaying or processing.
