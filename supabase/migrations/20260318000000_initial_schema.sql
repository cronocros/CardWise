-- Migration: Initial Schema (Full)
-- Created: 2026-03-18
-- Description: CardWise 전체 초기 스키마 (32 테이블, 17 ENUM, RLS)
-- Domains: Card, Account, UserCard, Ledger, Analytics

-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 가맹점 퍼지 검색용

-- =============================================================================
-- 1. ENUM TYPES (17개)
-- =============================================================================

CREATE TYPE card_type_enum            AS ENUM ('CREDIT', 'CHECK');
CREATE TYPE benefit_type_enum         AS ENUM ('DISCOUNT', 'POINT', 'CASHBACK', 'MILEAGE', 'INTEREST_FREE');
CREATE TYPE discount_type_enum        AS ENUM ('RATE', 'FIXED');
CREATE TYPE benefit_target_type_enum  AS ENUM ('CATEGORY', 'MERCHANT', 'ALL');
CREATE TYPE voucher_type_enum         AS ENUM ('COUPON', 'SERVICE', 'LOUNGE', 'INSURANCE', 'OTHER');
CREATE TYPE period_type_enum          AS ENUM ('MONTHLY', 'YEARLY', 'ONE_TIME');
CREATE TYPE crawl_source_type_enum    AS ENUM ('WEB', 'API', 'PDF');
CREATE TYPE crawl_status_enum         AS ENUM ('STARTED', 'SUCCESS', 'FAILED');
CREATE TYPE draft_status_enum         AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE change_type_enum          AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'EXPIRED');
CREATE TYPE reference_type_enum       AS ENUM ('BENEFIT', 'VOUCHER');
CREATE TYPE voucher_action_enum       AS ENUM ('USE', 'CANCEL');
CREATE TYPE payment_source_enum       AS ENUM ('MANUAL', 'EMAIL', 'SMS');
CREATE TYPE payment_draft_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
CREATE TYPE subscription_plan_enum    AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE gender_enum               AS ENUM ('M', 'F');
CREATE TYPE currency_enum             AS ENUM ('KRW', 'USD', 'EUR', 'JPY', 'CNY', 'GBP', 'THB', 'VND', 'SGD', 'AUD');

-- =============================================================================
-- 2. DOMAIN 1: CARD (12 테이블)
-- =============================================================================

