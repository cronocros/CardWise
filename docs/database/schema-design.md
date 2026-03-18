# CardWise - Database Design

## Overview

- DBMS: Supabase PostgreSQL
- 총 41 테이블, 6개 도메인
- 26개 ENUM 타입
- 표기법: PostgreSQL 표준 `snake_case`

---

## ENUM Types (26개)

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
CREATE TYPE payment_source_enum      AS ENUM ('MANUAL', 'EMAIL', 'SMS', 'EXCEL', 'MYDATA');
CREATE TYPE payment_draft_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
CREATE TYPE subscription_plan_enum   AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE gender_enum              AS ENUM ('M', 'F');
CREATE TYPE currency_enum            AS ENUM ('KRW', 'USD', 'EUR', 'JPY', 'CNY', 'GBP', 'THB', 'VND', 'SGD', 'AUD');
CREATE TYPE group_role_enum          AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE invitation_status_enum   AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE annual_perf_basis_enum   AS ENUM ('ISSUANCE_MONTH', 'ISSUANCE_DATE');
CREATE TYPE benefit_period_lag_enum  AS ENUM ('CURRENT_MONTH', 'PREV_MONTH', 'PREV_PREV_MONTH');
CREATE TYPE payment_adjustment_type_enum AS ENUM ('FX_CORRECTION', 'BILLING_DISCOUNT', 'PAYMENT_DEDUCTION', 'CARD_FEE', 'OTHER');
CREATE TYPE card_grade_enum          AS ENUM ('BASIC', 'CLASSIC', 'GOLD', 'PLATINUM', 'DIAMOND', 'PREMIUM', 'INFINITE');
CREATE TYPE benefit_source_enum      AS ENUM ('ISSUER', 'NETWORK', 'PARTNERSHIP');
CREATE TYPE performance_exclusion_scope_enum AS ENUM ('MONTHLY_ONLY', 'ANNUAL_ONLY', 'ALL_PERFORMANCE', 'NONE');
CREATE TYPE pending_action_type_enum AS ENUM ('FX_CORRECTION_NEEDED', 'BILLING_DISCOUNT_FOUND', 'PAYMENT_CONFIRMATION', 'DUPLICATE_DETECTED', 'CATEGORY_UNMAPPED', 'EXCEL_REVIEW', 'PERFORMANCE_EXCLUSION_CHECK');
```

---

## Domain 1: Card (Master Data) -- 16 tables

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
| 13 | card_network | 글로벌 카드 네트워크 (VISA, MASTERCARD, UNIONPAY, AMEX, JCB, DOMESTIC) |
| 14 | special_performance_period | 특별 실적 인정 기간 (배율 실적 인정) |
| 15 | performance_exclusion_code | 실적 제외 유형 마스터 코드 (세금, 상품권, 현금서비스 등) |
| 16 | card_performance_exclusion | 카드별 실적 제외 규칙 (코드 참조) |

### Benefit vs Voucher 분리 기준

- Benefit = 결제 시 자동 적용 -> 가계부(Transaction)와 연결
- Voucher = 별도 사용/수령 필요 -> 사용자 도메인에서 상태 추적

### card 테이블 확장 컬럼

```sql
-- 기존 컬럼에 추가
annual_perf_basis     annual_perf_basis_enum NOT NULL DEFAULT 'ISSUANCE_MONTH'  -- 연간 실적 기산 방식
network_id            BIGINT                REFERENCES card_network             -- 글로벌 네트워크 FK (NULL=국내전용)
card_grade            card_grade_enum                                           -- 카드 등급 (NULL=등급 없음)
has_performance_tier  BOOLEAN               NOT NULL DEFAULT true               -- 실적 없는 체크카드 = false
card_rules            JSONB                 NOT NULL DEFAULT '{}'               -- 그레이스 기간 등 카드 글로벌 정책
```

### card_benefit 확장 컬럼

```sql
-- 기존 컬럼에 추가
performance_period_lag  benefit_period_lag_enum NOT NULL DEFAULT 'PREV_MONTH'  -- 혜택 기준월 lag
benefit_source          benefit_source_enum     NOT NULL DEFAULT 'ISSUER'     -- 혜택 제공 주체
activation_rules        JSONB                   NOT NULL DEFAULT '{}'         -- 혜택별 활성화 조건 (보조)
```

### card_voucher 확장 컬럼

```sql
-- 기존 컬럼에 추가
unlock_conditions  JSONB  NOT NULL DEFAULT '{}'  -- 바우처 잠금해제 조건 (보조)
```

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
| 17 | account | 사용자 계정 (UUID PK, Supabase Auth) |
| 18 | account_profile | 프로필 (1:1) |
| 19 | subscription | 구독 (FREE/PREMIUM) |
| 20 | notification_setting | 알림 설정 (1:1) |

---

## Domain 3: User Card -- 5 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 21 | user_card | 내 카드 (issued_at 발급일 포함) |
| 22 | user_performance | 월간/연간 실적 (발급일 기준 연간 계산) |
| 23 | user_voucher | 내 바우처 인스턴스 (기간별 잔여 추적) |
| 24 | user_voucher_log | 바우처 사용/취소 감사 이력 |
| 25 | user_benefit_usage | 혜택 월간 한도 소진 추적 |

### 연간실적 계산 규칙

카드 상품별 `card.annual_perf_basis`에 따라 2가지 방식:

- **ISSUANCE_MONTH** (발급월 기준): 발급일 2025-06-15 → 연간 기간: 2025-06-01 ~ 2026-05-31
- **ISSUANCE_DATE** (발급일 기준): 발급일 2025-06-15 → 연간 기간: 2025-06-15 ~ 2026-06-14

월간 실적: 결제일(paid_at) 기준 해당 월 1일 ~ 말일 (KST)

혜택 기준: `card_benefit.performance_period_lag`에 따라 당월/전월/전전월 실적 기반 혜택 활성화

---

## Domain 4: Ledger -- 9 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 26 | payment | 결제 건 (1건, 해외결제 포함) |
| 27 | payment_item | 품목 (N개, 개별 혜택 적용) |
| 28 | tag | 사용자/그룹 커스텀 태그 (group_id nullable, 개인+그룹 태그 지원) |
| 29 | payment_item_tag | 품목-태그 M:N (composite PK) |
| 30 | payment_draft | 이메일 파싱 임시 (사용자 확인 대기) |
| 31 | email_parse_rule | 카드사별 파싱 규칙 |
| 32 | exchange_rate_snapshot | 결제 시점 환율 스냅샷 |
| 33 | payment_adjustment | 결제 보정 (FX 환율 확정, 청구할인 등) |
| 34 | user_pending_action | 사용자 확인 필요 항목 (FX 보정, 중복 감지, 카테고리 미분류 등) |

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
| 35 | user_monthly_summary | 월간 종합 |
| 36 | user_category_summary | 카테고리별 월간 |
| 37 | user_tag_summary | 태그별 월간 |
| 38 | user_card_summary | 카드별 월간 |

배치 또는 이벤트 기반으로 갱신.

---

## Domain 6: Group (가족/그룹 공유) -- 3 tables

| # | 테이블 | 설명 |
|---|--------|------|
| 39 | ledger_group | 공유 가계부 그룹 |
| 40 | group_member | 그룹 멤버십 (OWNER/MEMBER) |
| 41 | group_invitation | 그룹 초대 관리 |

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
  -- 결제 보정
  final_krw_amount    BIGINT,                                    -- 보정 후 확정액 (NULL=미보정)
  is_adjusted         BOOLEAN         NOT NULL DEFAULT false,    -- 보정 완료 여부
  external_transaction_id VARCHAR(100),                          -- 마이데이터 트랜잭션 ID (향후)
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
  excluded_from_performance BOOLEAN NOT NULL DEFAULT false,      -- 사용자 직접 실적 제외 설정
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

### card_network

```sql
CREATE TABLE card_network (
  network_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  network_code  VARCHAR(20)     NOT NULL UNIQUE,
  network_name  VARCHAR(50)     NOT NULL,
  logo_url      VARCHAR(500),
  website_url   VARCHAR(500),
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

### special_performance_period

```sql
CREATE TABLE special_performance_period (
  special_period_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id            BIGINT          NOT NULL REFERENCES card,
  period_name        VARCHAR(100)    NOT NULL,
  start_date         DATE            NOT NULL,
  end_date           DATE            NOT NULL,
  credit_multiplier  NUMERIC(3,2)    NOT NULL DEFAULT 1.00,
  is_active          BOOLEAN         NOT NULL DEFAULT true,
  description        TEXT,
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),

  CONSTRAINT chk_spp_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_spp_multiplier CHECK (credit_multiplier > 0 AND credit_multiplier <= 5.00)
);
```

### performance_exclusion_code

```sql
CREATE TABLE performance_exclusion_code (
  exclusion_code_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code               VARCHAR(50)     NOT NULL UNIQUE,
  name               VARCHAR(100)    NOT NULL,
  description        TEXT,
  default_scope      performance_exclusion_scope_enum NOT NULL DEFAULT 'ALL_PERFORMANCE',
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

### card_performance_exclusion

```sql
CREATE TABLE card_performance_exclusion (
  card_perf_exclusion_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id                 BIGINT          NOT NULL REFERENCES card,
  exclusion_code_id       BIGINT          NOT NULL REFERENCES performance_exclusion_code,
  effective_scope         performance_exclusion_scope_enum NOT NULL,
  is_active               BOOLEAN         NOT NULL DEFAULT true,
  valid_from              DATE,
  valid_until             DATE,

  UNIQUE (card_id, exclusion_code_id)
);
```

### payment_adjustment

```sql
CREATE TABLE payment_adjustment (
  adjustment_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id          BIGINT          NOT NULL REFERENCES payment,
  adjustment_type     payment_adjustment_type_enum NOT NULL,
  original_krw_amount BIGINT          NOT NULL,
  adjusted_krw_amount BIGINT          NOT NULL,
  difference_amount   BIGINT GENERATED ALWAYS AS (adjusted_krw_amount - original_krw_amount) STORED,
  reason              TEXT,
  billed_at           DATE,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);
```

### user_pending_action

```sql
CREATE TABLE user_pending_action (
  pending_action_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id         UUID            NOT NULL REFERENCES account,
  action_type        pending_action_type_enum NOT NULL,
  reference_table    VARCHAR(50),
  reference_id       BIGINT,
  title              VARCHAR(200)    NOT NULL,
  description        TEXT,
  status             VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  priority           VARCHAR(10)     NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  resolved_at        TIMESTAMPTZ
);

CREATE INDEX idx_upa_account_status ON user_pending_action (account_id, status);
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
card_company --1:N--> card --1:N--> card_performance_exclusion --> performance_exclusion_code
                        |--1:N--> special_performance_period
card_network --1:N--> card

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
payment --1:N--> payment_adjustment
account --1:N--> user_pending_action

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

-- 결제 보정
payment_adjustment(payment_id)

-- 사용자 인박스
user_pending_action(account_id, status)

-- 실적 제외
card_performance_exclusion(card_id) WHERE is_active = true

-- 특별 실적 기간
special_performance_period(card_id, is_active) WHERE is_active = true

-- 카드 네트워크
card(network_id) WHERE network_id IS NOT NULL

-- 마이데이터 중복 방지
payment(account_id, external_transaction_id) WHERE external_transaction_id IS NOT NULL  UNIQUE
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
| card.card_rules / activation_rules / unlock_conditions JSONB | 카드사별 규칙 다양성 → 관계형 우선 + JSONB 보조 (NoSQL 대안) |
| payment.final_krw_amount 역정규화 | 보정 후 확정액 즉시 조회 (adjustment JOIN 제거) |
| performance_exclusion_code 코드 테이블 | 실적 제외 규칙 카드 간 재사용 |

---

## JSONB 규칙 엔진 전략

### 기본 원칙

관계형 테이블/컬럼으로 표준 규칙 처리 (80%). JSONB는 카드사별 엣지케이스 보조 (20%).

### JSONB 컬럼 목록

| 테이블 | 컬럼 | 용도 | 현재 |
|--------|------|------|------|
| card | card_rules | 그레이스 기간, 특수 계산 방식 | `{}` (향후 활용) |
| card_benefit | activation_rules | 시간대 제한, 시즌 한정, 최소 단건 금액 | `{}` (향후 활용) |
| card_voucher | unlock_conditions | 연간실적 달성 조건, 전년도 실적 요구 | `{}` (향후 활용) |

### JSON 스키마 예시

**card.card_rules:**
```json
{
  "grace_period": { "enabled": true, "months": 2, "min_spend_per_month": 0 },
  "notes": "발급 후 2개월 무실적 혜택 제공"
}
```

**card_benefit.activation_rules:**
```json
{
  "grace_period_exempt": true,
  "min_single_payment": 5000,
  "seasonal": { "active_months": [1, 2, 3, 10, 11, 12] },
  "requires_linked_service": "삼성페이 등록 필수"
}
```

**card_voucher.unlock_conditions:**
```json
{
  "requires_annual_performance": 3000000,
  "unlock_type": "AUTO",
  "available_after_months": 6,
  "notes": "전년도 연간실적 300만원 이상 시 익년 1월 자동 지급"
}
```
