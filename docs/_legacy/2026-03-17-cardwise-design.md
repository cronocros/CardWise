# CardWise - Design Specification

## Context

CardWise는 한국 신용카드/체크카드 혜택 관리 플랫폼이다. 사용자가 보유한 카드의 혜택(할인, 적립, 바우처 등)을 한눈에 파악하고, 실제 사용 현황을 추적하며, 가계부 기능을 통해 지출을 관리하고, 가맹점 검색 시 최적의 카드를 추천받을 수 있다. 모든 데이터를 통계화하여 인사이트를 제공한다.

추후 실제 서비스 론칭을 목표로 하며, Freemium 모델로 수익화한다.

---

## 핵심 요구사항

1. **혜택 파악**: 내가 가진 카드의 바우처 및 베네핏 혜택 정보를 한눈에 파악
2. **사용 현황 관리**: 바우처 및 베네핏의 실제 적용 현황과 사용 여부를 추적/관리
3. **가계부 관리**: 결제 내역 기록, 혜택 적용 확인, 지출 관리
4. **혜택 검색**: 가맹점/카테고리 검색 시 혜택 적용 가능 카드 추천
5. **통계/인사이트**: 모든 데이터를 통계화하여 분석하고 인사이트 제공

---

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Spring Boot (Kotlin) + Hexagonal Architecture |
| DB | Supabase PostgreSQL |
| Auth | Supabase Auth (JWT) |
| 배포 | Vercel (Frontend) + TBD (Backend) |
| 아키텍처 | 모듈러 모놀리스 (MSA 전환 준비) |

---

## Architecture

### 전체 구조

```
Next.js 15 (Frontend)
    │
    │ REST API (OpenAPI spec)
    ▼
Spring Boot (Kotlin Backend) — 모듈러 모놀리스
    │
    │ JDBC / Spring Data JPA
    ▼
Supabase PostgreSQL + Auth
```

### 인증 흐름

```
Frontend → Supabase Auth → JWT (Access Token + Refresh Token)
Frontend → Authorization: Bearer {accessToken} → Backend
Backend → JWT 검증 (Supabase 공개키) → 요청 처리

Access Token:  메모리 (XSS 방지)
Refresh Token: httpOnly Secure SameSite=Strict Cookie
```

### 백엔드 모듈 구조

```
Spring Boot (Kotlin)
├── card-module          카드 CRUD, 관리자 API
├── benefit-module       혜택 검색, 카드 추천
├── transaction-module   가계부, 수동 입력
├── voucher-module       바우처 관리
├── crawler-module       카드사 크롤링, Draft 관리
├── email-parser-module  이메일 파싱, Draft 관리
└── notification-module  알림/푸시
```

각 모듈: 헥사고날 아키텍처 (Domain ↔ Port ↔ Adapter)

---

## MVP 기능 범위

### Phase 1 (MVP)
1. 카드 등록/관리
2. 가계부 (수동 입력 + 이메일 파싱)
3. 연간/월간 실적 관리 (자동 집계, 충족 여부)
4. 혜택 검색 (가맹점/브랜드 → 최적 카드 추천)
5. 바우처 관리 (사용/미사용 체크, 만료 알림)
6. 알림 (바우처 알림, 실적 리마인더)

### Phase 2
7. SMS 파싱 (모바일 앱)

### 추후 개발
8. 카드사 이벤트 검색
9. 사후 분석 (다른 카드 사용 시 절약 시뮬레이션)

---

## Database Design

### ENUM Types (16개)

```sql
CREATE TYPE card_type_enum           AS ENUM ('CREDIT', 'CHECK');
CREATE TYPE benefit_type_enum        AS ENUM ('DISCOUNT', 'POINT', 'CASHBACK', 'MILEAGE', 'INTEREST_FREE');
CREATE TYPE discount_type_enum       AS ENUM ('RATE', 'FIXED');
CREATE TYPE benefit_target_type_enum AS ENUM ('CATEGORY', 'MERCHANT', 'ALL');
CREATE TYPE voucher_type_enum        AS ENUM ('COUPON', 'SERVICE', 'LOUNGE', 'INSURANCE', 'OTHER');
CREATE TYPE period_type_enum         AS ENUM ('MONTHLY', 'YEARLY', 'ONE_TIME');
CREATE TYPE crawl_source_type_enum   AS ENUM ('WEB', 'API', 'PDF');
CREATE TYPE crawl_status_enum        AS ENUM ('STARTED', 'SUCCESS', 'FAILED');
CREATE TYPE draft_status_enum        AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE change_type_enum         AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'EXPIRED');
CREATE TYPE reference_type_enum      AS ENUM ('BENEFIT', 'VOUCHER');
CREATE TYPE voucher_action_enum      AS ENUM ('USE', 'CANCEL');
CREATE TYPE payment_source_enum      AS ENUM ('MANUAL', 'EMAIL', 'SMS');
CREATE TYPE payment_draft_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
CREATE TYPE subscription_plan_enum   AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE gender_enum              AS ENUM ('M', 'F');
```