-- 2-1. card_company
CREATE TABLE card_company (
  card_company_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_name     VARCHAR(50)   NOT NULL,
  logo_url         VARCHAR(500),
  website_url      VARCHAR(500),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2-2. card
CREATE TABLE card (
  card_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_company_id  BIGINT        NOT NULL REFERENCES card_company,
  card_name        VARCHAR(100)  NOT NULL,
  card_type        card_type_enum NOT NULL,
  annual_fee       BIGINT        NOT NULL DEFAULT 0,
  image_url        VARCHAR(500),
  description      TEXT,
  is_active        BOOLEAN       NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 2-3. performance_tier
CREATE TABLE performance_tier (
  performance_tier_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id              BIGINT  NOT NULL REFERENCES card,
  tier_name            VARCHAR(50) NOT NULL,
  min_amount           BIGINT  NOT NULL,
  max_amount           BIGINT,                  -- NULL = 무제한
  sort_order           INT     NOT NULL DEFAULT 0
);

-- 2-4. category (self-referencing)
CREATE TABLE category (
  category_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id      BIGINT REFERENCES category,   -- NULL = 최상위
  category_name  VARCHAR(100) NOT NULL,
  depth          INT          NOT NULL DEFAULT 0
);

-- 2-5. merchant
CREATE TABLE merchant (
  merchant_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id    BIGINT REFERENCES category,
  merchant_name  VARCHAR(200) NOT NULL,
  logo_url       VARCHAR(500)
);

-- 2-6. merchant_alias
CREATE TABLE merchant_alias (
  merchant_alias_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  merchant_id        BIGINT       NOT NULL REFERENCES merchant,
  alias_name         VARCHAR(200) NOT NULL,
  CONSTRAINT uq_merchant_alias_name UNIQUE (alias_name)
);

-- 2-7. card_benefit
CREATE TABLE card_benefit (
  card_benefit_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id               BIGINT                    NOT NULL REFERENCES card,
  performance_tier_id   BIGINT                    REFERENCES performance_tier,
  benefit_type          benefit_type_enum         NOT NULL,
  target_type           benefit_target_type_enum  NOT NULL,
  category_id           BIGINT                    REFERENCES category,
  merchant_id           BIGINT                    REFERENCES merchant,
  discount_type         discount_type_enum        NOT NULL,
  discount_value        NUMERIC(10,2)             NOT NULL,
  monthly_limit_count   INT,
  monthly_limit_amount  BIGINT,
  min_payment_amount    BIGINT                    DEFAULT 0,
  description           TEXT,
  is_active             BOOLEAN                   NOT NULL DEFAULT true,
  valid_from            DATE,
  valid_until           DATE,
  created_at            TIMESTAMPTZ               NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ               NOT NULL DEFAULT now(),
  -- target_type에 따른 FK NULL 규칙
  CONSTRAINT chk_card_benefit_target CHECK (
    (target_type = 'CATEGORY' AND category_id IS NOT NULL AND merchant_id IS NULL) OR
    (target_type = 'MERCHANT' AND merchant_id IS NOT NULL AND category_id IS NULL) OR
    (target_type = 'ALL'      AND category_id IS NULL     AND merchant_id IS NULL)
  )
);

-- 2-8. card_voucher
CREATE TABLE card_voucher (
  card_voucher_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id          BIGINT             NOT NULL REFERENCES card,
  voucher_name     VARCHAR(200)       NOT NULL,
  voucher_type     voucher_type_enum  NOT NULL,
  period_type      period_type_enum   NOT NULL,
  total_count      INT                NOT NULL,
  description      TEXT,
  is_active        BOOLEAN            NOT NULL DEFAULT true,
  valid_from       DATE,
  valid_until      DATE,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT now()
);

-- 2-9. card_benefit_history (polymorphic: BENEFIT / VOUCHER)
CREATE TABLE card_benefit_history (
  history_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference_type  reference_type_enum NOT NULL,
  reference_id    BIGINT              NOT NULL,  -- card_benefit_id 또는 card_voucher_id
  change_type     change_type_enum    NOT NULL,
  old_data        JSONB,
  new_data        JSONB,
  changed_at      TIMESTAMPTZ         NOT NULL DEFAULT now(),
  changed_by      VARCHAR(100)
);

-- 2-10. crawl_source
CREATE TABLE crawl_source (
  crawl_source_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_company_id  BIGINT                   NOT NULL REFERENCES card_company,
  source_type      crawl_source_type_enum   NOT NULL,
  source_url       VARCHAR(1000)            NOT NULL,
  config           JSONB,
  is_active        BOOLEAN                  NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ              NOT NULL DEFAULT now()
);

-- 2-11. crawl_log
CREATE TABLE crawl_log (
  crawl_log_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  crawl_source_id  BIGINT             NOT NULL REFERENCES crawl_source,
  crawl_status     crawl_status_enum  NOT NULL,
  started_at       TIMESTAMPTZ        NOT NULL DEFAULT now(),
  finished_at      TIMESTAMPTZ,
  error_message    TEXT,
  record_count     INT                DEFAULT 0
);

-- 2-12. crawl_draft
CREATE TABLE crawl_draft (
  crawl_draft_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  crawl_log_id    BIGINT               NOT NULL REFERENCES crawl_log,
  reference_type  reference_type_enum  NOT NULL,
  raw_data        JSONB                NOT NULL,
  draft_status    draft_status_enum    NOT NULL DEFAULT 'PENDING',
  reviewed_by     VARCHAR(100),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. DOMAIN 2: ACCOUNT (4 테이블)
-- =============================================================================

-- 3-1. account (Supabase Auth uid 연동)
CREATE TABLE account (
  account_id  UUID          PRIMARY KEY,   -- Supabase Auth uid
  email       VARCHAR(255)  NOT NULL,
  is_admin    BOOLEAN       NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT uq_account_email UNIQUE (email)
);

-- 3-2. account_profile (1:1)
CREATE TABLE account_profile (
  account_profile_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id          UUID         NOT NULL REFERENCES account,
  display_name        VARCHAR(50),
  gender              gender_enum,
  birth_year          INT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_account_profile UNIQUE (account_id)
);

-- 3-3. subscription
CREATE TABLE subscription (
  subscription_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id         UUID                    NOT NULL REFERENCES account,
  subscription_plan  subscription_plan_enum  NOT NULL DEFAULT 'FREE',
  started_at         TIMESTAMPTZ             NOT NULL DEFAULT now(),
  expired_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ             NOT NULL DEFAULT now()
);

-- 3-4. notification_setting (1:1)
CREATE TABLE notification_setting (
  notification_setting_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id               UUID         NOT NULL REFERENCES account,
  voucher_expiry_alert     BOOLEAN      NOT NULL DEFAULT true,
  performance_reminder     BOOLEAN      NOT NULL DEFAULT true,
  payment_confirm_alert    BOOLEAN      NOT NULL DEFAULT true,
  email_notification       BOOLEAN      NOT NULL DEFAULT false,
  push_notification        BOOLEAN      NOT NULL DEFAULT true,
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_notification_setting UNIQUE (account_id)
);

-- =============================================================================
-- 4. DOMAIN 3: USER CARD (5 테이블)
-- =============================================================================

-- 4-1. user_card
CREATE TABLE user_card (
  user_card_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id      UUID         NOT NULL REFERENCES account,
  card_id         BIGINT       NOT NULL REFERENCES card,
  card_nickname   VARCHAR(50),
  issued_at       DATE         NOT NULL,
  is_primary      BOOLEAN      NOT NULL DEFAULT false,
  is_active       BOOLEAN      NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 4-2. user_performance
CREATE TABLE user_performance (
  user_performance_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_card_id         BIGINT   NOT NULL REFERENCES user_card,
  performance_tier_id  BIGINT   REFERENCES performance_tier,
  year_month           CHAR(7)  NOT NULL,  -- 'YYYY-MM'
  monthly_spent        BIGINT   NOT NULL DEFAULT 0,
  annual_accumulated   BIGINT   NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_performance UNIQUE (user_card_id, year_month)
);

-- 4-3. user_voucher
CREATE TABLE user_voucher (
  user_voucher_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_card_id     BIGINT  NOT NULL REFERENCES user_card,
  card_voucher_id  BIGINT  NOT NULL REFERENCES card_voucher,
  remaining_count  INT     NOT NULL,
  total_count      INT     NOT NULL,  -- 역정규화 (빈번한 "3/5" 조회용)
  valid_from       DATE    NOT NULL,
  valid_until      DATE    NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4-4. user_voucher_log
CREATE TABLE user_voucher_log (
  user_voucher_log_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_voucher_id      BIGINT               NOT NULL REFERENCES user_voucher,
  voucher_action       voucher_action_enum  NOT NULL,
  memo                 TEXT,
  created_at           TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- 4-5. user_benefit_usage
CREATE TABLE user_benefit_usage (
  user_benefit_usage_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_card_id           BIGINT   NOT NULL REFERENCES user_card,
  card_benefit_id        BIGINT   NOT NULL REFERENCES card_benefit,
  year_month             CHAR(7)  NOT NULL,  -- 'YYYY-MM'
  used_count             INT      NOT NULL DEFAULT 0,
  used_amount            BIGINT   NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_benefit_usage UNIQUE (user_card_id, card_benefit_id, year_month)
);

-- =============================================================================
-- 5. DOMAIN 4: LEDGER (7 테이블)
-- =============================================================================

-- 5-1. exchange_rate_snapshot (payment FK 참조 전에 먼저 생성)
CREATE TABLE exchange_rate_snapshot (
  exchange_rate_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  currency          currency_enum   NOT NULL,
  rate_to_krw       NUMERIC(12,4)  NOT NULL,
  rate_date         DATE            NOT NULL,
  source            VARCHAR(50)     NOT NULL DEFAULT 'MANUAL',
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT uq_exchange_rate_currency_date UNIQUE (currency, rate_date)
);

-- 5-2. payment
CREATE TABLE payment (
  payment_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id         UUID                 NOT NULL REFERENCES account,
  user_card_id       BIGINT               NOT NULL REFERENCES user_card,
  merchant_id        BIGINT               REFERENCES merchant,  -- NULL = 매칭 실패
  merchant_name_raw  VARCHAR(200)         NOT NULL,
  paid_at            TIMESTAMPTZ          NOT NULL,
  currency           currency_enum        NOT NULL DEFAULT 'KRW',
  original_amount    BIGINT,              -- 해외결제 원본 금액 (최소 통화 단위)
  krw_amount         BIGINT               NOT NULL,
  exchange_rate_id   BIGINT               REFERENCES exchange_rate_snapshot,
  payment_source     payment_source_enum  NOT NULL DEFAULT 'MANUAL',
  memo               TEXT,
  deleted_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ          NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ          NOT NULL DEFAULT now(),
  -- 해외결제 시 원본 금액 필수
  CONSTRAINT chk_payment_currency CHECK (
    (currency = 'KRW' AND original_amount IS NULL AND exchange_rate_id IS NULL) OR
    (currency != 'KRW' AND original_amount IS NOT NULL)
  )
);

-- 5-3. payment_item
CREATE TABLE payment_item (
  payment_item_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id       BIGINT  NOT NULL REFERENCES payment,
  item_name        VARCHAR(200) NOT NULL,
  amount           BIGINT  NOT NULL,  -- KRW 기준
  category_id      BIGINT  REFERENCES category,
  card_benefit_id  BIGINT  REFERENCES card_benefit,
  benefit_amount   BIGINT  NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5-4. tag
CREATE TABLE tag (
  tag_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id  UUID         NOT NULL REFERENCES account,
  tag_name    VARCHAR(50)  NOT NULL,
  color       VARCHAR(7),  -- HEX 색상코드 (#RRGGBB)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_tag_account_name UNIQUE (account_id, tag_name)
);

-- 5-5. payment_item_tag (M:N, composite PK)
CREATE TABLE payment_item_tag (
  payment_item_id  BIGINT  NOT NULL REFERENCES payment_item,
  tag_id           BIGINT  NOT NULL REFERENCES tag,
  PRIMARY KEY (payment_item_id, tag_id)
);

-- 5-6. payment_draft
CREATE TABLE payment_draft (
  payment_draft_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id              UUID                       NOT NULL REFERENCES account,
  user_card_id            BIGINT                     REFERENCES user_card,
  payment_id              BIGINT                     REFERENCES payment,  -- CONFIRMED 후 연결
  raw_data                JSONB                      NOT NULL,
  parsed_merchant_name    VARCHAR(200),
  parsed_amount           BIGINT,
  parsed_currency         currency_enum              DEFAULT 'KRW',
  parsed_original_amount  BIGINT,
  parsed_paid_at          TIMESTAMPTZ,
  draft_status            payment_draft_status_enum  NOT NULL DEFAULT 'PENDING',
  created_at              TIMESTAMPTZ                NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ                NOT NULL DEFAULT now()
);

-- 5-7. email_parse_rule
CREATE TABLE email_parse_rule (
  email_parse_rule_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_company_id      BIGINT        NOT NULL REFERENCES card_company,
  sender_pattern       VARCHAR(200)  NOT NULL,
  subject_pattern      VARCHAR(200),
  parse_config         JSONB         NOT NULL,
  is_active            BOOLEAN       NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- =============================================================================
-- 6. DOMAIN 5: ANALYTICS (4 테이블, 역정규화)
-- =============================================================================

-- 6-1. user_monthly_summary
CREATE TABLE user_monthly_summary (
  user_monthly_summary_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id               UUID     NOT NULL REFERENCES account,
  year_month               CHAR(7)  NOT NULL,
  total_spent              BIGINT   NOT NULL DEFAULT 0,
  total_benefit            BIGINT   NOT NULL DEFAULT 0,
  payment_count            INT      NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_monthly_summary UNIQUE (account_id, year_month)
);

-- 6-2. user_category_summary
CREATE TABLE user_category_summary (
  user_category_summary_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id                UUID     NOT NULL REFERENCES account,
  category_id               BIGINT   NOT NULL REFERENCES category,
  year_month                CHAR(7)  NOT NULL,
  spent_amount              BIGINT   NOT NULL DEFAULT 0,
  benefit_amount            BIGINT   NOT NULL DEFAULT 0,
  payment_count             INT      NOT NULL DEFAULT 0,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_category_summary UNIQUE (account_id, category_id, year_month)
);

-- 6-3. user_tag_summary
CREATE TABLE user_tag_summary (
  user_tag_summary_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id           UUID     NOT NULL REFERENCES account,
  tag_id               BIGINT   NOT NULL REFERENCES tag,
  year_month           CHAR(7)  NOT NULL,
  spent_amount         BIGINT   NOT NULL DEFAULT 0,
  payment_count        INT      NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_tag_summary UNIQUE (account_id, tag_id, year_month)
);

-- 6-4. user_card_summary
CREATE TABLE user_card_summary (
  user_card_summary_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id            UUID     NOT NULL REFERENCES account,
  user_card_id          BIGINT   NOT NULL REFERENCES user_card,
  year_month            CHAR(7)  NOT NULL,
  spent_amount          BIGINT   NOT NULL DEFAULT 0,
  benefit_amount        BIGINT   NOT NULL DEFAULT 0,
  payment_count         INT      NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_card_summary UNIQUE (account_id, user_card_id, year_month)
);

-- =============================================================================
-- 7. INDEXES
-- =============================================================================

-- 가맹점 퍼지 검색
CREATE UNIQUE INDEX idx_merchant_alias_name ON merchant_alias (alias_name);
CREATE INDEX idx_merchant_alias_trgm ON merchant_alias USING GIN (alias_name gin_trgm_ops);

-- 카드 혜택 조회 (핵심 쿼리)
CREATE INDEX idx_card_benefit_merchant  ON card_benefit (merchant_id)  WHERE is_active = true;
CREATE INDEX idx_card_benefit_category  ON card_benefit (category_id)  WHERE is_active = true;
CREATE INDEX idx_card_benefit_card_tier ON card_benefit (card_id, performance_tier_id);

-- 가계부 조회
CREATE INDEX idx_payment_account_date   ON payment (account_id, paid_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_payment_foreign        ON payment (account_id, currency)      WHERE currency != 'KRW';
CREATE INDEX idx_payment_item_payment   ON payment_item (payment_id);

-- 사용자 대시보드
CREATE INDEX idx_user_card_account      ON user_card (account_id);
CREATE INDEX idx_user_benefit_usage     ON user_benefit_usage (user_card_id, year_month);
CREATE INDEX idx_user_voucher_card      ON user_voucher (user_card_id);

-- 환율
CREATE INDEX idx_exchange_rate_date     ON exchange_rate_snapshot (currency, rate_date);

-- Analytics
CREATE INDEX idx_user_monthly_summary_account   ON user_monthly_summary (account_id, year_month);
CREATE INDEX idx_user_category_summary_account  ON user_category_summary (account_id, year_month);
CREATE INDEX idx_user_card_summary_account      ON user_card_summary (account_id, year_month);

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- 관리자 공통 헬퍼 (인라인 서브쿼리로 사용)
-- EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)

-- ── Domain 1: Card (Master Data) ─────────────────────────────────────────────
-- 모든 인증 사용자 SELECT 허용, 변경은 admin만

ALTER TABLE card_company          ENABLE ROW LEVEL SECURITY;
ALTER TABLE card                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_tier      ENABLE ROW LEVEL SECURITY;
ALTER TABLE category              ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant              ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_alias        ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_benefit          ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_voucher          ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_benefit_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_source          ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_log             ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_draft           ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 (인증 사용자)
CREATE POLICY "card_company_select_authenticated" ON card_company FOR SELECT TO authenticated USING (true);
CREATE POLICY "card_select_authenticated"         ON card         FOR SELECT TO authenticated USING (true);
CREATE POLICY "performance_tier_select"           ON performance_tier FOR SELECT TO authenticated USING (true);
CREATE POLICY "category_select_authenticated"     ON category     FOR SELECT TO authenticated USING (true);
CREATE POLICY "merchant_select_authenticated"     ON merchant     FOR SELECT TO authenticated USING (true);
CREATE POLICY "merchant_alias_select"             ON merchant_alias FOR SELECT TO authenticated USING (true);
CREATE POLICY "card_benefit_select_authenticated" ON card_benefit  FOR SELECT TO authenticated USING (true);
CREATE POLICY "card_voucher_select_authenticated" ON card_voucher  FOR SELECT TO authenticated USING (true);
CREATE POLICY "card_benefit_history_select"       ON card_benefit_history FOR SELECT TO authenticated USING (true);

-- 관리자 전용 쓰기
CREATE POLICY "card_company_admin_all" ON card_company FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "card_admin_all" ON card FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "card_benefit_admin_all" ON card_benefit FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "card_voucher_admin_all" ON card_voucher FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "crawl_source_admin_all" ON crawl_source FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "crawl_log_admin_all" ON crawl_log FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "crawl_draft_admin_all" ON crawl_draft FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);

-- ── Domain 2: Account ─────────────────────────────────────────────────────────

ALTER TABLE account               ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_profile       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_setting  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "account_select_own" ON account FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "account_insert_own" ON account FOR INSERT WITH CHECK (account_id = auth.uid());

CREATE POLICY "account_profile_select_own" ON account_profile FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "account_profile_insert_own" ON account_profile FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "account_profile_update_own" ON account_profile FOR UPDATE USING (account_id = auth.uid());

CREATE POLICY "subscription_select_own" ON subscription FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "subscription_admin_all"  ON subscription FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "notification_setting_select_own" ON notification_setting FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "notification_setting_insert_own" ON notification_setting FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "notification_setting_update_own" ON notification_setting FOR UPDATE USING (account_id = auth.uid());

-- ── Domain 3: User Card ───────────────────────────────────────────────────────

ALTER TABLE user_card          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_performance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voucher       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voucher_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_benefit_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_card_select_own" ON user_card FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "user_card_insert_own" ON user_card FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "user_card_update_own" ON user_card FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "user_card_delete_own" ON user_card FOR DELETE USING (account_id = auth.uid());

CREATE POLICY "user_performance_select_own" ON user_performance FOR SELECT
  USING (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));
CREATE POLICY "user_performance_insert_own" ON user_performance FOR INSERT
  WITH CHECK (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));
CREATE POLICY "user_performance_update_own" ON user_performance FOR UPDATE
  USING (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));

CREATE POLICY "user_voucher_select_own" ON user_voucher FOR SELECT
  USING (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));
CREATE POLICY "user_voucher_insert_own" ON user_voucher FOR INSERT
  WITH CHECK (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));
CREATE POLICY "user_voucher_update_own" ON user_voucher FOR UPDATE
  USING (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));

CREATE POLICY "user_voucher_log_select_own" ON user_voucher_log FOR SELECT
  USING (user_voucher_id IN (
    SELECT uv.user_voucher_id FROM user_voucher uv
    JOIN user_card uc ON uc.user_card_id = uv.user_card_id
    WHERE uc.account_id = auth.uid()
  ));
CREATE POLICY "user_voucher_log_insert_own" ON user_voucher_log FOR INSERT
  WITH CHECK (user_voucher_id IN (
    SELECT uv.user_voucher_id FROM user_voucher uv
    JOIN user_card uc ON uc.user_card_id = uv.user_card_id
    WHERE uc.account_id = auth.uid()
  ));

CREATE POLICY "user_benefit_usage_select_own" ON user_benefit_usage FOR SELECT
  USING (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));
CREATE POLICY "user_benefit_usage_insert_own" ON user_benefit_usage FOR INSERT
  WITH CHECK (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));
