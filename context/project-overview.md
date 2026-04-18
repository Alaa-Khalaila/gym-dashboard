# Gym Dashboard — Project Overview

> A focused, easy-to-use SaaS dashboard that gives gym owners full control over their members, subscriptions, and revenue — with the right level of access for every staff member.

---

## 1. The Problem

Most gym owners today manage members using WhatsApp messages, paper notebooks, or basic spreadsheets. This breaks down quickly as the gym grows.

**Key pain points:**

- **Lost subscriptions** — A member's plan expires unnoticed and they keep showing up for free. Revenue leaks silently.
- **No visibility** — The owner can't quickly answer "How many active members do I have right now?" without manual counting.
- **Revenue guesswork** — At month-end, there's no easy way to see how much came in, from which plans, or what to expect next month.
- **Missed renewals** — No one is reminding members their subscription is expiring. They disappear, and the owner doesn't follow up because they didn't know.
- **No staff access control** — When a receptionist manages members, the owner has no way to restrict what they can see or change — especially financial data.

**Who this is for:** Small to mid-size gym owners with 20–300 members who have outgrown informal tracking but don't need (or can't afford) a complex enterprise system.

---

## 2. User Stories

### Super Admin

- Log in securely so that only I can access financial and sensitive data.
- Create and manage normal admin accounts to control system access.
- Add, edit, and delete members with full control over the database.
- View a member's full payment history to resolve disputes or verify payments.
- Set and edit subscription plan prices at any time.
- See which subscriptions are expiring soon to follow up on renewals.
- See total monthly and yearly revenue to track gym performance.
- See revenue broken down by plan type to identify the most popular options.
- Export revenue reports for records or sharing.

### Normal Admin

- Add new members to register walk-ins quickly.
- Edit member information to keep records accurate.
- View all members and their subscription status to know who is active or expired.
- Renew a member's subscription so they can continue accessing the gym.
- See which members are expiring soon in order to notify them.

### Both Roles

- Search and filter members by name, status, or plan to find anyone quickly.
- See a dashboard overview on login with the most important info at a glance.
- Have end dates auto-calculated from the start date and plan duration.

---

## 3. Features & Prioritization

**Tiers:**
- 🟢 **MVP** — Must exist on day one.
- 🟡 **V2** — High value, but the app works without it at launch.
- 🔴 **V3** — Nice to have; adds polish or advanced capability.

### Authentication & Access Control

| Feature | Priority |
|---|---|
| Login page with role-based redirect | 🟢 MVP |
| Super Admin vs Normal Admin roles | 🟢 MVP |
| Role-based route protection | 🟢 MVP |
| Manage admin accounts (Super Admin only) | 🟡 V2 |
| Password reset | 🟡 V2 |

### Member Management

| Feature | Priority |
|---|---|
| Add new member | 🟢 MVP |
| View members list | 🟢 MVP |
| Edit member info | 🟢 MVP |
| Delete member (Super Admin only) | 🟢 MVP |
| Member profile page | 🟢 MVP |
| Search by name or phone | 🟢 MVP |
| Filter by status (Active / Expired / Expiring Soon) | 🟢 MVP |
| Filter by plan type | 🟡 V2 |
| Member notes field | 🟡 V2 |
| Member photo upload | 🔴 V3 |

### Subscription Management

| Feature | Priority |
|---|---|
| Subscription plans (1, 3, 6, 12 months) | 🟢 MVP |
| Auto-calculate end date from start date + duration | 🟢 MVP |
| Active / Expired / Expiring Soon status badge | 🟢 MVP |
| Renew a subscription | 🟢 MVP |
| View subscription history per member | 🟡 V2 |
| Edit plan pricing (Super Admin only) | 🟡 V2 |
| Bulk renewal actions | 🔴 V3 |

### Revenue & Financials *(Super Admin only)*

| Feature | Priority |
|---|---|
| Total revenue this month | 🟢 MVP |
| Total revenue this year | 🟢 MVP |
| Revenue breakdown by plan | 🟡 V2 |
| Revenue chart over time | 🟡 V2 |
| Expected upcoming revenue (pending renewals) | 🟡 V2 |
| Export revenue report (CSV/PDF) | 🔴 V3 |
| Unpaid subscriptions tracker | 🔴 V3 |

### Dashboard & Notifications

