# Gym Dashboard — AI Interactions (Reduced)

## 1. Overview

AI assists gym admins in 3 tasks (not autonomous):

| Feature | Purpose | Access |
|---|---|---|
| Renewal Reminders | Draft short WhatsApp/SMS messages | All |
| Member Insights | Summarize member history + flags | All |
| Revenue Forecast | Predict next month revenue | Super Admin |

---

## 2. Architecture

- Frontend → Backend → Claude API → Backend → Frontend  
- AI calls are **server-side only**

**Why:**
- Secure API key  
- Use validated DB data  
- Central rate limiting & caching  

---

## 3. Shared Rules

**Model:** `claude-sonnet-4-20250514`

**Response format:**
```json
{ "success": true, "data": {} }
```

**AI must return JSON only**

**Language:**
- Controlled via `language` param (`en` / `ar`)
- Arabic = Modern Standard Arabic

**Prompt rules:**
- No raw user input
- Always structured templates

---

## 4. Feature 1 — Renewal Reminder

**Goal:** Generate short personalized message

**Trigger:**  
Member is `expiring_soon` or `expired`

**Input:**
```ts
{
  memberName,
  daysRemaining,
  planName,
  gymName,
  language
}
```

**Output:**
```json
{
  "message": "...",
  "tone": "friendly"
}
```

**Rules:**
- < 60 words
- Friendly, not pushy
- Use first name
- No pricing

---

## 5. Feature 2 — Member Insights

**Goal:** Summarize engagement + detect patterns

**Input:**
```ts
{
  memberName,
  memberSince,
  language,
  subscriptionHistory[]
}
```

**Output:**
```json
{
  "summary": "...",
  "flags": [
    {
      "type": "positive|warning|neutral",
      "label": "...",
      "detail": "..."
    }
  ]
}
```

**Rules:**
- Summary: max 2–3 sentences
- Flags must be factual (no guessing)
- No pricing

---

## 6. Feature 3 — Revenue Forecast

**Goal:** Predict next month revenue

**Input:**
```ts
{
  gymName,
  language,
  last6Months[],
  expiringNext30Days[],
  currentMonthToDate
}
```

**Output:**
```json
{
  "forecastMin": number,
  "forecastMax": number,
  "forecastMid": number,
  "confidence": "low|medium|high",
  "explanation": "...",
  "renewalAssumption": number
}
```

**Rules:**
- Use only given data
- Allow uncertainty (ranges)
- Explanation < 80 words
- No business advice

---

## 7. API Endpoints

| Endpoint | Role |
|---|---|
| `POST /ai/renewal-reminder` | All |
| `POST /ai/member-insights` | All |
| `POST /ai/revenue-forecast` | Super Admin |

**Common errors:**
- `404` not found  
- `400` invalid data  
- `403` forbidden  
- `502` AI failure  

---

## 8. Prompt Guidelines

- Always data-driven  
- Define exact JSON output  
- Explicit constraints (tone, length, exclusions)  
- Always specify language  
- Separate system vs user prompts  
- Test EN + AR  

---

## 9. Error Handling

**AI failure:**
```json
{
  "success": false,
  "message": "AI service unavailable"
}
```

**Invalid JSON:**
- Log raw response
- Return `502`

---

## 10. Rate Limits & Cost

| Endpoint | Limit |
|---|---|
| Renewal | 30/hr |
| Insights | 20/hr |
| Forecast | 10/hr |

**Optimizations:**
- Reminder cooldown: 60s  
- Insights cooldown: 10s  
- Forecast cache: 1h  

**Token budget:**
| Feature | Input | Output |
|---|---|---|
| Reminder | ~300 | 150 |
| Insights | ~800 | 300 |
| Forecast | ~1000 | 400 |