CREATE POLICY "user_benefit_usage_update_own" ON user_benefit_usage FOR UPDATE
  USING (user_card_id IN (SELECT user_card_id FROM user_card WHERE account_id = auth.uid()));

-- ── Domain 4: Ledger ──────────────────────────────────────────────────────────

ALTER TABLE exchange_rate_snapshot  ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_item            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_item_tag        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_draft           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_parse_rule        ENABLE ROW LEVEL SECURITY;

-- 환율은 전체 인증 사용자 읽기 가능
CREATE POLICY "exchange_rate_select_authenticated" ON exchange_rate_snapshot FOR SELECT TO authenticated USING (true);
CREATE POLICY "exchange_rate_admin_all" ON exchange_rate_snapshot FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "payment_select_own" ON payment FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "payment_insert_own" ON payment FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "payment_update_own" ON payment FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "payment_delete_own" ON payment FOR DELETE USING (account_id = auth.uid());

CREATE POLICY "payment_item_select_own" ON payment_item FOR SELECT
  USING (payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid()));
CREATE POLICY "payment_item_insert_own" ON payment_item FOR INSERT
  WITH CHECK (payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid()));
CREATE POLICY "payment_item_update_own" ON payment_item FOR UPDATE
  USING (payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid()));
CREATE POLICY "payment_item_delete_own" ON payment_item FOR DELETE
  USING (payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid()));

