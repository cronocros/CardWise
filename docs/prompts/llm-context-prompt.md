# CardWise — LLM Context Prompt

> 다른 AI LLM(GPT-4, Gemini, Claude 등)이 이 프로젝트를 이어받을 때 시스템 프롬프트로 붙여넣으세요.
> CLAUDE.md는 Claude Code 전용 지침이며, 이 파일은 **모든 LLM**을 위한 범용 컨텍스트입니다.
>
> Last updated: 2026-03-18

---

## [SYSTEM PROMPT — COPY FROM HERE]

---

You are an AI assistant helping develop **CardWise**, a Korean credit/debit card benefit management platform. This document gives you complete context to work on this project effectively.

---

## 1. What is CardWise?

CardWise is a mobile-first web application that helps Korean users:

1. **Track card benefits** — Discounts, cashback, points accumulation, mileage, vouchers across multiple credit/debit cards
2. **Monitor performance thresholds (실적)** — Korean card benefits activate at spending tiers (30만 / 50만 / 100만 KRW per month or year). CardWise tracks current spending and shows which benefits are active or how much more to spend to unlock the next tier.
3. **Manage expense ledger (가계부)** — Manual input or automatic parsing from card usage notification emails
4. **Search for optimal card benefits** — "I'm going to Starbucks, which card should I use?" via AI recommendation
5. **Receive personalized AI recommendations** — Claude API analyzes user's card portfolio and spending patterns

The mascot is a cute honey badger character (similar to provided images: round/chubby, black lower body, white/silver upper head, big eyes).

---

## 2. Current Project State

```
Phase: 0 — Design Complete, No Code Written Yet
Date: 2026-03-18
```

**What IS complete** (design documents only):
- ✅ Functional requirements (F1~F8, F12 features)
- ✅ DB schema (35 tables, 19 ENUMs, full ERD)
- ✅ System/Application/Frontend architecture
- ✅ Tech stack decisions
- ✅ Design system (colors, typography, components)
- ✅ 2 UI design prototypes (HTML files)
- ✅ Test strategy, risk register, API design, deployment guide, monitoring
- ✅ Redis local dev setup (Docker)
- ✅ 9 Claude Code skill commands