| Feature | Priority |
|---|---|
| Overview cards (active members, new this month, expiring soon) | 🟢 MVP |
| Expiring soon list (next 7 days) | 🟢 MVP |
| Revenue cards (Super Admin only) | 🟢 MVP |
| Membership growth chart | 🟡 V2 |
| In-app notification bell | 🔴 V3 |
| WhatsApp / SMS renewal reminders | 🔴 V3 |

### Internationalization (i18n)

| Feature | Priority |
|---|---|
| English language support | 🟢 MVP |
| Arabic language support (RTL layout) | 🟢 MVP |
| Language toggle in the UI | 🟢 MVP |
| RTL-aware component layout and typography | 🟢 MVP |
| Localized date and number formatting | 🟡 V2 |

### Settings

| Feature | Priority |
|---|---|
| Gym name and basic info | 🟡 V2 |
| Manage admin accounts | 🟡 V2 |
| Data export | 🔴 V3 |

---

## 4. Data Models

### User (Staff Account)
```
User {
  id          string
  name        string
  email       string
  password    string        // hashed
  role        "super_admin" | "admin"
  createdAt   date
  isActive    boolean
}
```

### Member
```
Member {
  id          string
  name        string
  phone       string
  email       string        // optional
  gender      "male" | "female"
  birthDate   date          // optional
  notes       string        // optional
  createdAt   date
  createdBy   userId
}
```

### Subscription Plan
```
Plan {
  id              string
  name            string    // e.g. "1 Month", "6 Months"
  durationMonths  number    // 1 | 3 | 6 | 12
  price           number    // set by Super Admin
  isActive        boolean
}
```

### Subscription *(the core record)*
```
Subscription {
  id             string
  memberId       string      → Member
  planId         string      → Plan
  startDate      date
  endDate        date        // auto-calculated
  paidAmount     number
  paymentStatus  "paid" | "unpaid" | "partial"
  createdAt      date
  createdBy      userId
}
```

> **Note:** Subscription status (Active / Expiring Soon / Expired) is never stored — it is always calculated live from `endDate` vs. today's date to ensure accuracy.

### Status Logic *(calculated, not stored)*
```
endDate < today             → Expired
endDate <= today + 7 days   → Expiring Soon
endDate > today + 7 days    → Active
```

### Relationships
```
User ──── creates ──→ Member
                        │
                        └── has many ──→ Subscriptions
                                              │
                                              └──→ Plan
```

### Key Design Decisions

| Decision | Reason |
|---|---|
| Status is calculated, not stored | Avoids stale data — always accurate |
| Subscription is a separate record | Preserves full history per member |
| Plan price lives on the Plan, not the Subscription | `paidAmount` on Subscription captures what was actually paid, handling discounts |
| One active subscription per member at a time | Enforced at the application logic level |

---

## 5. App Structure & Screens

### Routes

```
App
├── /login
├── /dashboard                      (both roles)
├── /members                        (both roles)
│   ├── /members/new
│   ├── /members/:id
│   └── /members/:id/edit
├── /subscriptions
│   └── /subscriptions/new          (both roles)
├── /revenue                        (Super Admin only)
└── /settings                       (Super Admin only)
    └── /settings/admins
```

### Screen Descriptions

**Login `/login`**
Authenticate and redirect by role. Super Admin → full nav dashboard. Normal Admin → limited nav dashboard.

**Dashboard `/dashboard`**
Snapshot of gym health on login. Shows: total active members, new members this month, expiring in 7 days, and — for Super Admin only — revenue cards. Also includes an expiring soon list with a quick Renew action.

**Members List `/members`**
Browse, search, and filter all members. Includes a status filter (All / Active / Expiring Soon / Expired), a members table, and quick actions. Delete is Super Admin only.

**Add Member `/members/new`**
Register a new member and assign their first subscription in one form. End date is auto-calculated and read-only.

**Member Profile `/members/:id`**
Full view of a single member: info card, current subscription with status badge and days remaining, subscription history, and — for Super Admin — payment history.

**Edit Member `/members/:id/edit`**
Pre-filled form to update member information.

**New Subscription `/subscriptions/new`**
Assign or renew a subscription for an existing member. Auto-calculates end date.

**Revenue `/revenue`** *(Super Admin only)*
Date-range revenue summary, breakdown by plan, and a monthly bar chart.

**Settings `/settings`** *(Super Admin only)*
Gym info, subscription plan pricing, and link to admin account management.

