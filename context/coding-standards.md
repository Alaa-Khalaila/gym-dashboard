# Gym Dashboard — Coding Standards (Reduced)

## 1. Core Principles

- Clarity > cleverness
- Single responsibility per function/component
- No magic values → use constants/enums
- Fail loud (dev), fail graceful (prod)

---

## 2. Project Structure

### Frontend

```
src/
├── components/ (shared UI)
├── features/ (feature modules)
├── hooks/
├── context/
├── pages/
├── services/ (API layer)
├── types/
├── utils/
├── constants/
```

**Feature structure:**
```
features/members/
├── components/
├── hooks/
├── types.ts
└── index.ts
```

### Backend

```
src/
├── routes/
├── controllers/
├── services/
├── middleware/
├── prisma/
├── utils/
├── types/
├── constants/
```

---

## 3. TypeScript

- `strict` mode always ON
- Use `interface` (objects), `type` (unions)
- Avoid `any` → use `unknown`
- Use enums for fixed values

**API response:**
```ts
interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; message: string }
type ApiResponse<T> = ApiSuccess<T> | ApiError
```

---

## 4. React Rules

- Functional components only
- Named exports (default only for pages)
- Define `Props` interface
- Split components >150 lines

**Hooks:**
- `useX` → data
- `useXForm` → forms
- No fetch inside components

**Rendering:**
```ts
if (loading) return <Spinner />
if (error) return <Error />
return <Content />
```

---

## 5. Tailwind Rules

- No inline styles
- Extract repeated UI → components
- Use logical properties (RTL safe)

| Avoid | Use |
|---|---|
| pl/ml | ps/ms |
| text-left | text-start |

---

## 6. State Management

- Local → `useState`
- Global → Context (auth, language)
- Server data → hooks (NOT context)

**Auth state:**
```ts
interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
}
```

---

## 7. API Layer

- All calls via `services/`
- No `fetch` in components

```ts
const memberService = {
  getAll: () => apiClient.get("/members")
}
```

---

## 8. Backend Pattern

**Flow:** Route → Controller → Service

- Routes: define endpoints
- Controllers: handle req/res
- Services: business logic + DB

**Validation:** use `zod`

**Response format:**
```json
{ "success": true, "data": {} }
```

---

## 9. Database (Prisma)

- Models: PascalCase
- Fields: camelCase
- Always use service layer (no direct DB in controllers)

---

## 10. Auth

- JWT with: `sub`, `role`
- Expiry: 8h (config)

**Middleware:**
- `authenticate`
- `requireRole`

---

## 11. i18n

- No hardcoded strings
- Use `t("feature.key")`
- Keep `en.json` & `ar.json` in sync

---

## 12. Error Handling

**Frontend:**
- Always handle: loading / error / success

**Backend:**
- Global error handler
- Use `AppError`

---

## 13. Naming

| Item | Style |
|---|---|
| Variables | camelCase |
| Types | PascalCase |
| Constants | UPPER_CASE |
| Components | PascalCase |
| APIs | kebab-case |

**Booleans:** `is/has/can`

---

## 14. Files

- One component per file
- Use `index.ts` only for exports
- `.env.example` must exist

---

## 15. Git

**Branches:**
- `main`, `dev`, `feature/*`, `fix/*`

**Commits:**
```
feat(scope): description
```

Types: feat, fix, chore, refactor, docs, test

- Use imperative
- < 72 chars

---

## Result

- ~70% fewer tokens
- Same rules, faster onboarding
- Easier for AI + devs