CREATE POLICY "tag_select_own" ON tag FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "tag_insert_own" ON tag FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "tag_update_own" ON tag FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "tag_delete_own" ON tag FOR DELETE USING (account_id = auth.uid());

CREATE POLICY "payment_item_tag_select_own" ON payment_item_tag FOR SELECT
  USING (payment_item_id IN (
    SELECT pi.payment_item_id FROM payment_item pi
    JOIN payment p ON p.payment_id = pi.payment_id
    WHERE p.account_id = auth.uid()
  ));
CREATE POLICY "payment_item_tag_insert_own" ON payment_item_tag FOR INSERT
  WITH CHECK (payment_item_id IN (
    SELECT pi.payment_item_id FROM payment_item pi
    JOIN payment p ON p.payment_id = pi.payment_id
    WHERE p.account_id = auth.uid()
  ));
CREATE POLICY "payment_item_tag_delete_own" ON payment_item_tag FOR DELETE
  USING (payment_item_id IN (
    SELECT pi.payment_item_id FROM payment_item pi
    JOIN payment p ON p.payment_id = pi.payment_id
    WHERE p.account_id = auth.uid()
  ));

CREATE POLICY "payment_draft_select_own" ON payment_draft FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "payment_draft_insert_own" ON payment_draft FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "payment_draft_update_own" ON payment_draft FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "payment_draft_delete_own" ON payment_draft FOR DELETE USING (account_id = auth.uid());