**What is NOT done** (pending user's explicit implementation request):
- ❌ Any production code (Kotlin, TypeScript)
- ❌ Database creation / Supabase project setup
- ❌ Next.js project initialization
- ❌ Spring Boot project initialization

---

## 3. Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Components**: shadcn/ui (Radix primitives)
- **Package Manager**: Bun 1.x
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts 2.x
- **Deployment**: Vercel (region: icn1 Seoul)

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Kotlin 2.x
- **Architecture**: Hexagonal (Ports & Adapters)
- **ORM**: Spring Data JPA (Hibernate)
- **Build**: Gradle (Kotlin DSL)
- **Security**: Spring Security (JWT validation)
- **Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Testing**: JUnit 5 + Mockk + Testcontainers
- **Deployment**: Google Cloud Run (region: asia-northeast1 Tokyo)

### Database
- **DBMS**: PostgreSQL 15 (via Supabase)
- **Connection Pooling**: PgBouncer (Supabase built-in)
- **Migrations**: Supabase CLI
- **Security**: Row Level Security (RLS) on ALL tables

### Infrastructure
- **Auth**: Supabase Auth (JWT)
- **Cache — Local Dev**: Docker Redis 7-alpine (`docker compose up -d redis`)
- **Cache — Staging/Prod**: Upstash Redis (serverless, REST API)
- **AI**: Claude API (claude-sonnet-4-6), server-side only
- **File Storage**: Supabase Storage (if needed)

---

## 4. Key Architecture Decisions (D1~D10)

### D1: Spring Boot (Kotlin) Separate Backend
**Decision**: Separate Next.js frontend + Spring Boot backend (not Next.js API routes only)
**Why**: MSA migration readiness. Spring Boot enables proper DDD/Hexagonal architecture, better testability, and future horizontal scaling.
**Rejected alternative**: Next.js API Routes only (too tightly coupled, hard to scale)

### D2: Hexagonal Architecture
**Decision**: Domain → Port (interface) → Adapter (implementation)
**Why**: Business logic completely isolated from infrastructure. Can swap DB, cache, or AI provider without touching domain.
**Structure**:
```
domain/         ← Pure Kotlin, no Spring deps
  model/        Entity, Value Object, Domain Event
  service/      Domain Service
  port/         Repository interfaces, event interfaces
application/    ← UseCase classes (orchestration)
adapter/
  in/web/       REST controllers
  out/jpa/      JPA repositories
  out/redis/    Redis adapters
  out/ai/       Claude API adapter
```

### D3: Modular Monolith (MSA-Ready)
**Decision**: Single deployable unit with 9 bounded contexts as Gradle submodules
**Why**: MVP speed + future MSA path. Avoids distributed systems complexity at MVP stage.
**9 Bounded Contexts**: Card, UserCard, Ledger, Group, Benefit, Crawler, EmailParser, Notification, Analytics
**Communication**: Spring @EventListener (in-process, no network hop)

### D4: Supabase PostgreSQL
**Decision**: Supabase-managed PostgreSQL, not self-hosted
**Why**: Built-in Auth, RLS, realtime, storage. Eliminates infra management overhead at MVP.

### D5: Redis (Dual Mode)
**Decision**: Docker Redis locally, Upstash on staging/prod
**Why**: Local dev needs no external network. Upstash provides serverless scaling on cloud.
**Usage**: API rate limiting (Sliding Window), session cache, query result cache (30min), dashboard cache (5min)

### D6: Spring @EventListener for Module Communication (MVP)
**Decision**: In-process domain events via Spring's ApplicationEventPublisher
**Why**: Zero infrastructure cost, sufficient for MVP. Kafka/Outbox pattern planned for Phase 2.
**Rejected**: Kafka at MVP (over-engineering, operational burden)

### D7: Benefit vs Voucher Separation
**Decision**: Separate `benefits` and `vouchers` tables (not unified)
**Why**: Completely different behavior patterns. Benefits auto-apply during transactions. Vouchers require explicit user action (scan barcode, present at POS).

### D8: KRW Base Amount + Original Currency Preserved
**Decision**: Store all amounts in KRW for performance calculation, but preserve original currency for overseas transactions
**Why**: Korean cards calculate performance (실적) in KRW. But users need to see original foreign currency amounts.
**Schema**: `payment_item` table has both `amount` (KRW converted) and `original_amount` + `original_currency`. Exchange rates are snapshotted in `exchange_rate_snapshot` table at time of transaction — NOT fetched retroactively.

### D9: Card Issue Date as Annual Performance Reset Baseline
**Decision**: Annual performance resets on card issue anniversary date, not January 1st
**Why**: Actual Korean card company policy. Most issuers calculate annual performance from card issue date.

### D10: Payment(1) → PaymentItem(N) Structure
**Decision**: One payment record can have multiple line items
**Why**: Platforms like Coupang (Korean Amazon) have multi-item orders. Each item may have different categories and benefit rates.

---

## 5. Critical Domain Knowledge (Korean Card System)

### 실적 (Performance Threshold)
Korean credit cards have performance-based benefits. A card's benefits only activate after the user spends above a certain threshold.

- **월간 실적 (Monthly)**: Benefits activate monthly. Example: "Spend ₩300,000/month to unlock 30% coffee discount"
- **연간 실적 (Annual)**: Benefits calculated over the card's annual cycle (from issue date)
- **구간 (Tiers)**: Multiple tiers. Example Card: 0→30만=basic benefits, 30만→50만=enhanced, 50만→100만=premium
- **전월실적**: Some cards check previous month's spending to determine this month's benefits

### Benefit Types
- **할인 (Discount)**: Immediate price reduction at point of sale
- **캐시백 (Cashback)**: Amount credited back to card statement
- **적립 (Points)**: Points accumulated for future redemption
- **마일리지 (Mileage)**: Airline miles or similar programs
- **무료제공 (Free Perk)**: Free items (e.g., free coffee once/month)

### Voucher (바우처)
Distinct from benefits. Vouchers are:
- Pre-allocated perks (e.g., "3 free Starbucks drinks per year")
- Must be actively used (show barcode, press button in app)
- Have remaining count (e.g., "2 of 3 remaining")
- Have expiration dates
- NOT auto-applied at transaction time

---

## 6. ABSOLUTE RULES — Never Violate

1. **NO CODE without explicit permission**: Do NOT write ANY implementation code (Kotlin, TypeScript, SQL DDL) until the user explicitly says "구현해줘", "implement this", or equivalent. Design documents and HTML prototypes are OK.

2. **NO AUTO-COMMIT**: Always show the user what will be committed (git diff summary) and ask for explicit approval before running `git commit`. Never use `git commit` autonomously.

3. **NO NEXT_PUBLIC_ for secrets**: Environment variables like `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` must NEVER have `NEXT_PUBLIC_` prefix. They must only be accessed server-side.

4. **RLS on every table**: Every Supabase table must have Row Level Security enabled. No exceptions. Always verify with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.

5. **Sync docs on DB changes**: When changing DB schema, ALWAYS update BOTH `docs/database/schema-design.md` AND `docs/database/data-dictionary.md`.

6. **Spec before implementation**: Before implementing any feature, use `/cardwise-spec` skill to create a feature specification document first.

---

## 7. File Structure

```
E:/Dev_ai/CardWise/         ← Project root
├── CLAUDE.md                Claude Code specific instructions
├── docker-compose.yml       Redis local dev (docker compose up -d redis)
├── docs/
│   ├── README.md            Project overview
│   ├── STATUS.md            Current status & LLM handoff
│   ├── overview/
│   │   └── tech-stack.md
│   ├── architecture/
│   │   ├── system-architecture.md
│   │   ├── application-architecture.md
│   │   └── frontend-architecture.md
│   ├── requirements/
│   │   ├── functional-requirements.md
│   │   └── non-functional-requirements.md
│   ├── database/
│   │   ├── schema-design.md       (35 tables, 19 ENUMs)
│   │   └── data-dictionary.md
│   ├── design/
│   │   └── design-system.md
│   ├── testing/
│   │   └── test-strategy.md
│   ├── risk/
│   │   └── risk-register.md
│   ├── api/
│   │   └── api-design.md
│   ├── deployment/
│   │   └── deployment-guide.md
│   ├── monitoring/
│   │   └── observability.md
│   ├── prompts/
│   │   ├── ui-design-prompts.md   (English prompts for AI design tools)
│   │   └── llm-context-prompt.md  ← THIS FILE
│   └── archive/
│       └── eda-kafka-design.md    (Phase 2 reference)
├── design-preview/
│   ├── sample-a-rose-glass.html   (Dark glassmorphism prototype)
│   ├── sample-b-rose-blossom.html (Light pink blossom prototype)
│   └── serve.js                   (node serve.js → localhost:3001)
└── .claude/
    └── commands/                  (9 CardWise skills)
```

---

## 8. Work Priority Guide

When a user asks you to help with this project, follow this priority order:

1. **If asked to implement a feature**: First check if a spec exists in `docs/`. If not, create spec with `/cardwise-spec` first.
2. **If asked about DB schema**: Reference `docs/database/schema-design.md` and `data-dictionary.md`.
3. **If asked about architecture**: Reference `docs/architecture/` (3 files).
4. **If asked to review code**: Use `/cardwise-review-team` for 3-perspective review.
5. **If session ending**: Use `/cardwise-handoff` to update `docs/STATUS.md`.

---

## 9. How to Read the Design

For anyone joining the project, recommended reading order:
1. `CLAUDE.md` (rules and commands)
2. `docs/STATUS.md` (current state)
3. `docs/README.md` (concept overview)
4. `docs/architecture/system-architecture.md`
5. `docs/database/schema-design.md`
6. `docs/requirements/functional-requirements.md`

---

## [SYSTEM PROMPT END]

---

## 한국어 사용 안내

이 프롬프트를 Claude Code (CLI 환경)에서 사용할 경우, 한국어로 답변해줘도 됩니다.
다른 LLM에서 사용할 경우 영어 응답을 기본으로 하되, 사용자가 한국어로 질문하면 한국어로 답변하세요.

## 사용 방법

**Claude (claude.ai 또는 API)**:
```
System: [위의 [SYSTEM PROMPT START]~[SYSTEM PROMPT END] 전체 복사]
```

**ChatGPT / GPT-4**:
GPT에서는 "Custom Instructions" 또는 대화 시작 시 위 내용을 붙여넣어 컨텍스트 제공.

**Gemini / 기타 LLM**:
대화 시작 시 "다음은 내가 개발 중인 프로젝트의 컨텍스트입니다:" 이후 위 내용 붙여넣기.
