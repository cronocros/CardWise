# CardWise 데이터 사전 (Data Dictionary)

> 한국 신용카드 혜택 관리 플랫폼 — 컬럼 수준 상세 명세서
>
> PostgreSQL (Supabase) | 41 테이블 | 6 도메인 | 26 ENUM 타입

---

## 목차

1. [ENUM 타입](#enum-타입)
2. [Domain 1: Card (16 테이블)](#domain-1-card)
3. [Domain 2: Account (4 테이블)](#domain-2-account)
4. [Domain 3: User Card (5 테이블)](#domain-3-user-card)
5. [Domain 4: Ledger (9 테이블)](#domain-4-ledger)
6. [Domain 5: Analytics (4 테이블)](#domain-5-analytics)
7. [Domain 6: Group (3 테이블)](#domain-6-group)

---

## ENUM 타입

총 26개의 사용자 정의 ENUM 타입을 사용한다.


| #   | ENUM 이름                     | 값                                                                    | 설명            |
| --- | --------------------------- | -------------------------------------------------------------------- | ------------- |
| 1   | `card_type_enum`            | `CREDIT`, `CHECK`                                                    | 카드 유형 (신용/체크) |
| 2   | `benefit_type_enum`         | `DISCOUNT`, `POINT`, `CASHBACK`, `MILEAGE`, `INTEREST_FREE`          | 혜택 유형         |
| 3   | `benefit_target_type_enum`  | `CATEGORY`, `MERCHANT`, `ALL`                                        | 혜택 적용 대상 유형   |
| 4   | `discount_type_enum`        | `RATE`, `FIXED`                                                      | 할인 방식 (정률/정액) |
| 5   | `voucher_type_enum`         | `COUPON`, `SERVICE`, `LOUNGE`, `INSURANCE`, `OTHER`                  | 바우처 유형        |
| 6   | `period_type_enum`          | `MONTHLY`, `YEARLY`, `ONE_TIME`                                      | 바우처 제공 주기     |
| 7   | `reference_type_enum`       | `BENEFIT`, `VOUCHER`                                                 | 참조 대상 구분      |
| 8   | `change_type_enum`          | `CREATED`, `UPDATED`, `DELETED`, `EXPIRED`                           | 변경 유형         |
| 9   | `crawl_source_type_enum`    | `WEB`, `API`, `PDF`                                                  | 크롤링 소스 유형     |
| 10  | `crawl_status_enum`         | `STARTED`, `SUCCESS`, `FAILED`                                       | 크롤링 상태        |
| 11  | `draft_status_enum`         | `PENDING`, `APPROVED`, `REJECTED`                                    | 초안 검수 상태      |
| 12  | `gender_enum`               | `M`, `F`                                                             | 성별            |
| 13  | `subscription_plan_enum`    | `FREE`, `PREMIUM`                                                    | 구독 플랜         |
| 14  | `voucher_action_enum`       | `USE`, `CANCEL`                                                      | 바우처 사용/취소     |
| 15  | `currency_enum`             | `KRW`, `USD`, `EUR`, `JPY`, `CNY`, `GBP`, `THB`, `VND`, `SGD`, `AUD` | 결제 통화 (10개)   |
| 16  | `payment_source_enum`       | `MANUAL`, `EMAIL`, `SMS`, `EXCEL`, `MYDATA`                          | 결제 입력 경로 (5개) |
| 17  | `payment_draft_status_enum` | `PENDING`, `CONFIRMED`, `REJECTED`                                   | 결제 초안 상태      |
| 18  | `group_role_enum`           | `OWNER`, `MEMBER`                                                    | 그룹 멤버 역할      |
| 19  | `invitation_status_enum`    | `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`                         | 초대 상태         |
| 20  | `annual_perf_basis_enum`   | `ISSUANCE_MONTH`, `ISSUANCE_DATE` | 연간 실적 기산 방식 |
| 21  | `benefit_period_lag_enum`  | `CURRENT_MONTH`, `PREV_MONTH`, `PREV_PREV_MONTH` | 혜택 기준월 lag |
| 22  | `payment_adjustment_type_enum` | `FX_CORRECTION`, `BILLING_DISCOUNT`, `PAYMENT_DEDUCTION`, `CARD_FEE`, `OTHER` | 결제 보정 유형 |
| 23  | `card_grade_enum`          | `BASIC`, `CLASSIC`, `GOLD`, `PLATINUM`, `DIAMOND`, `PREMIUM`, `INFINITE` | 카드 등급 |
| 24  | `benefit_source_enum`      | `ISSUER`, `NETWORK`, `PARTNERSHIP` | 혜택 제공 주체 |
| 25  | `performance_exclusion_scope_enum` | `MONTHLY_ONLY`, `ANNUAL_ONLY`, `ALL_PERFORMANCE`, `NONE` | 실적 제외 범위 |
| 26  | `pending_action_type_enum` | `FX_CORRECTION_NEEDED`, `BILLING_DISCOUNT_FOUND`, `PAYMENT_CONFIRMATION`, `DUPLICATE_DETECTED`, `CATEGORY_UNMAPPED`, `EXCEL_REVIEW`, `PERFORMANCE_EXCLUSION_CHECK` | 사용자 확인 유형 |


---

## Domain 1: Card

카드 상품, 혜택, 가맹점, 크롤링, 네트워크, 실적 제외 관련 16개 테이블.

---

### card_company

설명: 카드사 정보를 관리하는 마스터 테이블. 신한, 삼성, 현대 등 국내 카드사를 등록한다.


| Column          | Type            | Nullable | Default | FK  | Description     |
| --------------- | --------------- | -------- | ------- | --- | --------------- |
| card_company_id | BIGINT IDENTITY | NO       | auto    | -   | PK              |
| company_name    | VARCHAR(50)     | NO       | -       | -   | 카드사명 (신한, 삼성 등) |
| logo_url        | VARCHAR(500)    | YES      | -       | -   | 로고 이미지 URL      |
| website_url     | VARCHAR(500)    | YES      | -       | -   | 공식 웹사이트         |
| created_at      | TIMESTAMPTZ     | NO       | now()   | -   | 생성일시            |
| updated_at      | TIMESTAMPTZ     | NO       | now()   | -   | 수정일시            |


---

### card

설명: 카드 상품 정보. 각 카드사가 발행하는 개별 카드 상품(신한 Deep Dream, 삼성 taptap O 등)을 관리한다.


| Column          | Type            | Nullable | Default | FK           | Description  |
| --------------- | --------------- | -------- | ------- | ------------ | ------------ |
| card_id         | BIGINT IDENTITY | NO       | auto    | -            | PK           |
| card_company_id | BIGINT          | NO       | -       | card_company | 카드사 FK       |
| card_name       | VARCHAR(100)    | NO       | -       | -            | 카드 상품명       |
| card_type       | card_type_enum  | NO       | -       | -            | CREDIT/CHECK |
| annual_fee      | BIGINT          | NO       | 0       | -            | 연회비 (원)      |
| image_url       | VARCHAR(500)    | YES      | -       | -            | 카드 이미지       |
| description     | TEXT            | YES      | -       | -            | 카드 설명        |
| is_active       | BOOLEAN         | NO       | true    | -            | 활성 여부        |
| created_at      | TIMESTAMPTZ     | NO       | now()   | -            | 생성일시         |
| updated_at      | TIMESTAMPTZ     | NO       | now()   | -            | 수정일시         |
| annual_perf_basis | annual_perf_basis_enum | NO | 'ISSUANCE_MONTH' | - | 연간 실적 기산 방식 |
| network_id | BIGINT | YES | - | card_network | 글로벌 네트워크 FK (NULL=국내전용) |
| card_grade | card_grade_enum | YES | - | - | 카드 등급 (NULL=등급 없음) |
| has_performance_tier | BOOLEAN | NO | true | - | 실적 추적 여부 (체크카드 false 가능) |
| card_rules | JSONB | NO | '{}' | - | 그레이스 기간 등 카드 글로벌 정책 (JSON) |


---

### performance_tier

설명: 카드별 전월 실적 구간. 실적 금액에 따라 혜택 수준이 달라지는 구간(30만 이상, 50만 이상 등)을 정의한다.


| Column              | Type            | Nullable | Default | FK   | Description         |
| ------------------- | --------------- | -------- | ------- | ---- | ------------------- |
| performance_tier_id | BIGINT IDENTITY | NO       | auto    | -    | PK                  |
| card_id             | BIGINT          | NO       | -       | card | 카드 FK               |
| tier_name           | VARCHAR(50)     | NO       | -       | -    | 구간명 (30만, 50만 등)    |
| min_amount          | BIGINT          | NO       | -       | -    | 최소 실적 금액            |
| max_amount          | BIGINT          | YES      | -       | -    | 최대 실적 금액 (NULL=무제한) |
| sort_order          | INT             | NO       | 0       | -    | 정렬 순서               |


---

### category

설명: 업종/소비 카테고리 계층 구조. 자기 참조(self-referencing)를 통해 대분류-중분류-소분류를 표현한다.


| Column        | Type            | Nullable | Default | FK              | Description   |
| ------------- | --------------- | -------- | ------- | --------------- | ------------- |
| category_id   | BIGINT IDENTITY | NO       | auto    | -               | PK            |
| parent_id     | BIGINT          | YES      | -       | category (self) | 상위 카테고리       |
| category_name | VARCHAR(100)    | NO       | -       | -               | 카테고리명         |
| depth         | INT             | NO       | 0       | -               | 계층 깊이 (0=대분류) |


---

### merchant

설명: 가맹점 마스터. 스타벅스, 쿠팡 등 결제가 발생하는 가맹점을 관리한다.


| Column        | Type            | Nullable | Default | FK       | Description |
| ------------- | --------------- | -------- | ------- | -------- | ----------- |
| merchant_id   | BIGINT IDENTITY | NO       | auto    | -        | PK          |
| category_id   | BIGINT          | YES      | -       | category | 업종 카테고리     |
| merchant_name | VARCHAR(200)    | NO       | -       | -        | 가맹점명        |
| logo_url      | VARCHAR(500)    | YES      | -       | -        | 로고 URL      |


---

### merchant_alias

설명: 가맹점 별칭. 카드 명세서에 표기되는 다양한 가맹점명(예: "스타벅스코리아", "STARBUCKS")을 실제 가맹점에 매칭하기 위한 테이블.


| Column            | Type            | Nullable | Default | FK       | Description          |
| ----------------- | --------------- | -------- | ------- | -------- | -------------------- |
| merchant_alias_id | BIGINT IDENTITY | NO       | auto    | -        | PK                   |
| merchant_id       | BIGINT          | NO       | -       | merchant | 가맹점 FK               |
| alias_name        | VARCHAR(200)    | NO       | -       | -        | 별칭 (UNIQUE, 명세서 매칭용) |


---

### card_benefit

설명: 카드 혜택 상세. 카드별로 제공되는 할인/적립 혜택의 조건과 한도를 정의한다.


| Column               | Type                     | Nullable | Default | FK               | Description               |
| -------------------- | ------------------------ | -------- | ------- | ---------------- | ------------------------- |
| card_benefit_id      | BIGINT IDENTITY          | NO       | auto    | -                | PK                        |
| card_id              | BIGINT                   | NO       | -       | card             | 카드 FK                     |
| performance_tier_id  | BIGINT                   | YES      | -       | performance_tier | 실적 구간 FK                  |
| benefit_type         | benefit_type_enum        | NO       | -       | -                | 혜택 유형                     |
| target_type          | benefit_target_type_enum | NO       | -       | -                | 대상 유형                     |
| category_id          | BIGINT                   | YES      | -       | category         | 카테고리 (target=CATEGORY일 때) |
| merchant_id          | BIGINT                   | YES      | -       | merchant         | 가맹점 (target=MERCHANT일 때)  |
| discount_type        | discount_type_enum       | NO       | -       | -                | RATE/FIXED                |
| discount_value       | NUMERIC(10,2)            | NO       | -       | -                | 할인값 (RATE=%, FIXED=원)     |
| monthly_limit_count  | INT                      | YES      | -       | -                | 월 한도 횟수                   |
| monthly_limit_amount | BIGINT                   | YES      | -       | -                | 월 한도 금액                   |
| min_payment_amount   | BIGINT                   | YES      | 0       | -                | 최소 결제 금액                  |
| description          | TEXT                     | YES      | -       | -                | 혜택 설명                     |
| is_active            | BOOLEAN                  | NO       | true    | -                | 활성 여부                     |
| valid_from           | DATE                     | YES      | -       | -                | 유효 시작일                    |
| valid_until          | DATE                     | YES      | -       | -                | 유효 종료일                    |
| created_at           | TIMESTAMPTZ              | NO       | now()   | -                | 생성일시                      |
| updated_at           | TIMESTAMPTZ              | NO       | now()   | -                | 수정일시                      |
| performance_period_lag | benefit_period_lag_enum | NO | 'PREV_MONTH' | - | 혜택 기준월 lag (전월/전전월) |
| benefit_source | benefit_source_enum | NO | 'ISSUER' | - | 혜택 제공 주체 (카드사/네트워크/파트너) |
| activation_rules | JSONB | NO | '{}' | - | 혜택별 활성화 조건 (JSON) |


> **CHECK 제약조건**: `target_type`에 따라 FK 컬럼의 NULL 여부가 결정된다.
>
> - `CATEGORY` → `category_id NOT NULL`, `merchant_id NULL`
> - `MERCHANT` → `merchant_id NOT NULL`, `category_id NULL`
> - `ALL` → `category_id NULL`, `merchant_id NULL`

---

### card_voucher

설명: 카드 바우처 혜택. 공항라운지, 발렛파킹, 커피 쿠폰 등 횟수 기반으로 제공되는 부가 혜택을 관리한다.


| Column          | Type              | Nullable | Default | FK   | Description |
| --------------- | ----------------- | -------- | ------- | ---- | ----------- |
| card_voucher_id | BIGINT IDENTITY   | NO       | auto    | -    | PK          |
| card_id         | BIGINT            | NO       | -       | card | 카드 FK       |
| voucher_name    | VARCHAR(200)      | NO       | -       | -    | 바우처명        |
| voucher_type    | voucher_type_enum | NO       | -       | -    | 유형          |
| period_type     | period_type_enum  | NO       | -       | -    | 제공 주기       |
| total_count     | INT               | NO       | -       | -    | 기간별 총 횟수    |
| description     | TEXT              | YES      | -       | -    | 설명          |
| is_active       | BOOLEAN           | NO       | true    | -    | 활성 여부       |
| valid_from      | DATE              | YES      | -       | -    | 유효 시작일      |
| valid_until     | DATE              | YES      | -       | -    | 유효 종료일      |
| created_at      | TIMESTAMPTZ       | NO       | now()   | -    | 생성일시        |
| updated_at      | TIMESTAMPTZ       | NO       | now()   | -    | 수정일시        |
| unlock_conditions | JSONB | NO | '{}' | - | 바우처 잠금해제 조건 (JSON) |


---

### card_benefit_history

설명: 카드 혜택/바우처 변경 이력. 혜택 조건이 변경되거나 만료될 때 변경 전후 데이터를 JSONB로 보관한다.


| Column         | Type                | Nullable | Default | FK  | Description                        |
| -------------- | ------------------- | -------- | ------- | --- | ---------------------------------- |
| history_id     | BIGINT IDENTITY     | NO       | auto    | -   | PK                                 |
| reference_type | reference_type_enum | NO       | -       | -   | BENEFIT/VOUCHER                    |
| reference_id   | BIGINT              | NO       | -       | -   | card_benefit_id 또는 card_voucher_id |
| change_type    | change_type_enum    | NO       | -       | -   | CREATED/UPDATED/DELETED/EXPIRED    |
| old_data       | JSONB               | YES      | -       | -   | 변경 전 데이터                           |
| new_data       | JSONB               | YES      | -       | -   | 변경 후 데이터                           |
| changed_at     | TIMESTAMPTZ         | NO       | now()   | -   | 변경 일시                              |
| changed_by     | VARCHAR(100)        | YES      | -       | -   | 변경자                                |


---

### crawl_source

설명: 크롤링 소스 정보. 카드사별로 혜택 정보를 수집할 웹페이지, API, PDF 등의 소스를 등록한다.


| Column          | Type                   | Nullable | Default | FK           | Description |
| --------------- | ---------------------- | -------- | ------- | ------------ | ----------- |
| crawl_source_id | BIGINT IDENTITY        | NO       | auto    | -            | PK          |
| card_company_id | BIGINT                 | NO       | -       | card_company | 카드사 FK      |
| source_type     | crawl_source_type_enum | NO       | -       | -            | WEB/API/PDF |
| source_url      | VARCHAR(1000)          | NO       | -       | -            | 크롤링 URL     |
| config          | JSONB                  | YES      | -       | -            | 크롤링 설정      |
| is_active       | BOOLEAN                | NO       | true    | -            | 활성 여부       |
| created_at      | TIMESTAMPTZ            | NO       | now()   | -            | 생성일시        |


---

### crawl_log

설명: 크롤링 실행 로그. 각 크롤링 작업의 시작/완료 시각, 성공 여부, 수집 건수를 기록한다.


| Column          | Type              | Nullable | Default | FK           | Description            |
| --------------- | ----------------- | -------- | ------- | ------------ | ---------------------- |
| crawl_log_id    | BIGINT IDENTITY   | NO       | auto    | -            | PK                     |
| crawl_source_id | BIGINT            | NO       | -       | crawl_source | 소스 FK                  |
| crawl_status    | crawl_status_enum | NO       | -       | -            | STARTED/SUCCESS/FAILED |
| started_at      | TIMESTAMPTZ       | NO       | now()   | -            | 시작 시각                  |
| finished_at     | TIMESTAMPTZ       | YES      | -       | -            | 완료 시각                  |
| error_message   | TEXT              | YES      | -       | -            | 오류 메시지                 |
| record_count    | INT               | YES      | 0       | -            | 수집 건수                  |


---

### crawl_draft

설명: 크롤링 초안. 크롤링으로 수집된 혜택/바우처 데이터를 관리자 검수 전에 임시 저장하는 테이블.


| Column         | Type                | Nullable | Default   | FK        | Description     |
| -------------- | ------------------- | -------- | --------- | --------- | --------------- |
| crawl_draft_id | BIGINT IDENTITY     | NO       | auto      | -         | PK              |
| crawl_log_id   | BIGINT              | NO       | -         | crawl_log | 로그 FK           |
| reference_type | reference_type_enum | NO       | -         | -         | BENEFIT/VOUCHER |
| raw_data       | JSONB               | NO       | -         | -         | 파싱된 원본 데이터      |
| draft_status   | draft_status_enum   | NO       | 'PENDING' | -         | 검수 상태           |
| reviewed_by    | VARCHAR(100)        | YES      | -         | -         | 검수자             |
| reviewed_at    | TIMESTAMPTZ         | YES      | -         | -         | 검수 일시           |
| created_at     | TIMESTAMPTZ         | NO       | now()     | -         | 생성일시            |


---

### card_network

설명: 글로벌 카드 네트워크 브랜드. VISA, MASTERCARD, UNIONPAY, AMEX 등 카드 결제 네트워크를 관리한다.


| Column       | Type            | Nullable | Default | FK  | Description               |
| ------------ | --------------- | -------- | ------- | --- | ------------------------- |
| network_id   | BIGINT IDENTITY | NO       | auto    | -   | PK                        |
| network_code | VARCHAR(20)     | NO       | -       | -   | 네트워크 코드 (VISA, MASTERCARD 등, UNIQUE) |
| network_name | VARCHAR(50)     | NO       | -       | -   | 네트워크명                     |
| logo_url     | VARCHAR(500)    | YES      | -       | -   | 로고 URL                    |
| website_url  | VARCHAR(500)    | YES      | -       | -   | 공식 웹사이트                   |
| created_at   | TIMESTAMPTZ     | NO       | now()   | -   | 생성일시                      |


---

### special_performance_period

설명: 특별 실적 인정 기간. 카드사가 특정 기간 결제에 대해 배율 실적을 인정하는 프로모션 기간을 관리한다.


| Column            | Type            | Nullable | Default | FK   | Description            |
| ----------------- | --------------- | -------- | ------- | ---- | ---------------------- |
| special_period_id | BIGINT IDENTITY | NO       | auto    | -    | PK                     |
| card_id           | BIGINT          | NO       | -       | card | 카드 FK                  |
| period_name       | VARCHAR(100)    | NO       | -       | -    | 기간명 ('2025 연말 특별 인정') |
| start_date        | DATE            | NO       | -       | -    | 시작일                    |
| end_date          | DATE            | NO       | -       | -    | 종료일                    |
| credit_multiplier | NUMERIC(3,2)    | NO       | 1.00    | -    | 실적 배율 (1.5 = 1.5배)    |
| is_active         | BOOLEAN         | NO       | true    | -    | 활성 여부                  |
| description       | TEXT            | YES      | -       | -    | 설명                     |
| created_at        | TIMESTAMPTZ     | NO       | now()   | -    | 생성일시                   |
| updated_at        | TIMESTAMPTZ     | NO       | now()   | -    | 수정일시                   |


> **CHECK 제약조건**: `end_date >= start_date`, `credit_multiplier > 0 AND <= 5.00`

---

### performance_exclusion_code

설명: 실적 제외 유형 마스터 코드. 세금, 상품권, 현금서비스 등 실적 제외 대상 유형을 코드화하여 카드 간 재사용한다.


| Column            | Type                              | Nullable | Default          | FK  | Description          |
| ----------------- | --------------------------------- | -------- | ---------------- | --- | -------------------- |
| exclusion_code_id | BIGINT IDENTITY                   | NO       | auto             | -   | PK                   |
| code              | VARCHAR(50)                       | NO       | -                | -   | 코드 (TAX, GIFT_CARD 등, UNIQUE) |
| name              | VARCHAR(100)                      | NO       | -                | -   | 코드명                  |
| description       | TEXT                              | YES      | -                | -   | 설명                   |
| default_scope     | performance_exclusion_scope_enum  | NO       | 'ALL_PERFORMANCE' | -   | 기본 제외 범위             |
| created_at        | TIMESTAMPTZ                       | NO       | now()            | -   | 생성일시                 |


---

### card_performance_exclusion

설명: 카드별 실적 제외 규칙. 카드 상품에 적용되는 실적 제외 코드와 범위를 정의한다. 동일 카드 발급 시 재사용 가능.


| Column                 | Type                              | Nullable | Default | FK                      | Description |
| ---------------------- | --------------------------------- | -------- | ------- | ----------------------- | ----------- |
| card_perf_exclusion_id | BIGINT IDENTITY                   | NO       | auto    | -                       | PK          |
| card_id                | BIGINT                            | NO       | -       | card                    | 카드 FK       |
| exclusion_code_id      | BIGINT                            | NO       | -       | performance_exclusion_code | 제외 코드 FK    |
| effective_scope        | performance_exclusion_scope_enum  | NO       | -       | -                       | 적용 범위       |
| is_active              | BOOLEAN                           | NO       | true    | -                       | 활성 여부       |
| valid_from             | DATE                              | YES      | -       | -                       | 유효 시작일      |
| valid_until            | DATE                              | YES      | -       | -                       | 유효 종료일      |


> **UNIQUE 제약조건**: `(card_id, exclusion_code_id)`

---

## Domain 2: Account

사용자 계정, 프로필, 구독, 알림 설정 관련 4개 테이블.

---

### account

설명: 사용자 계정. Supabase Auth의 uid를 PK로 사용하여 인증 시스템과 연동한다.


| Column     | Type         | Nullable | Default | FK  | Description            |
| ---------- | ------------ | -------- | ------- | --- | ---------------------- |
| account_id | UUID         | NO       | -       | -   | PK (Supabase Auth uid) |
| email      | VARCHAR(255) | NO       | -       | -   | 이메일 (UNIQUE)           |
| is_admin   | BOOLEAN      | NO       | false   | -   | 관리자 여부                 |
| created_at | TIMESTAMPTZ  | NO       | now()   | -   | 생성일시                   |


---

### account_profile

설명: 사용자 프로필. 계정과 1:1 관계로 표시명, 성별, 출생연도 등 선택적 프로필 정보를 관리한다.


| Column             | Type            | Nullable | Default | FK               | Description |
| ------------------ | --------------- | -------- | ------- | ---------------- | ----------- |
| account_profile_id | BIGINT IDENTITY | NO       | auto    | -                | PK          |
| account_id         | UUID            | NO       | -       | account (UNIQUE) | 1:1 관계      |
| display_name       | VARCHAR(50)     | YES      | -       | -                | 표시명         |
| gender             | gender_enum     | YES      | -       | -                | 성별          |
| birth_year         | INT             | YES      | -       | -                | 출생연도        |
| created_at         | TIMESTAMPTZ     | NO       | now()   | -                | 생성일시        |
| updated_at         | TIMESTAMPTZ     | NO       | now()   | -                | 수정일시        |


---

### subscription

설명: 구독 정보. 사용자의 무료/프리미엄 구독 플랜 상태와 유효 기간을 관리한다.


| Column            | Type                   | Nullable | Default | FK      | Description |
| ----------------- | ---------------------- | -------- | ------- | ------- | ----------- |
| subscription_id   | BIGINT IDENTITY        | NO       | auto    | -       | PK          |
| account_id        | UUID                   | NO       | -       | account | 사용자 FK      |
| subscription_plan | subscription_plan_enum | NO       | 'FREE'  | -       | 구독 플랜       |
| started_at        | TIMESTAMPTZ            | NO       | now()   | -       | 구독 시작일      |
| expired_at        | TIMESTAMPTZ            | YES      | -       | -       | 만료일         |
| created_at        | TIMESTAMPTZ            | NO       | now()   | -       | 생성일시        |


---

### notification_setting

설명: 알림 설정. 계정과 1:1 관계로 바우처 만료 알림, 실적 리마인더 등 알림 수신 여부를 관리한다.


| Column                  | Type            | Nullable | Default | FK               | Description |
| ----------------------- | --------------- | -------- | ------- | ---------------- | ----------- |
| notification_setting_id | BIGINT IDENTITY | NO       | auto    | -                | PK          |
| account_id              | UUID            | NO       | -       | account (UNIQUE) | 1:1 관계      |
| voucher_expiry_alert    | BOOLEAN         | NO       | true    | -                | 바우처 만료 알림   |
| performance_reminder    | BOOLEAN         | NO       | true    | -                | 실적 리마인더     |
| payment_confirm_alert   | BOOLEAN         | NO       | true    | -                | 결제 확인 알림    |
| email_notification      | BOOLEAN         | NO       | false   | -                | 이메일 알림      |
| push_notification       | BOOLEAN         | NO       | true    | -                | 푸시 알림       |
| updated_at              | TIMESTAMPTZ     | NO       | now()   | -                | 수정일시        |


---

## Domain 3: User Card

사용자의 카드 등록, 실적 추적, 바우처/혜택 사용 현황 관련 5개 테이블.

---

### user_card

설명: 사용자 보유 카드. 사용자가 등록한 카드와 별칭, 발급일, 주카드 여부 등을 관리한다.


| Column        | Type            | Nullable | Default | FK      | Description |
| ------------- | --------------- | -------- | ------- | ------- | ----------- |
| user_card_id  | BIGINT IDENTITY | NO       | auto    | -       | PK          |
| account_id    | UUID            | NO       | -       | account | 사용자 FK      |
| card_id       | BIGINT          | NO       | -       | card    | 카드 상품 FK    |
| card_nickname | VARCHAR(50)     | YES      | -       | -       | 사용자 지정 별칭   |
| issued_at     | DATE            | NO       | -       | -       | 카드 발급일      |
| is_primary    | BOOLEAN         | NO       | false   | -       | 주 사용 카드 여부  |
| is_active     | BOOLEAN         | NO       | true    | -       | 활성 여부       |
| created_at    | TIMESTAMPTZ     | NO       | now()   | -       | 생성일시        |
| updated_at    | TIMESTAMPTZ     | NO       | now()   | -       | 수정일시        |


---

### user_performance

설명: 사용자 월별 실적 현황. 보유 카드별 월간 사용 금액과 현재 달성한 실적 구간을 추적한다.


| Column              | Type            | Nullable | Default | FK               | Description          |
| ------------------- | --------------- | -------- | ------- | ---------------- | -------------------- |
| user_performance_id | BIGINT IDENTITY | NO       | auto    | -                | PK                   |
| user_card_id        | BIGINT          | NO       | -       | user_card        | 사용자 카드 FK            |
| performance_tier_id | BIGINT          | YES      | -       | performance_tier | 현재 달성 구간             |
| year_month          | CHAR(7)         | NO       | -       | -                | 대상 연월 ('YYYY-MM')    |
| monthly_spent       | BIGINT          | NO       | 0       | -                | 월간 사용액               |
| annual_accumulated  | BIGINT          | NO       | 0       | -                | 연간 누적 (issued_at 기준) |
| created_at          | TIMESTAMPTZ     | NO       | now()   | -                | 생성일시                 |
| updated_at          | TIMESTAMPTZ     | NO       | now()   | -                | 수정일시                 |


> **UNIQUE 제약조건**: `(user_card_id, year_month)`

---

### user_voucher

설명: 사용자 바우처 현황. 보유 카드의 바우처별 잔여 횟수와 유효 기간을 추적한다.


| Column          | Type            | Nullable | Default | FK           | Description    |
| --------------- | --------------- | -------- | ------- | ------------ | -------------- |
| user_voucher_id | BIGINT IDENTITY | NO       | auto    | -            | PK             |
| user_card_id    | BIGINT          | NO       | -       | user_card    | 사용자 카드 FK      |
| card_voucher_id | BIGINT          | NO       | -       | card_voucher | 카드 바우처 FK      |
| remaining_count | INT             | NO       | -       | -            | 잔여 횟수          |
| total_count     | INT             | NO       | -       | -            | 기간 총 횟수 (역정규화) |
| valid_from      | DATE            | NO       | -       | -            | 유효 시작일         |
| valid_until     | DATE            | NO       | -       | -            | 유효 종료일         |
| created_at      | TIMESTAMPTZ     | NO       | now()   | -            | 생성일시           |
| updated_at      | TIMESTAMPTZ     | NO       | now()   | -            | 수정일시           |


---

### user_voucher_log

설명: 바우처 사용/취소 로그. 바우처 사용 및 취소 이력을 기록하여 잔여 횟수 변경을 추적한다.


| Column              | Type                | Nullable | Default | FK           | Description |
| ------------------- | ------------------- | -------- | ------- | ------------ | ----------- |
| user_voucher_log_id | BIGINT IDENTITY     | NO       | auto    | -            | PK          |
| user_voucher_id     | BIGINT              | NO       | -       | user_voucher | 사용자 바우처 FK  |
| voucher_action      | voucher_action_enum | NO       | -       | -            | USE/CANCEL  |
| memo                | TEXT                | YES      | -       | -            | 메모          |
| created_at          | TIMESTAMPTZ         | NO       | now()   | -            | 생성일시        |


---

### user_benefit_usage

설명: 혜택 사용 현황. 사용자가 카드 혜택을 월별로 얼마나 사용했는지 횟수와 금액을 집계한다.


| Column                | Type            | Nullable | Default | FK           | Description       |
| --------------------- | --------------- | -------- | ------- | ------------ | ----------------- |
| user_benefit_usage_id | BIGINT IDENTITY | NO       | auto    | -            | PK                |
| user_card_id          | BIGINT          | NO       | -       | user_card    | 사용자 카드 FK         |
| card_benefit_id       | BIGINT          | NO       | -       | card_benefit | 카드 혜택 FK          |
| year_month            | CHAR(7)         | NO       | -       | -            | 대상 연월 ('YYYY-MM') |
| used_count            | INT             | NO       | 0       | -            | 사용 횟수             |
| used_amount           | BIGINT          | NO       | 0       | -            | 사용 금액             |
| created_at            | TIMESTAMPTZ     | NO       | now()   | -            | 생성일시              |
| updated_at            | TIMESTAMPTZ     | NO       | now()   | -            | 수정일시              |


> **UNIQUE 제약조건**: `(user_card_id, card_benefit_id, year_month)`

---

## Domain 4: Ledger

결제 내역, 태그, 결제 초안, 이메일 파싱, 환율, 보정, 인박스 관련 9개 테이블.

---

### payment

설명: 결제 내역. 사용자의 카드 결제 기록을 관리하며, 해외 결제 시 환율 정보를 연동한다. soft delete를 지원한다.


| Column            | Type                | Nullable | Default  | FK                     | Description         |
| ----------------- | ------------------- | -------- | -------- | ---------------------- | ------------------- |
| payment_id        | BIGINT IDENTITY     | NO       | auto     | -                      | PK                  |
| account_id        | UUID                | NO       | -        | account                | 사용자 FK              |
| user_card_id      | BIGINT              | NO       | -        | user_card              | 사용자 카드 FK           |
| group_id          | BIGINT              | YES      | -        | ledger_group           | 그룹 가계부 FK (NULL=개인) |
| merchant_id       | BIGINT              | YES      | -        | merchant               | 가맹점 FK (NULL=매칭 실패) |
| merchant_name_raw | VARCHAR(200)        | NO       | -        | -                      | 원본 가맹점명             |
| paid_at           | TIMESTAMPTZ         | NO       | -        | -                      | 결제 시각               |
| currency          | currency_enum       | NO       | 'KRW'    | -                      | 결제 통화               |
| original_amount   | BIGINT              | YES      | -        | -                      | 해외결제 원본 금액          |
| krw_amount        | BIGINT              | NO       | -        | -                      | KRW 환산 금액           |
| exchange_rate_id  | BIGINT              | YES      | -        | exchange_rate_snapshot | 환율 스냅샷 FK           |
| payment_source    | payment_source_enum | NO       | 'MANUAL' | -                      | 결제 입력 경로            |
| memo              | TEXT                | YES      | -        | -                      | 메모                  |
| final_krw_amount | BIGINT | YES | - | - | 보정 후 확정액 (NULL=미보정) |
| is_adjusted | BOOLEAN | NO | false | - | 보정 완료 여부 |
| external_transaction_id | VARCHAR(100) | YES | - | - | 마이데이터 트랜잭션 ID (향후) |
| deleted_at        | TIMESTAMPTZ         | YES      | -        | -                      | 삭제일시 (soft delete)  |
| created_at        | TIMESTAMPTZ         | NO       | now()    | -                      | 생성일시                |
| updated_at        | TIMESTAMPTZ         | NO       | now()    | -                      | 수정일시                |


> **CHECK 제약조건**: 통화에 따라 해외결제 관련 컬럼의 NULL 여부가 결정된다.
>
> - `KRW` → `original_amount NULL`, `exchange_rate_id NULL`
> - 기타 통화 → `original_amount NOT NULL`

---

### payment_item

설명: 결제 품목 상세. 하나의 결제에 포함된 개별 품목과 적용된 혜택 금액을 기록한다.


| Column          | Type            | Nullable | Default | FK           | Description |
| --------------- | --------------- | -------- | ------- | ------------ | ----------- |
| payment_item_id | BIGINT IDENTITY | NO       | auto    | -            | PK          |
| payment_id      | BIGINT          | NO       | -       | payment      | 결제 FK       |
| item_name       | VARCHAR(200)    | NO       | -       | -            | 품목명         |
| amount          | BIGINT          | NO       | -       | -            | KRW 금액      |
| category_id     | BIGINT          | YES      | -       | category     | 카테고리 FK     |
| card_benefit_id | BIGINT          | YES      | -       | card_benefit | 적용된 혜택 FK   |
| benefit_amount  | BIGINT          | NO       | 0       | -            | KRW 혜택 금액   |
| excluded_from_performance | BOOLEAN | NO | false | - | 사용자 직접 실적 제외 설정 |
| created_at      | TIMESTAMPTZ     | NO       | now()   | -            | 생성일시        |


---

### tag

설명: 사용자 정의 태그. 결제 품목에 부착할 수 있는 사용자별 커스텀 태그를 관리한다.


| Column     | Type            | Nullable | Default | FK      | Description |
| ---------- | --------------- | -------- | ------- | ------- | ----------- |
| tag_id     | BIGINT IDENTITY | NO       | auto    | -            | PK          |
| account_id | UUID            | NO       | -       | account      | 사용자 FK      |
| tag_name   | VARCHAR(50)     | NO       | -       | -            | 태그명         |
| color      | VARCHAR(7)      | YES      | -       | -            | HEX 색상코드    |
| group_id   | BIGINT          | YES      | -       | ledger_group | 그룹 태그 시 그룹 FK (NULL=개인) |
| created_at | TIMESTAMPTZ     | NO       | now()   | -            | 생성일시        |


> **UNIQUE 제약조건**: `(account_id, tag_name) WHERE group_id IS NULL` 과 `(group_id, tag_name) WHERE group_id IS NOT NULL` (2개 partial unique index)

---

### payment_item_tag

설명: 결제 품목-태그 매핑. 결제 품목과 태그 간의 다대다(M:N) 관계를 표현하는 연결 테이블.


| Column          | Type   | Nullable | Default | FK           | Description             |
| --------------- | ------ | -------- | ------- | ------------ | ----------------------- |
| payment_item_id | BIGINT | NO       | -       | payment_item | 결제 품목 FK (composite PK) |
| tag_id          | BIGINT | NO       | -       | tag          | 태그 FK (composite PK)    |


---

### payment_draft

설명: 결제 초안. 이메일/SMS 등으로 자동 수집된 결제 데이터를 사용자 확인 전까지 임시 저장하는 테이블.


| Column                 | Type                      | Nullable | Default   | FK        | Description           |
| ---------------------- | ------------------------- | -------- | --------- | --------- | --------------------- |
| payment_draft_id       | BIGINT IDENTITY           | NO       | auto      | -         | PK                    |
| account_id             | UUID                      | NO       | -         | account   | 사용자 FK                |
| user_card_id           | BIGINT                    | YES      | -         | user_card | 사용자 카드 FK             |
| payment_id             | BIGINT                    | YES      | -         | payment   | CONFIRMED 후 연결된 결제 FK |
| raw_data               | JSONB                     | NO       | -         | -         | 파싱 원본 데이터             |
| parsed_merchant_name   | VARCHAR(200)              | YES      | -         | -         | 파싱된 가맹점명              |
| parsed_amount          | BIGINT                    | YES      | -         | -         | 파싱된 금액 (KRW)          |
| parsed_currency        | currency_enum             | YES      | 'KRW'     | -         | 파싱된 통화                |
| parsed_original_amount | BIGINT                    | YES      | -         | -         | 해외결제 파싱된 원본 금액        |
| parsed_paid_at         | TIMESTAMPTZ               | YES      | -         | -         | 파싱된 결제 시각             |
| draft_status           | payment_draft_status_enum | NO       | 'PENDING' | -         | 초안 상태                 |
| created_at             | TIMESTAMPTZ               | NO       | now()     | -         | 생성일시                  |
| updated_at             | TIMESTAMPTZ               | NO       | now()     | -         | 수정일시                  |


---

### email_parse_rule

설명: 이메일 파싱 규칙. 카드사별 결제 알림 이메일의 발신자 패턴, 제목 패턴, 본문 파싱 정규식 등을 정의한다.


| Column              | Type            | Nullable | Default | FK           | Description   |
| ------------------- | --------------- | -------- | ------- | ------------ | ------------- |
| email_parse_rule_id | BIGINT IDENTITY | NO       | auto    | -            | PK            |
| card_company_id     | BIGINT          | NO       | -       | card_company | 카드사 FK        |
| sender_pattern      | VARCHAR(200)    | NO       | -       | -            | 이메일 발신자 패턴    |
| subject_pattern     | VARCHAR(200)    | YES      | -       | -            | 제목 패턴         |
| parse_config        | JSONB           | NO       | -       | -            | 파싱 규칙 (정규식 등) |
| is_active           | BOOLEAN         | NO       | true    | -            | 활성 여부         |
| created_at          | TIMESTAMPTZ     | NO       | now()   | -            | 생성일시          |
| updated_at          | TIMESTAMPTZ     | NO       | now()   | -            | 수정일시          |


---

### exchange_rate_snapshot

설명: 환율 스냅샷. 해외 결제 금액의 KRW 환산을 위해 일자별 환율 정보를 저장한다.


| Column           | Type            | Nullable | Default  | FK  | Description  |
| ---------------- | --------------- | -------- | -------- | --- | ------------ |
| exchange_rate_id | BIGINT IDENTITY | NO       | auto     | -   | PK           |
| currency         | currency_enum   | NO       | -        | -   | 원본 통화        |
| rate_to_krw      | NUMERIC(12,4)   | NO       | -        | -   | 1 외화 = ? KRW |
| rate_date        | DATE            | NO       | -        | -   | 환율 기준일       |
| source           | VARCHAR(50)     | NO       | 'MANUAL' | -   | 환율 출처        |
| created_at       | TIMESTAMPTZ     | NO       | now()    | -   | 생성일시         |


> **UNIQUE 제약조건**: `(currency, rate_date)`

---

### payment_adjustment

설명: 결제 금액 보정. 해외결제 환율 확정(매입 전표), 청구할인, 결제대금 차감 등 실제 청구 금액과의 차이를 기록한다.


| Column              | Type                         | Nullable | Default | FK      | Description                  |
| ------------------- | ---------------------------- | -------- | ------- | ------- | ---------------------------- |
| adjustment_id       | BIGINT IDENTITY              | NO       | auto    | -       | PK                           |
| payment_id          | BIGINT                       | NO       | -       | payment | 결제 FK                        |
| adjustment_type     | payment_adjustment_type_enum | NO       | -       | -       | 보정 유형                        |
| original_krw_amount | BIGINT                       | NO       | -       | -       | 보정 전 금액                      |
| adjusted_krw_amount | BIGINT                       | NO       | -       | -       | 보정 후 금액                      |
| difference_amount   | BIGINT (GENERATED STORED)    | NO       | -       | -       | 차액 (adjusted - original, 자동) |
| reason              | TEXT                         | YES      | -       | -       | 보정 사유                        |
| billed_at           | DATE                         | YES      | -       | -       | 실제 청구일 (FX 보정 시)             |
| created_at          | TIMESTAMPTZ                  | NO       | now()   | -       | 생성일시                         |


---

### user_pending_action

설명: 사용자 확인 필요 항목. FX 보정, 중복 결제 감지, 카테고리 미분류 등 사용자 액션이 필요한 항목을 관리하는 인박스.


| Column            | Type                     | Nullable | Default   | FK      | Description                |
| ----------------- | ------------------------ | -------- | --------- | ------- | -------------------------- |
| pending_action_id | BIGINT IDENTITY          | NO       | auto      | -       | PK                         |
| account_id        | UUID                     | NO       | -         | account | 사용자 FK                     |
| action_type       | pending_action_type_enum | NO       | -         | -       | 확인 유형                      |
| reference_table   | VARCHAR(50)              | YES      | -         | -       | 참조 테이블명 (polymorphic)      |
| reference_id      | BIGINT                   | YES      | -         | -       | 참조 레코드 ID                  |
| title             | VARCHAR(200)             | NO       | -         | -       | 제목                         |
| description       | TEXT                     | YES      | -         | -       | 상세 설명                      |
| status            | VARCHAR(20)              | NO       | 'PENDING' | -       | PENDING/RESOLVED/DISMISSED |
| priority          | VARCHAR(10)              | NO       | 'MEDIUM'  | -       | HIGH/MEDIUM/LOW            |
| created_at        | TIMESTAMPTZ              | NO       | now()     | -       | 생성일시                       |
| resolved_at       | TIMESTAMPTZ              | YES      | -         | -       | 처리 완료일시                    |


> **INDEX**: `(account_id, status)` — 미처리 항목 빠른 조회

---

## Domain 5: Analytics

월별 집계 요약 테이블 4개. 대시보드 및 통계 조회 성능을 위한 사전 집계 데이터를 저장한다.

---

### user_monthly_summary

설명: 사용자 월별 종합 요약. 계정별 월간 총 지출, 총 혜택, 결제 건수를 집계한다.


| Column                  | Type            | Nullable | Default | FK      | Description       |
| ----------------------- | --------------- | -------- | ------- | ------- | ----------------- |
| user_monthly_summary_id | BIGINT IDENTITY | NO       | auto    | -       | PK                |
| account_id              | UUID            | NO       | -       | account | 사용자 FK            |
| year_month              | CHAR(7)         | NO       | -       | -       | 대상 연월 ('YYYY-MM') |
| total_spent             | BIGINT          | NO       | 0       | -       | 총 지출 (KRW)        |
| total_benefit           | BIGINT          | NO       | 0       | -       | 총 혜택 (KRW)        |
| payment_count           | INT             | NO       | 0       | -       | 결제 건수             |
| created_at              | TIMESTAMPTZ     | NO       | now()   | -       | 생성일시              |
| updated_at              | TIMESTAMPTZ     | NO       | now()   | -       | 수정일시              |


> **UNIQUE 제약조건**: `(account_id, year_month)`

---

### user_category_summary

설명: 사용자 카테고리별 월간 요약. 업종/카테고리별 지출과 혜택 금액을 월 단위로 집계한다.


| Column                   | Type            | Nullable | Default | FK       | Description       |
| ------------------------ | --------------- | -------- | ------- | -------- | ----------------- |
| user_category_summary_id | BIGINT IDENTITY | NO       | auto    | -        | PK                |
| account_id               | UUID            | NO       | -       | account  | 사용자 FK            |
| category_id              | BIGINT          | NO       | -       | category | 카테고리 FK           |
| year_month               | CHAR(7)         | NO       | -       | -        | 대상 연월 ('YYYY-MM') |
| spent_amount             | BIGINT          | NO       | 0       | -        | 지출 금액             |
| benefit_amount           | BIGINT          | NO       | 0       | -        | 혜택 금액             |
| payment_count            | INT             | NO       | 0       | -        | 결제 건수             |
| created_at               | TIMESTAMPTZ     | NO       | now()   | -        | 생성일시              |
| updated_at               | TIMESTAMPTZ     | NO       | now()   | -        | 수정일시              |


> **UNIQUE 제약조건**: `(account_id, category_id, year_month)`

---

### user_tag_summary

설명: 사용자 태그별 월간 요약. 사용자 정의 태그별 지출 금액과 결제 건수를 월 단위로 집계한다.


| Column              | Type            | Nullable | Default | FK      | Description       |
| ------------------- | --------------- | -------- | ------- | ------- | ----------------- |
| user_tag_summary_id | BIGINT IDENTITY | NO       | auto    | -       | PK                |
| account_id          | UUID            | NO       | -       | account | 사용자 FK            |
| tag_id              | BIGINT          | NO       | -       | tag     | 태그 FK             |
| year_month          | CHAR(7)         | NO       | -       | -       | 대상 연월 ('YYYY-MM') |
| spent_amount        | BIGINT          | NO       | 0       | -       | 지출 금액             |
| payment_count       | INT             | NO       | 0       | -       | 결제 건수             |
| created_at          | TIMESTAMPTZ     | NO       | now()   | -       | 생성일시              |
| updated_at          | TIMESTAMPTZ     | NO       | now()   | -       | 수정일시              |


> **UNIQUE 제약조건**: `(account_id, tag_id, year_month)`

---

### user_card_summary

설명: 사용자 카드별 월간 요약. 보유 카드별 지출, 혜택, 결제 건수를 월 단위로 집계한다.


| Column               | Type            | Nullable | Default | FK        | Description       |
| -------------------- | --------------- | -------- | ------- | --------- | ----------------- |
| user_card_summary_id | BIGINT IDENTITY | NO       | auto    | -         | PK                |
| account_id           | UUID            | NO       | -       | account   | 사용자 FK            |
| user_card_id         | BIGINT          | NO       | -       | user_card | 사용자 카드 FK         |
| year_month           | CHAR(7)         | NO       | -       | -         | 대상 연월 ('YYYY-MM') |
| spent_amount         | BIGINT          | NO       | 0       | -         | 지출 금액             |
| benefit_amount       | BIGINT          | NO       | 0       | -         | 혜택 금액             |
| payment_count        | INT             | NO       | 0       | -         | 결제 건수             |
| created_at           | TIMESTAMPTZ     | NO       | now()   | -         | 생성일시              |
| updated_at           | TIMESTAMPTZ     | NO       | now()   | -         | 수정일시              |


> **UNIQUE 제약조건**: `(account_id, user_card_id, year_month)`

---

## Domain 6: Group

가족/그룹 공유 가계부 관련 3개 테이블.

---

### ledger_group

설명: 공유 가계부 그룹. 가족이나 친구 등이 함께 사용하는 공유 가계부 단위.

| Column | Type | Nullable | Default | FK | Description |
|--------|------|----------|---------|-----|-------------|
| group_id | BIGINT IDENTITY | NO | auto | - | PK |
| group_name | VARCHAR(50) | NO | - | - | 그룹명 (예: "우리 가족") |
| description | VARCHAR(200) | YES | - | - | 그룹 설명 |
| owner_account_id | UUID | NO | - | account | 그룹장 FK |
| max_members | INT | NO | 10 | - | 최대 멤버 수 |
| created_at | TIMESTAMPTZ | NO | now() | - | 생성일시 |
| updated_at | TIMESTAMPTZ | NO | now() | - | 수정일시 |

---

### group_member

설명: 그룹 멤버십. 각 그룹에 소속된 사용자와 역할(OWNER/MEMBER)을 관리한다.

| Column | Type | Nullable | Default | FK | Description |
|--------|------|----------|---------|-----|-------------|
| group_member_id | BIGINT IDENTITY | NO | auto | - | PK |
| group_id | BIGINT | NO | - | ledger_group | 그룹 FK |
| account_id | UUID | NO | - | account | 사용자 FK |
| role | group_role_enum | NO | 'MEMBER' | - | 역할 (OWNER/MEMBER) |
| joined_at | TIMESTAMPTZ | NO | now() | - | 가입일시 |

> **UNIQUE 제약조건**: `(group_id, account_id)` — 한 사용자가 같은 그룹에 중복 가입 방지

---

### group_invitation

설명: 그룹 초대 관리. 그룹장이 이메일로 멤버를 초대하고 수락/거절/만료를 추적한다.

| Column | Type | Nullable | Default | FK | Description |
|--------|------|----------|---------|-----|-------------|
| invitation_id | BIGINT IDENTITY | NO | auto | - | PK |
| group_id | BIGINT | NO | - | ledger_group | 그룹 FK |
| inviter_id | UUID | NO | - | account | 초대자 FK (OWNER) |
| invitee_email | VARCHAR(255) | NO | - | - | 피초대자 이메일 |
| invitation_status | invitation_status_enum | NO | 'PENDING' | - | 초대 상태 |
| expires_at | TIMESTAMPTZ | NO | - | - | 초대 만료일 (7일) |
| created_at | TIMESTAMPTZ | NO | now() | - | 생성일시 |
| updated_at | TIMESTAMPTZ | NO | now() | - | 수정일시 |

> **비즈니스 규칙**: 만료된 초대(expires_at < now())는 자동으로 EXPIRED 처리 (스케줄러 또는 조회 시 갱신)

---

## JSONB 스키마 문서

> 관계형 우선 + JSONB 보조 전략. 현재는 빈 객체 `{}` 기본값, 카드사별 엣지케이스 발생 시 점진적 활용.

### card.card_rules

| 키 | 타입 | 필수 | 설명 |
|----|------|------|------|
| grace_period.enabled | boolean | N | 그레이스 기간 활성화 여부 |
| grace_period.months | integer | N | 그레이스 기간 (월) |
| grace_period.min_spend_per_month | integer | N | 그레이스 기간 중 최소 월 사용액 (0=무조건) |
| grace_period.benefit_scope | string | N | ALL/PARTIAL — 그레이스 기간 중 혜택 범위 |
| notes | string | N | 기타 참고 사항 |

### card_benefit.activation_rules

| 키 | 타입 | 필수 | 설명 |
|----|------|------|------|
| grace_period_exempt | boolean | N | 그레이스 기간 중 이 혜택 면제 여부 |
| min_single_payment | integer | N | 최소 단건 결제 금액 |
| max_daily_usage | integer | N | 일일 최대 사용 횟수 |
| excluded_categories | string[] | N | 제외 카테고리 코드 목록 |
| time_restriction.days | string[] | N | 적용 요일 (MON~SUN) |
| time_restriction.start_time | string | N | 적용 시작 시간 (HH:MM) |
| time_restriction.end_time | string | N | 적용 종료 시간 (HH:MM) |
| seasonal.active_months | integer[] | N | 적용 월 목록 (1~12) |
| requires_linked_service | string | N | 필수 연동 서비스 설명 |
| custom_notes | string | N | 기타 참고 사항 |

### card_voucher.unlock_conditions

| 키 | 타입 | 필수 | 설명 |
|----|------|------|------|
| requires_annual_performance | integer | N | 필요 연간 실적 금액 |
| requires_tier_name | string | N | 필요 실적 구간명 |
| available_after_months | integer | N | 발급 후 N개월 후 사용 가능 |
| requires_previous_year_performance | boolean | N | 전년도 실적 필요 여부 |
| previous_year_min_amount | integer | N | 전년도 최소 실적 금액 |
| enrollment_required | string | N | 별도 신청 필요 여부 설명 |
| unlock_type | string | N | AUTO/MANUAL/ADMIN/NONE |
| notes | string | N | 기타 참고 사항 |

