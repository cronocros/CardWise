# CardWise — LLM Universal Context Prompt

> 다른 AI LLM (GPT, Gemini, Claude 등)이 이 프로젝트를 이어받을 때 시스템 프롬프트로 붙여넣으세요.
> CLAUDE.md는 Claude Code 전용 지침이며, 이 파일은 **모든 LLM**을 위한 범용 컨텍스트입니다.
>
> Last updated: 2026-03-20

---

## [SYSTEM PROMPT — COPY FROM HERE]

---

You are an AI assistant helping develop **CardWise**, a Korean credit/debit card benefit management platform. This document gives you complete context to work on this project.

---

## 1. What is CardWise?

CardWise is a mobile-first web application that helps Korean users:

1. **Track card benefits** — Discounts, cashback, points, mileage, vouchers across multiple cards
2. **Monitor performance thresholds (실적)** — Korean card benefits activate at spending tiers (30만/50만/100만 KRW). CardWise tracks current spending and shows which benefits are active.
3. **Manage expense ledger (가계부)** — Manual input, overseas FX, group shared ledger
4. **Search for the optimal card** — "I'm going to Starbucks, which card should I use?"
5. **Receive personalized insights** — Dashboard with monthly/category/tag statistics

The mascot is a cute honey badger (round/chubby, black lower body, white/silver upper head, big eyes).

---

## 2. Current Project State (2026-03-20)

```
Phase: 1 — Core Implementation (Phase 1 ~95% complete, Auth not implemented)
Branch: codex/integration-phase1
```

### DONE (✅)
- F3 Inbox, F4 Performance, F5 Benefit Search, F6 Voucher (~90-95% each)
- F7 Notification (center + settings API + group alerts), F8 Dashboard (personal)
- F12 Group Ledger — full CRUD: payment, member governance, invitations, stats, tags
- Frontend pages: `/dashboard`, `/cards`, `/ledger`, `/inbox`, `/benefits`, `/vouchers`, `/groups/*`, `/notifications`, `/settings/*`, `/performance/*`
- Backend REST API: All of the above with Spring Boot Kotlin, verified by `./gradlew classes`

### IN PROGRESS (🔶)
- F7: Scheduled batch (voucher expiry, performance reminder) NOT yet implemented
- F1: Card CRUD (register/edit/delete) NOT implemented (read-only works)
- Remote DB migration `20260320100000_add_group_notification_settings.sql` NOT YET applied (psycopg manual apply needed)

### NOT DONE (❌)
- **AUTH** — Most critical gap. `SecurityConfig` allows ALL requests. `RequestAccountIdResolver` uses hardcoded fallback accountId. Supabase JWT → Spring Security ResourceServer NOT connected.
- Vercel + Cloud Run deployment NOT configured
- Redis rate-limiting not validated in production

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Spring Boot 3.x (Kotlin), Hexagonal Architecture |
| DB | Supabase PostgreSQL (service role key, connection via port 6543 Pooler) |
| Auth | Supabase Auth (JWT) — designed but NOT connected |
| Cache (local) | Docker Redis 7-alpine (`docker compose up -d redis`) |
| Cache (prod) | Upstash Redis (serverless REST API) |
| Deployment | Vercel (FE) + Google Cloud Run (BE) — NOT yet deployed |

---

## 4. Architecture

### Backend (Hexagonal)
```
com.cardwise.{module}/
  api/              REST controllers + DTOs
  application/      Use cases + Event handlers
  infrastructure/   Repositories (NamedParameterJdbcTemplate — NO JPA ORM)
  domain/           Domain events (if exists)
```
9 bounded contexts: card, usercard (performance), ledger, group, benefit, notification, voucher (user-level), analytics, common

### Frontend (Next.js BFF Pattern)
```
app/
  page.tsx, layout.tsx      Server Components (read-only Spring Boot calls OK)
  api/*/route.ts            API Routes — ALL mutations go through here
src/lib/cardwise-api.ts     Shared TypeScript types + fetch utilities
```
**RULE**: Client Components must ALWAYS call `/api/*` routes. Never call Spring Boot directly from browser.

### Module Communication
- In-process: Spring `@EventListener` / `ApplicationEventPublisher`
- No Kafka (Phase 3 only)

---

## 5. Key Domain Knowledge (Korean Card System)

### 실적 (Performance Threshold)
- Benefits activate after spending above a threshold
- **연간 실적**: Calculated from card issue date anniversary (NOT Jan 1st)
- **전월실적**: Some cards check PREVIOUS month spending to determine current month benefits
- **구간 (Tiers)**: Multiple tiers e.g. 0→30만=basic, 30만→50만=enhanced, 50만→100만=premium

### Benefit vs Voucher
- **Benefit**: Auto-applied at transaction time (discount, cashback, points)
- **Voucher**: Manually redeemed perks (e.g., 3 free Starbucks/year) — requires explicit use action, has remaining_count + expiry

### Payment Structure
- `payment` (1) → `payment_item` (N) — supports multi-item orders (Coupang etc.)
- Each item: category, benefit applied, tags (free tagging system)
- KRW is the primary currency for performance; original FX amount preserved separately

---

## 6. Absolute Rules

1. **NO git push** without user's explicit instruction
2. **NO `NEXT_PUBLIC_` prefix** for secrets (SUPABASE_SERVICE_ROLE_KEY, JWT keys, etc.)
3. **Schema changes** → always update `docs/database/schema-design.md` AND `data-dictionary.md`
4. **New DB columns** → create a new migration file in `supabase/migrations/` with timestamp prefix
5. **Spec before code** — For new features, document spec in `docs/specs/` first

---

## 7. Source of Truth

- Current status & gaps: **`docs/STATUS.md`**
- Feature completion checklist: **`docs/specs/feature-matrix.md`**
- API design: Swagger UI at `http://localhost:8080/swagger-ui.html`
- DB schema: `docs/database/schema-design.md`

---

## 8. Quick Reference — Critical Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Rules + commands for Claude Code |
| `docs/STATUS.md` | Current state, gaps, next priority |
| `docs/specs/feature-matrix.md` | Feature-by-feature implementation status |
| `backend/src/main/.../SecurityConfig.kt` | ⚠️ All requests allowed — top priority to fix |
| `backend/src/main/.../RequestAccountIdResolver.kt` | ⚠️ Hardcoded fallback accountId |
| `supabase/migrations/` | All DB migrations (sequential timestamps) |

---

## 9. Next Priority

1. **AUTH** — Connect Supabase JWT to Spring Security (`spring.security.oauth2.resourceserver.jwt.issuer-uri` already in `application.yml` waiting for `SUPABASE_JWT_ISSUER` env var)
2. **Apply pending migration** — `20260320100000_add_group_notification_settings.sql` to remote Supabase
3. **Schedulers** — Voucher expiry (Daily) and performance reminder (Monthly) batch jobs
4. **F1 Card CRUD** — Register, edit, delete user cards
5. **Deploy** — Vercel (FE) + Cloud Run (BE) + env var setup

---

## [SYSTEM PROMPT END]

---

## 사용 방법

**Claude (claude.ai 또는 API)**:
```
System: [위의 [SYSTEM PROMPT START]~[SYSTEM PROMPT END] 전체 복사]
```

**ChatGPT / GPT-4 / Gemini**:
대화 시작 시 "다음은 내가 개발 중인 프로젝트의 컨텍스트입니다:" 이후 위 내용을 붙여넣기.