### Domain 1: Card (Master Data) — 12 tables

카드사 혜택 정보의 정확성과 최신성이 서비스의 핵심.

| # | 테이블 | 설명 |
|---|--------|------|
| 1 | card_company | 카드사 마스터 (신한, 삼성, 현대 등) |
| 2 | card | 카드 상품 (이름, 연회비, 카드타입) |
| 3 | performance_tier | 전월실적 구간 (30만/50만/100만) |
| 4 | category | 업종 카테고리 (계층 구조, self-ref) |
| 5 | merchant | 가맹점 브랜드 |
| 6 | merchant_alias | 가맹점 별칭 (명세서 매칭용, 정규화) |
| 7 | card_benefit | 결제 연동 혜택 (할인/적립/캐시백) |
| 8 | card_voucher | 독립 사용 혜택 (쿠폰/라운지/보험) |
| 9 | card_benefit_history | 혜택 변경 이력 (polymorphic: BENEFIT/VOUCHER 모두 추적) |
| 10 | crawl_source | 크롤링 소스 설정 |
| 11 | crawl_log | 크롤링 실행 이력 |
| 12 | crawl_draft | 크롤링 임시 데이터 (관리자 검수, reference_type으로 BENEFIT/VOUCHER 구분) |

**Benefit vs Voucher 분리 기준:**
- Benefit = 결제 시 자동 적용 → 가계부(Transaction)와 연결
- Voucher = 별도 사용/수령 필요 → 사용자 도메인에서 상태 추적

**card_benefit CHECK constraint:**
```sql
(target_type='CATEGORY' AND category_id IS NOT NULL AND merchant_id IS NULL) OR
(target_type='MERCHANT' AND merchant_id IS NOT NULL AND category_id IS NULL) OR
(target_type='ALL' AND category_id IS NULL AND merchant_id IS NULL)
```

### Domain 2: Account — 4 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 13 | account | 사용자 계정 (UUID PK, Supabase Auth) |
| 14 | account_profile | 프로필 (1:1) |
| 15 | subscription | 구독 (FREE/PREMIUM) |
| 16 | notification_setting | 알림 설정 (1:1) |

### Domain 3: User Card — 5 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 17 | user_card | 내 카드 (issued_at 발급일 포함) |
| 18 | user_performance | 월간/연간 실적 (발급일 기준 연간 계산) |
| 19 | user_voucher | 내 바우처 인스턴스 (기간별 잔여 추적) |
| 20 | user_voucher_log | 바우처 사용/취소 감사 이력 |
| 21 | user_benefit_usage | 혜택 월간 한도 소진 추적 |

**연간실적 계산:** `user_card.issued_at` 기준 (달력 연도 아님)
- 발급일 2025-06-15 → 연간: 2025.06~2026.05

### Domain 4: Ledger — 6 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 22 | payment | 결제 건 (1건) |
| 23 | payment_item | 품목 (N개, 개별 혜택 적용) |
| 24 | tag | 사용자 커스텀 태그 |
| 25 | payment_item_tag | 품목-태그 M:N |
| 26 | payment_draft | 이메일 파싱 임시 (사용자 확인 대기) |
| 27 | email_parse_rule | 카드사별 파싱 규칙 |

**핵심 구조:** Payment(1) → PaymentItem(N)
- 한 번 결제에 여러 품목 (쿠팡 주문 등)
- 품목별 카테고리, 혜택 적용 (`payment_item.card_benefit_id` FK → `card_benefit`), 태그 부여
- `payment_item.benefit_amount`에 실제 할인/적립 금액 기록

**payment_draft → payment 관계:**
- `payment_draft.payment_id` FK는 확정(CONFIRMED) 후에만 채워짐
- 흐름: draft 생성(PENDING) → 사용자 확인 → payment 생성 → draft.payment_id에 연결

### Domain 5: Analytics — 4 tables (역정규화)

| # | 테이블 | 설명 |
|---|--------|------|
| 28 | user_monthly_summary | 월간 종합 |
| 29 | user_category_summary | 카테고리별 월간 |
| 30 | user_tag_summary | 태그별 월간 |
| 31 | user_card_summary | 카드별 월간 |

배치 또는 이벤트 기반으로 갱신.

### ERD (Cross-Domain FK)

```
═══ Card Domain ═══
card_company ──1:N──▶ card ──1:N──▶ performance_tier
                        ├──1:N──▶ card_benefit ──▶ category, merchant
                        ├──1:N──▶ card_voucher
                        └──1:N──▶ card_benefit_history
category ◀── self-ref (parent_id)
category ──1:N──▶ merchant ──1:N──▶ merchant_alias
card_company ──1:N──▶ crawl_source ──1:N──▶ crawl_log ──1:N──▶ crawl_draft
card_company ──1:N──▶ email_parse_rule

═══ Account Domain ═══
account ──1:1──▶ account_profile
        ──1:1──▶ notification_setting
        ──1:N──▶ subscription

═══ User Card Domain ═══
account ──1:N──▶ user_card ──▶ card
                     ├──1:N──▶ user_performance ──▶ performance_tier
                     ├──1:N──▶ user_voucher ──1:N──▶ user_voucher_log
                     │              └──▶ card_voucher
                     └──1:N──▶ user_benefit_usage ──▶ card_benefit

═══ Ledger Domain ═══
account ──1:N──▶ payment ──1:N──▶ payment_item ──M:N──▶ tag
                     └──▶ user_card, merchant
account ──1:N──▶ payment_draft ──▶ payment
account ──1:N──▶ tag

═══ Analytics Domain ═══
All summary tables ──▶ account (+ category/tag/user_card FK)
```

