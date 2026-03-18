# CardWise - Database Design

## Overview

- DBMS: Supabase PostgreSQL
- 총 35 테이블, 6개 도메인
- 19개 ENUM 타입
- 표기법: PostgreSQL 표준 `snake_case`

---

## ENUM Types (19개)

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
CREATE TYPE currency_enum            AS ENUM ('KRW', 'USD', 'EUR', 'JPY', 'CNY', 'GBP', 'THB', 'VND', 'SGD', 'AUD');
CREATE TYPE group_role_enum          AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE invitation_status_enum   AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
```

---

## Domain 1: Card (Master Data) -- 12 tables

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

### Benefit vs Voucher 분리 기준

- Benefit = 결제 시 자동 적용 -> 가계부(Transaction)와 연결
- Voucher = 별도 사용/수령 필요 -> 사용자 도메인에서 상태 추적

### card_benefit CHECK constraint

```sql
CHECK (
  (target_type='CATEGORY' AND category_id IS NOT NULL AND merchant_id IS NULL) OR
  (target_type='MERCHANT' AND merchant_id IS NOT NULL AND category_id IS NULL) OR
  (target_type='ALL' AND category_id IS NULL AND merchant_id IS NULL)
)
```

---

## Domain 2: Account -- 4 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 13 | account | 사용자 계정 (UUID PK, Supabase Auth) |
| 14 | account_profile | 프로필 (1:1) |
| 15 | subscription | 구독 (FREE/PREMIUM) |
| 16 | notification_setting | 알림 설정 (1:1) |

---

## Domain 3: User Card -- 5 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 17 | user_card | 내 카드 (issued_at 발급일 포함) |
| 18 | user_performance | 월간/연간 실적 (발급일 기준 연간 계산) |
| 19 | user_voucher | 내 바우처 인스턴스 (기간별 잔여 추적) |
| 20 | user_voucher_log | 바우처 사용/취소 감사 이력 |
| 21 | user_benefit_usage | 혜택 월간 한도 소진 추적 |

### 연간실적 계산 규칙

`user_card.issued_at` 기준 (달력 연도가 아님)
- 발급일 2025-06-15 -> 연간 기간: 2025.06 ~ 2026.05

---

## Domain 4: Ledger -- 7 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 22 | payment | 결제 건 (1건, 해외결제 포함) |
| 23 | payment_item | 품목 (N개, 개별 혜택 적용) |
| 24 | tag | 사용자/그룹 커스텀 태그 (group_id nullable, 개인+그룹 태그 지원) |
| 25 | payment_item_tag | 품목-태그 M:N (composite PK) |
| 26 | payment_draft | 이메일 파싱 임시 (사용자 확인 대기) |
| 27 | email_parse_rule | 카드사별 파싱 규칙 |
| 28 | exchange_rate_snapshot | 결제 시점 환율 스냅샷 |

### 핵심 구조: Payment(1) -> PaymentItem(N)

- 한 번 결제에 여러 품목 (쿠팡 주문 등)
- 품목별 카테고리, 혜택 적용 (`payment_item.card_benefit_id` FK -> `card_benefit`), 태그 부여
- `payment_item.benefit_amount`에 실제 할인/적립 금액 기록

### payment_draft -> payment 관계

- `payment_draft.payment_id` FK는 확정(CONFIRMED) 후에만 채워짐
- 흐름: draft 생성(PENDING) -> 사용자 확인 -> payment 생성 -> draft.payment_id에 연결

---

## Domain 5: Analytics -- 4 tables (역정규화)

| # | 테이블 | 설명 |
|---|--------|------|
| 29 | user_monthly_summary | 월간 종합 |
| 30 | user_category_summary | 카테고리별 월간 |
| 31 | user_tag_summary | 태그별 월간 |
| 32 | user_card_summary | 카드별 월간 |

배치 또는 이벤트 기반으로 갱신.

---

## Domain 6: Group (가족/그룹 공유) -- 3 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 33 | ledger_group | 공유 가계부 그룹 |
| 34 | group_member | 그룹 멤버십 (OWNER/MEMBER) |
| 35 | group_invitation | 그룹 초대 관리 |

### 거버넌스 모델

| 역할 | 멤버 관리 | 결제 입력 | 결제 조회 | 결제 수정/삭제 | 태그 관리 | 그룹 설정 |
|------|----------|----------|----------|-------------|----------|----------|
| **OWNER** (그룹장) | ✅ 초대/추방 | ✅ | ✅ 전체 | ✅ 모든 멤버 것 | ✅ | ✅ |
| **MEMBER** (멤버) | ❌ | ✅ | ✅ 전체 | ✅ 본인 것만 | ✅ 생성만 | ❌ |

### ledger_group

```sql
CREATE TABLE ledger_group (
  group_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_name        VARCHAR(50)     NOT NULL,
  description       VARCHAR(200),
  owner_account_id  UUID            NOT NULL REFERENCES account,
  max_members       INT             NOT NULL DEFAULT 10,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

### group_member

```sql
CREATE TABLE group_member (
  group_member_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id          BIGINT          NOT NULL REFERENCES ledger_group,
  account_id        UUID            NOT NULL REFERENCES account,
  role              group_role_enum NOT NULL DEFAULT 'MEMBER',
  joined_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),

  UNIQUE (group_id, account_id)
);
```

### group_invitation

```sql
CREATE TABLE group_invitation (
  invitation_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id          BIGINT          NOT NULL REFERENCES ledger_group,
  inviter_id        UUID            NOT NULL REFERENCES account,
  invitee_email     VARCHAR(255)    NOT NULL,
  invitation_status invitation_status_enum NOT NULL DEFAULT 'PENDING',
  expires_at        TIMESTAMPTZ     NOT NULL,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

---

## 해외결제 / 다중통화 설계

### 설계 원칙

1. **원화 기준 (KRW) 통합 관리**: 모든 실적, 통계, 한도 계산은 KRW 기준
2. **원본 통화 보존**: 해외결제 시 원본 통화/금액을 별도 저장
3. **환율 스냅샷**: 결제 시점 환율 기록 (사후 환율 변동과 무관하게 이력 유지)
4. **국내 결제 오버헤드 최소화**: 국내 결제(95%+)는 통화 필드가 NULL/KRW -> 추가 연산 없음

### payment 테이블 통화 컬럼

```sql
-- payment 테이블에 추가되는 통화 관련 컬럼
currency              currency_enum NOT NULL DEFAULT 'KRW'  -- 결제 통화
original_amount       BIGINT                                -- 원본 통화 금액 (해외결제 시)
krw_amount            BIGINT        NOT NULL                -- KRW 환산 금액 (실적/통계에 사용)
exchange_rate_id      BIGINT        REFERENCES exchange_rate_snapshot  -- 환율 참조 (해외결제 시)
```

### exchange_rate_snapshot 테이블

```sql
CREATE TABLE exchange_rate_snapshot (
  exchange_rate_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  currency            currency_enum   NOT NULL,       -- 원본 통화
  rate_to_krw         NUMERIC(12,4)   NOT NULL,       -- 1 외화 = ? KRW
  rate_date           DATE            NOT NULL,        -- 환율 기준일
  source              VARCHAR(50)     NOT NULL DEFAULT 'MANUAL',  -- 환율 출처 (MANUAL, API)
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- 복합 UNIQUE (같은 날 같은 통화 중복 방지)
CREATE UNIQUE INDEX uq_exchange_rate_currency_date
  ON exchange_rate_snapshot(currency, rate_date);
```

### 해외결제 흐름

```
[해외 결제 입력]
  |
  | 1. 사용자 입력: 금액 + 통화 (예: 15.50 USD)
  v
[환율 처리]
  |
  +--[수동 입력] -> 사용자가 KRW 금액 직접 입력 (카드 명세서 기준)
  +--[자동 환산] -> exchange_rate_snapshot 조회 -> 환산
  |
  v
[저장]
  payment.currency = 'USD'
  payment.original_amount = 1550          -- 15.50 USD (센트 단위)
  payment.krw_amount = 20150              -- 카드사 청구 기준 KRW
  payment.exchange_rate_id = {snapshot_id}
```

### 통화별 금액 단위

| 통화 | 단위 | 설명 |
|------|------|------|
| KRW | 원 (1) | 소수점 없음, BIGINT |
| USD | 센트 (0.01) | 15.50 USD -> 1550 |
| EUR | 센트 (0.01) | 10.00 EUR -> 1000 |
| JPY | 엔 (1) | 소수점 없음, 1500 JPY -> 1500 |
| CNY | 펀 (0.01) | 100.00 CNY -> 10000 |
| GBP | 펜스 (0.01) | 8.50 GBP -> 850 |
| THB | 사탕 (0.01) | 500.00 THB -> 50000 |
| VND | 동 (1) | 소수점 없음 |
| SGD | 센트 (0.01) | 20.00 SGD -> 2000 |
| AUD | 센트 (0.01) | 25.00 AUD -> 2500 |

모든 금액은 최소 단위 정수(BIGINT)로 저장. 소수점 연산 오류 방지.

### 실적 계산 시 통화 처리

```
실적 = SUM(payment.krw_amount) WHERE user_card_id = ?

해외결제도 krw_amount가 항상 존재하므로
실적 계산 쿼리는 통화와 무관하게 동일.
```

### 혜택 적용 시 통화 처리

```
해외결제에 대한 혜택:
  - card_benefit는 KRW 기준으로 정의 (카드사 기준과 동일)
  - payment_item.benefit_amount도 KRW 기준
  - 해외결제 혜택: 카드사마다 다름
    -> "해외 가맹점" 카테고리로 처리 (category)
    -> 또는 "해외결제 캐시백 1%" 같은 ALL 타입 benefit
```

### Analytics 통화 처리

```
모든 Analytics 테이블은 KRW 기준:
  user_monthly_summary.total_spent       -- KRW
  user_monthly_summary.total_benefit     -- KRW
  user_category_summary.spent_amount     -- KRW

해외결제 별도 집계가 필요한 경우:
  user_monthly_summary에 foreign_spent (KRW 환산) 컬럼 추가 고려
  -> Phase 2에서 필요 시 추가
```

---

## 컬럼 상세 명세

### payment (수정)

```sql
CREATE TABLE payment (
  payment_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id          UUID            NOT NULL REFERENCES account,
  user_card_id        BIGINT          NOT NULL REFERENCES user_card,
  group_id            BIGINT          REFERENCES ledger_group,   -- NULL = 개인 가계부, NOT NULL = 그룹 가계부
  merchant_id         BIGINT          REFERENCES merchant,      -- NULL 가능 (매칭 실패 시)
  merchant_name_raw   VARCHAR(200)    NOT NULL,                  -- 원본 가맹점명
  paid_at             TIMESTAMPTZ     NOT NULL,                  -- 결제 시각
  -- 통화 관련
  currency            currency_enum   NOT NULL DEFAULT 'KRW',
  original_amount     BIGINT,                                    -- 해외결제 시 원본 통화 금액
  krw_amount          BIGINT          NOT NULL,                  -- KRW 환산 (실적/통계 기준)
  exchange_rate_id    BIGINT          REFERENCES exchange_rate_snapshot,
  -- 메타
  payment_source      payment_source_enum NOT NULL DEFAULT 'MANUAL',
  memo                TEXT,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- CHECK: 해외결제 시 원본 금액 필수
CHECK (
  (currency = 'KRW' AND original_amount IS NULL AND exchange_rate_id IS NULL) OR
  (currency != 'KRW' AND original_amount IS NOT NULL)
)
```

### payment_item

```sql
CREATE TABLE payment_item (
  payment_item_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id          BIGINT          NOT NULL REFERENCES payment,
  item_name           VARCHAR(200)    NOT NULL,
  amount              BIGINT          NOT NULL,                  -- KRW 기준 금액
  category_id         BIGINT          REFERENCES category,
  card_benefit_id     BIGINT          REFERENCES card_benefit,   -- 적용된 혜택
  benefit_amount      BIGINT          NOT NULL DEFAULT 0,        -- KRW 기준 혜택 금액
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

### payment_draft (수정)

```sql
CREATE TABLE payment_draft (
  payment_draft_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id          UUID            NOT NULL REFERENCES account,
  user_card_id        BIGINT          REFERENCES user_card,
  payment_id          BIGINT          REFERENCES payment,        -- CONFIRMED 후 연결
  -- 파싱 원본
  raw_data            JSONB           NOT NULL,                   -- 파싱된 원본 데이터
  parsed_merchant_name VARCHAR(200),
  parsed_amount       BIGINT,                                     -- KRW 환산
  parsed_currency     currency_enum   DEFAULT 'KRW',              -- 파싱된 통화
  parsed_original_amount BIGINT,                                  -- 해외결제 원본 금액
  parsed_paid_at      TIMESTAMPTZ,
  -- 상태
  draft_status        payment_draft_status_enum NOT NULL DEFAULT 'PENDING',
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

---

## ERD (Cross-Domain FK)

```
=== Card Domain ===
card_company --1:N--> card --1:N--> performance_tier
                        |--1:N--> card_benefit --> category, merchant
                        |--1:N--> card_voucher
                        +--1:N--> card_benefit_history
category <-- self-ref (parent_id)
category --1:N--> merchant --1:N--> merchant_alias
card_company --1:N--> crawl_source --1:N--> crawl_log --1:N--> crawl_draft
card_company --1:N--> email_parse_rule

=== Account Domain ===
account --1:1--> account_profile
        --1:1--> notification_setting
        --1:N--> subscription

=== User Card Domain ===
account --1:N--> user_card --> card
                     |--1:N--> user_performance --> performance_tier
                     |--1:N--> user_voucher --1:N--> user_voucher_log
                     |              +--> card_voucher
                     +--1:N--> user_benefit_usage --> card_benefit

=== Ledger Domain ===
account --1:N--> payment --1:N--> payment_item --M:N--> tag
                     +--> user_card, merchant
                     +--> exchange_rate_snapshot  (해외결제 시)
account --1:N--> payment_draft --> payment
account --1:N--> tag

=== Analytics Domain ===
All summary tables --> account (+ category/tag/user_card FK)

=== Group Domain ===
account --1:N--> ledger_group (as owner)
ledger_group --1:N--> group_member --> account
ledger_group --1:N--> group_invitation
ledger_group --1:N--> payment (group payments)
ledger_group --1:N--> tag (group tags)
```

---

## Naming Convention

| 규칙 | 설명 |
|------|------|
| 표기법 | PostgreSQL 표준 `snake_case` (테이블명, 컬럼명, enum명 모두) |
| PK | `BIGINT GENERATED ALWAYS AS IDENTITY` (account만 UUID) |
| 금액 | `BIGINT` (최소 통화 단위 정수: KRW=원, USD=센트, JPY=엔) |
| discount_value | `NUMERIC(10,2)` (RATE일 때 퍼센트율, FIXED일 때 원 단위 -- `discount_type`으로 구분) |
| 환율 | `NUMERIC(12,4)` (1 외화 = ? KRW) |
| 기간 | `year_month CHAR(7)` 형식 `'YYYY-MM'` |
| soft delete | `deleted_at TIMESTAMPTZ` (필요한 테이블만) |
| 예약어 회피 | name->{table}_name, status->{context}_status, type->{context}_type, plan->subscription_plan 등 |

---

## Key Indexes

```sql
-- 가맹점 검색 (핵심 기능)
merchant_alias(alias_name) UNIQUE + pg_trgm GIN (fuzzy)
card_benefit(merchant_id) WHERE is_active = true
card_benefit(category_id) WHERE is_active = true
card_benefit(card_id, performance_tier_id)

-- 가계부 조회
payment(account_id, paid_at DESC) WHERE deleted_at IS NULL
payment(account_id, currency) WHERE currency != 'KRW'  -- 해외결제 필터
payment_item(payment_id)

-- 사용자 대시보드
user_card(account_id)
user_benefit_usage(user_card_id, year_month)
user_voucher(user_card_id)

-- 환율
exchange_rate_snapshot(currency, rate_date) UNIQUE

-- 그룹 가계부
group_member(account_id) -- 내 그룹 목록
group_member(group_id) -- 그룹 멤버 목록
payment(group_id, paid_at DESC) WHERE group_id IS NOT NULL -- 그룹 결제 조회
group_invitation(invitee_email, invitation_status) -- 초대 조회
```

---

## 정규화/역정규화 결정

| 결정 | 이유 |
|------|------|
| merchant_alias 별도 테이블 | 인덱스 매칭 성능, UNIQUE 보장 |
| card_benefit / card_voucher 분리 | 컬럼 세트 상이, 행동 패턴 상이 |
| card_company 별도 테이블 | 크롤링/파싱 규칙이 카드사 단위 |
| category.parent_id 자기참조 | 서브카테고리 계층 지원 |
| user_voucher.total_count 역정규화 | JOIN 제거 (빈번한 "3/5" 조회) |
| payment.merchant_name_raw 유지 | 매칭 실패 시 원본, 디버깅용 |
| payment.krw_amount 역정규화 | 통화 무관 실적 계산 (환율 JOIN 제거) |
| exchange_rate_snapshot 별도 테이블 | 결제 시점 환율 불변 보존, 다수 결제에서 재사용 |
| Analytics 테이블 역정규화 | 대시보드 풀스캔 방지 |
| crawl_draft/payment_draft JSONB | 임시 데이터, 구조 유동적 |