CREATE POLICY "email_parse_rule_select" ON email_parse_rule FOR SELECT TO authenticated USING (true);
CREATE POLICY "email_parse_rule_admin_all" ON email_parse_rule FOR ALL USING (
  EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
);

-- ── Domain 5: Analytics ───────────────────────────────────────────────────────

ALTER TABLE user_monthly_summary   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_summary  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tag_summary       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_summary      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_monthly_summary_select_own"  ON user_monthly_summary  FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "user_category_summary_select_own" ON user_category_summary FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "user_tag_summary_select_own"      ON user_tag_summary      FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "user_card_summary_select_own"     ON user_card_summary     FOR SELECT USING (account_id = auth.uid());

-- Analytics 쓰기는 서비스 롤(service_role)에서만 허용 (배치/이벤트 집계)
-- service_role은 RLS 우회하므로 별도 정책 불필요

-- =============================================================================
-- 9. TRIGGERS (updated_at 자동 갱신)
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- updated_at 컬럼이 있는 테이블에 트리거 부착
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'card_company', 'card', 'card_benefit', 'card_voucher',
    'account_profile', 'notification_setting',
    'user_card', 'user_performance', 'user_voucher', 'user_benefit_usage',
    'payment', 'payment_draft', 'email_parse_rule',
    'user_monthly_summary', 'user_category_summary', 'user_tag_summary', 'user_card_summary'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;