**Manage Admins `/settings/admins`** *(Super Admin only)*
List, add, deactivate, or delete admin accounts.

---

## 6. Tech Stack

### Frontend

| Layer | Tool | Reason |
|---|---|---|
| Framework | React + TypeScript | Component-based with compile-time type safety across models, API responses, and role guards |
| Styling | Tailwind CSS | Utility-first; fast to build clean dashboards without custom CSS |
| Routing | React Router v6 | Industry standard with role-based protected routes |
| State | React Context + useReducer | Right-sized for this app's scope — no Redux overhead needed |
| Charts | Recharts | Simple, React-native charting for revenue visuals |
| Icons | Lucide React | Clean, consistent icon set |
| Date handling | date-fns | Lightweight, reliable date math for end date calculation and expiry checks |
| i18n | react-i18next | Industry-standard internationalization with RTL support for Arabic |

### Backend

| Layer | Tool | Reason |
|---|---|---|
| Runtime | Node.js | JavaScript end-to-end |
| Framework | Express.js | Minimal and fast for structured REST APIs |
| Language | TypeScript | Typed request/response objects and Prisma queries |
| Auth | JWT | Stateless auth with role claims baked into the token |
| Passwords | bcrypt | Industry standard for secure password hashing |

### Database

| Layer | Tool | Reason |
|---|---|---|
| Database | PostgreSQL | Relational — fits perfectly given clear relationships between members, subscriptions, and plans |
| ORM | Prisma | Clean schema definition, auto-generated typed queries, easy migrations |

### Dev Tools

| Tool | Purpose |
|---|---|
| Vite | Fast React dev server and bundler |
| ESLint + Prettier | Code quality and consistent formatting |
| Postman | API testing during development |

### Architecture

```
┌──────────────────────────────────────┐
│    React + TypeScript Frontend       │
│  (Vite · Tailwind · React Router)    │
│  (react-i18next — EN / AR + RTL)     │
└──────────────┬───────────────────────┘
               │  REST API (JSON)
               │  JWT in Authorization header
┌──────────────▼───────────────────────┐
│   Express.js + TypeScript Backend    │
│   (Auth middleware · REST routes)    │
└──────────────┬───────────────────────┘
               │
┌──────────────▼───────────────────────┐
│      PostgreSQL + Prisma ORM         │
│  (Users · Members · Subscriptions    │
│   · Plans)                           │
└──────────────────────────────────────┘
```

### Key TypeScript Types

```typescript
type Role = "super_admin" | "admin"
type SubscriptionStatus = "active" | "expiring_soon" | "expired"
type Language = "en" | "ar"

interface Member {
  id: string
  name: string
  phone: string
  email?: string
  gender: "male" | "female"
  createdAt: Date
}

interface Subscription {
  id: string
  memberId: string
  planId: string
  startDate: Date
  endDate: Date
  paidAmount: number
  paymentStatus: "paid" | "unpaid" | "partial"
}
```

---

## 7. Internationalization (English & Arabic)

The app will support **English** and **Arabic** from the start, with the ability to switch languages in the UI.

**Implementation approach using `react-i18next`:**

- All UI strings are stored in translation files (`en.json`, `ar.json`) and referenced via translation keys — no hardcoded text in components.
- A language toggle (e.g., in the top nav or settings) switches between EN and AR and persists the choice in `localStorage`.
- Arabic requires full **RTL (right-to-left)** layout. The `dir` attribute on the root `<html>` element switches between `ltr` and `rtl`, and Tailwind's `rtl:` variant handles mirrored spacing, alignment, and directional icons.
- Dates and numbers will be formatted using `date-fns` locale support and the browser's `Intl` API to match regional conventions.

**Folder structure for translations:**
```
src/
└── locales/
    ├── en.json     // English strings
    └── ar.json     // Arabic strings
```

**Example translation keys:**
```json
// en.json
{
  "dashboard.activeMembers": "Active Members",
  "dashboard.expiringSoon": "Expiring Soon",
  "members.addNew": "Add New Member",
  "subscription.status.active": "Active",
  "subscription.status.expired": "Expired"
}

// ar.json
{
  "dashboard.activeMembers": "الأعضاء النشطون",
  "dashboard.expiringSoon": "تنتهي قريباً",
  "members.addNew": "إضافة عضو جديد",
  "subscription.status.active": "نشط",
  "subscription.status.expired": "منتهي"
}
```