### Naming Convention

- **표기법**: PostgreSQL 표준 `snake_case` (테이블명, 컬럼명, enum명 모두)
- **PK**: `BIGINT GENERATED ALWAYS AS IDENTITY` (account만 UUID)
- **금액**: `BIGINT` (원화), `card_benefit.discount_value`만 `NUMERIC(10,2)` (RATE일 때 퍼센트율, FIXED일 때 원 단위 — `discount_type`으로 구분)
- **기간**: `year_month CHAR(7)` 형식 `'YYYY-MM'`
- **soft delete**: `deleted_at TIMESTAMPTZ` (필요한 테이블만)
- **예약어 회피**: name→{table}_name, status→{context}_status, type→{context}_type, plan→subscription_plan 등

### Key Indexes

```
-- 가맹점 검색 (핵심 기능)
merchant_alias(alias_name) UNIQUE + pg_trgm GIN (fuzzy)
card_benefit(merchant_id) WHERE is_active = true
card_benefit(category_id) WHERE is_active = true
card_benefit(card_id, performance_tier_id)

-- 가계부 조회
payment(account_id, paid_at DESC) WHERE deleted_at IS NULL
payment_item(payment_id)

-- 사용자 대시보드
user_card(account_id)
user_benefit_usage(user_card_id, year_month)
user_voucher(user_card_id)
```

### 정규화/역정규화 결정

| 결정 | 이유 |
|------|------|
| merchant_alias 별도 테이블 | 인덱스 매칭 성능, UNIQUE 보장 |
| card_benefit / card_voucher 분리 | 컬럼 세트 상이, 행동 패턴 상이 |
| card_company 별도 테이블 | 크롤링/파싱 규칙이 카드사 단위 |
| category.parent_id 자기참조 | 서브카테고리 계층 지원 |
| user_voucher.total_count 역정규화 | JOIN 제거 (빈번한 "3/5" 조회) |
| payment.merchant_name_raw 유지 | 매칭 실패 시 원본, 디버깅용 |
| Analytics 테이블 역정규화 | 대시보드 풀스캔 방지 |
| crawl_draft/payment_draft JSONB | 임시 데이터, 구조 유동적 |

---

## Data Pipeline

### 카드 데이터 수집 (관리자)
```
카드사 웹 → 크롤러 → crawl_draft (PENDING, reference_type=BENEFIT|VOUCHER)
                        → 관리자 검수 → APPROVED → card_benefit/card_voucher 반영
                        → REJECTED → 폐기
수동 입력 → 관리자 패널 → card_benefit/card_voucher 직접 입력
변경 시 → card_benefit_history에 이력 기록 (BENEFIT/VOUCHER 모두)
```

### 거래 데이터 수집 (사용자)
```
수동 입력 → payment + payment_item 직접 생성
이메일 파싱 → payment_draft (PENDING)
                → 사용자 확인 → CONFIRMED → payment + payment_item 생성
                → REJECTED → 폐기
```

### 실적/혜택 자동 집계 (이벤트 기반)
```
payment 생성/수정 이벤트 발생 시:
  1. user_performance 갱신 (월간 spent_amount 재계산, tier 판별)
  2. user_benefit_usage 갱신 (payment_item.card_benefit_id 기준, 월간 한도 소진 업데이트)
  3. Analytics 테이블 갱신 (user_monthly_summary, user_category_summary 등)

헥사고날 구조에서 도메인 이벤트로 모듈 간 전파:
  transaction-module → PaymentCreatedEvent
    → benefit-module: user_benefit_usage 업데이트
    → card-module: user_performance 업데이트
    → analytics-module: summary 테이블 업데이트
```

---

## Revenue Model

- **FREE**: 카드 등록(3장), 수동 입력, 기본 혜택 검색
- **PREMIUM**: 무제한 카드, 이메일 파싱, 고급 통계, 알림

---

## Verification Plan

1. Supabase 프로젝트 생성 후 마이그레이션 SQL 실행하여 전체 테이블 생성 확인
2. 시드 데이터 (카드사 3개, 카드 5개, 혜택 20개, 카테고리/가맹점) 입력
3. 핵심 쿼리 테스트:
   - "스타벅스에서 내 카드 중 최적 추천" 쿼리
   - "이번 달 실적 충족률" 쿼리
   - "바우처 잔여 현황" 쿼리
4. Spring Boot 프로젝트 초기화, 헥사고날 모듈 구조 확인
5. Next.js 프로젝트 초기화, API 연동 확인
