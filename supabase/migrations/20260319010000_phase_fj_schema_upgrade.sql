-- Migration: Phase F~J Schema Upgrade
-- Created: 2026-03-19
-- Description:
--   Align schema with final design (41 tables, 26 ENUMs, JSONB rule-support columns)
--   while keeping the original initial migration intact.

-- =============================================================================
-- 1) ENUM TYPES (26 total target)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_role_enum') THEN
    CREATE TYPE group_role_enum AS ENUM ('OWNER', 'MEMBER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status_enum') THEN
    CREATE TYPE invitation_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'annual_perf_basis_enum') THEN
    CREATE TYPE annual_perf_basis_enum AS ENUM ('ISSUANCE_MONTH', 'ISSUANCE_DATE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'benefit_period_lag_enum') THEN
    CREATE TYPE benefit_period_lag_enum AS ENUM ('CURRENT_MONTH', 'PREV_MONTH', 'PREV_PREV_MONTH');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_adjustment_type_enum') THEN
    CREATE TYPE payment_adjustment_type_enum AS ENUM (
      'FX_CORRECTION',
      'BILLING_DISCOUNT',
      'PAYMENT_DEDUCTION',
      'CARD_FEE',
      'OTHER'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_grade_enum') THEN
    CREATE TYPE card_grade_enum AS ENUM (
      'BASIC',
      'CLASSIC',
      'GOLD',
      'PLATINUM',
      'DIAMOND',
      'PREMIUM',
      'INFINITE'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'benefit_source_enum') THEN
    CREATE TYPE benefit_source_enum AS ENUM ('ISSUER', 'NETWORK', 'PARTNERSHIP');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'performance_exclusion_scope_enum') THEN
    CREATE TYPE performance_exclusion_scope_enum AS ENUM (
      'MONTHLY_ONLY',
      'ANNUAL_ONLY',
      'ALL_PERFORMANCE',
      'NONE'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pending_action_type_enum') THEN
    CREATE TYPE pending_action_type_enum AS ENUM (
      'FX_CORRECTION_NEEDED',
      'BILLING_DISCOUNT_FOUND',
      'PAYMENT_CONFIRMATION',
      'DUPLICATE_DETECTED',
      'CATEGORY_UNMAPPED',
      'EXCEL_REVIEW',
      'PERFORMANCE_EXCLUSION_CHECK'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_source_enum'
      AND e.enumlabel = 'EXCEL'
  ) THEN
    ALTER TYPE payment_source_enum ADD VALUE 'EXCEL';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_source_enum'
      AND e.enumlabel = 'MYDATA'
  ) THEN
    ALTER TYPE payment_source_enum ADD VALUE 'MYDATA';
  END IF;
END;
$$;

-- =============================================================================
-- 2) NEW TABLES
-- =============================================================================

-- Card domain
CREATE TABLE IF NOT EXISTS card_network (
  network_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  network_code  VARCHAR(20)   NOT NULL UNIQUE,
  network_name  VARCHAR(50)   NOT NULL,
  logo_url      VARCHAR(500),
  website_url   VARCHAR(500),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS special_performance_period (
  special_period_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id            BIGINT        NOT NULL REFERENCES card,
  period_name        VARCHAR(100)  NOT NULL,
  start_date         DATE          NOT NULL,
  end_date           DATE          NOT NULL,
  credit_multiplier  NUMERIC(3,2)  NOT NULL DEFAULT 1.00,
  is_active          BOOLEAN       NOT NULL DEFAULT true,
  description        TEXT,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_spp_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_spp_multiplier CHECK (credit_multiplier > 0 AND credit_multiplier <= 5.00)
);

CREATE TABLE IF NOT EXISTS performance_exclusion_code (
  exclusion_code_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code               VARCHAR(50)                        NOT NULL UNIQUE,
  name               VARCHAR(100)                       NOT NULL,
  description        TEXT,
  default_scope      performance_exclusion_scope_enum   NOT NULL DEFAULT 'ALL_PERFORMANCE',
  created_at         TIMESTAMPTZ                        NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS card_performance_exclusion (
  card_perf_exclusion_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  card_id                 BIGINT                          NOT NULL REFERENCES card,
  exclusion_code_id       BIGINT                          NOT NULL REFERENCES performance_exclusion_code,
  effective_scope         performance_exclusion_scope_enum NOT NULL,
  is_active               BOOLEAN                         NOT NULL DEFAULT true,
  valid_from              DATE,
  valid_until             DATE,
  CONSTRAINT uq_card_perf_exclusion UNIQUE (card_id, exclusion_code_id),
  CONSTRAINT chk_card_perf_exclusion_dates CHECK (
    valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from
  )
);

-- Ledger domain
CREATE TABLE IF NOT EXISTS payment_adjustment (
  adjustment_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id          BIGINT                       NOT NULL REFERENCES payment,
  adjustment_type     payment_adjustment_type_enum NOT NULL,
  original_krw_amount BIGINT                       NOT NULL,
  adjusted_krw_amount BIGINT                       NOT NULL,
  difference_amount   BIGINT GENERATED ALWAYS AS (adjusted_krw_amount - original_krw_amount) STORED,
  reason              TEXT,
  billed_at           DATE,
  created_at          TIMESTAMPTZ                  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_pending_action (
  pending_action_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id         UUID                    NOT NULL REFERENCES account,
  action_type        pending_action_type_enum NOT NULL,
  reference_table    VARCHAR(50),
  reference_id       BIGINT,
  title              VARCHAR(200)            NOT NULL,
  description        TEXT,
  status             VARCHAR(20)             NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
  priority           VARCHAR(10)             NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  created_at         TIMESTAMPTZ             NOT NULL DEFAULT now(),
  resolved_at        TIMESTAMPTZ
);

-- Group domain
CREATE TABLE IF NOT EXISTS ledger_group (
  group_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_name        VARCHAR(50)   NOT NULL,
  description       VARCHAR(200),
  owner_account_id  UUID          NOT NULL REFERENCES account,
  max_members       INT           NOT NULL DEFAULT 10,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_member (
  group_member_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id          BIGINT          NOT NULL REFERENCES ledger_group,
  account_id        UUID            NOT NULL REFERENCES account,
  role              group_role_enum NOT NULL DEFAULT 'MEMBER',
  joined_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT uq_group_member UNIQUE (group_id, account_id)
);

CREATE TABLE IF NOT EXISTS group_invitation (
  invitation_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id          BIGINT                 NOT NULL REFERENCES ledger_group,
  inviter_id        UUID                   NOT NULL REFERENCES account,
  invitee_email     VARCHAR(255)           NOT NULL,
  invitation_status invitation_status_enum NOT NULL DEFAULT 'PENDING',
  expires_at        TIMESTAMPTZ            NOT NULL,
  created_at        TIMESTAMPTZ            NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ            NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3) ALTER EXISTING TABLES
-- =============================================================================

ALTER TABLE card
  ADD COLUMN IF NOT EXISTS annual_perf_basis annual_perf_basis_enum NOT NULL DEFAULT 'ISSUANCE_MONTH',
  ADD COLUMN IF NOT EXISTS network_id BIGINT,
  ADD COLUMN IF NOT EXISTS card_grade card_grade_enum,
  ADD COLUMN IF NOT EXISTS has_performance_tier BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_rules JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE card_benefit
  ADD COLUMN IF NOT EXISTS performance_period_lag benefit_period_lag_enum NOT NULL DEFAULT 'PREV_MONTH',
  ADD COLUMN IF NOT EXISTS benefit_source benefit_source_enum NOT NULL DEFAULT 'ISSUER',
  ADD COLUMN IF NOT EXISTS activation_rules JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE card_voucher
  ADD COLUMN IF NOT EXISTS unlock_conditions JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE payment
  ADD COLUMN IF NOT EXISTS group_id BIGINT,
  ADD COLUMN IF NOT EXISTS final_krw_amount BIGINT,
  ADD COLUMN IF NOT EXISTS is_adjusted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(100);

ALTER TABLE payment_item
  ADD COLUMN IF NOT EXISTS excluded_from_performance BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tag
  ADD COLUMN IF NOT EXISTS group_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_card_network'
      AND conrelid = 'card'::regclass
  ) THEN
    ALTER TABLE card
      ADD CONSTRAINT fk_card_network
      FOREIGN KEY (network_id) REFERENCES card_network(network_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_payment_group'
      AND conrelid = 'payment'::regclass
  ) THEN
    ALTER TABLE payment
      ADD CONSTRAINT fk_payment_group
      FOREIGN KEY (group_id) REFERENCES ledger_group(group_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_tag_group'
      AND conrelid = 'tag'::regclass
  ) THEN
    ALTER TABLE tag
      ADD CONSTRAINT fk_tag_group
      FOREIGN KEY (group_id) REFERENCES ledger_group(group_id);
  END IF;
END;
$$;

ALTER TABLE tag DROP CONSTRAINT IF EXISTS uq_tag_account_name;

-- =============================================================================
-- 4) INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_card_network_fk
  ON card (network_id)
  WHERE network_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_special_performance_period_active
  ON special_performance_period (card_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_card_perf_exclusion_active
  ON card_performance_exclusion (card_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_payment_adjustment_payment
  ON payment_adjustment (payment_id);

CREATE INDEX IF NOT EXISTS idx_upa_account_status
  ON user_pending_action (account_id, status);

CREATE INDEX IF NOT EXISTS idx_group_member_account
  ON group_member (account_id);

CREATE INDEX IF NOT EXISTS idx_group_member_group
  ON group_member (group_id);

CREATE INDEX IF NOT EXISTS idx_group_invitation_email_status
  ON group_invitation (invitee_email, invitation_status);

CREATE INDEX IF NOT EXISTS idx_payment_group_date
  ON payment (group_id, paid_at DESC)
  WHERE group_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_account_external_transaction
  ON payment (account_id, external_transaction_id)
  WHERE external_transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tag_personal_name
  ON tag (account_id, tag_name)
  WHERE group_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tag_group_name
  ON tag (group_id, tag_name)
  WHERE group_id IS NOT NULL;

-- =============================================================================
-- 5) SEED DATA
-- =============================================================================

INSERT INTO card_network (network_code, network_name)
VALUES
  ('VISA', 'Visa'),
  ('MASTERCARD', 'Mastercard'),
  ('UNIONPAY', 'UnionPay'),
  ('AMEX', 'American Express'),
  ('JCB', 'JCB'),
  ('DOMESTIC', 'Domestic')
ON CONFLICT (network_code) DO NOTHING;

INSERT INTO performance_exclusion_code (code, name, description, default_scope)
VALUES
  ('TAX', '세금', '국세/지방세 등 세금 납부 금액', 'ALL_PERFORMANCE'),
  ('GIFT_CARD', '상품권', '상품권/선불카드 구입 금액', 'ALL_PERFORMANCE'),
  ('CASH_ADVANCE', '현금서비스', '현금서비스/단기카드대출', 'ALL_PERFORMANCE'),
  ('INSURANCE_PREMIUM', '보험료', '보험료 납부 금액', 'MONTHLY_ONLY'),
  ('PREPAID_CARD', '선불카드', '선불카드 충전/구매 금액', 'ALL_PERFORMANCE')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 6) RLS + POLICIES
-- =============================================================================

ALTER TABLE card_network               ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_performance_period ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_exclusion_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_performance_exclusion ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_adjustment         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pending_action        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_group               ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_member               ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitation           ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "card_network_select_authenticated" ON card_network;
CREATE POLICY "card_network_select_authenticated"
  ON card_network FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "special_performance_period_select_authenticated" ON special_performance_period;
CREATE POLICY "special_performance_period_select_authenticated"
  ON special_performance_period FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "performance_exclusion_code_select_authenticated" ON performance_exclusion_code;
CREATE POLICY "performance_exclusion_code_select_authenticated"
  ON performance_exclusion_code FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "card_performance_exclusion_select_authenticated" ON card_performance_exclusion;
CREATE POLICY "card_performance_exclusion_select_authenticated"
  ON card_performance_exclusion FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "card_network_admin_all" ON card_network;
CREATE POLICY "card_network_admin_all"
  ON card_network FOR ALL USING (
    EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "special_performance_period_admin_all" ON special_performance_period;
CREATE POLICY "special_performance_period_admin_all"
  ON special_performance_period FOR ALL USING (
    EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "performance_exclusion_code_admin_all" ON performance_exclusion_code;
CREATE POLICY "performance_exclusion_code_admin_all"
  ON performance_exclusion_code FOR ALL USING (
    EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "card_performance_exclusion_admin_all" ON card_performance_exclusion;
CREATE POLICY "card_performance_exclusion_admin_all"
  ON card_performance_exclusion FOR ALL USING (
    EXISTS (SELECT 1 FROM account WHERE account_id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "payment_adjustment_select_own" ON payment_adjustment;
CREATE POLICY "payment_adjustment_select_own"
  ON payment_adjustment FOR SELECT USING (
    payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid())
  );

DROP POLICY IF EXISTS "payment_adjustment_insert_own" ON payment_adjustment;
CREATE POLICY "payment_adjustment_insert_own"
  ON payment_adjustment FOR INSERT WITH CHECK (
    payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid())
  );

DROP POLICY IF EXISTS "payment_adjustment_update_own" ON payment_adjustment;
CREATE POLICY "payment_adjustment_update_own"
  ON payment_adjustment FOR UPDATE USING (
    payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid())
  );

DROP POLICY IF EXISTS "payment_adjustment_delete_own" ON payment_adjustment;
CREATE POLICY "payment_adjustment_delete_own"
  ON payment_adjustment FOR DELETE USING (
    payment_id IN (SELECT payment_id FROM payment WHERE account_id = auth.uid())
  );

DROP POLICY IF EXISTS "user_pending_action_select_own" ON user_pending_action;
CREATE POLICY "user_pending_action_select_own"
  ON user_pending_action FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "user_pending_action_insert_own" ON user_pending_action;
CREATE POLICY "user_pending_action_insert_own"
  ON user_pending_action FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "user_pending_action_update_own" ON user_pending_action;
CREATE POLICY "user_pending_action_update_own"
  ON user_pending_action FOR UPDATE USING (account_id = auth.uid());

DROP POLICY IF EXISTS "user_pending_action_delete_own" ON user_pending_action;
CREATE POLICY "user_pending_action_delete_own"
  ON user_pending_action FOR DELETE USING (account_id = auth.uid());

DROP POLICY IF EXISTS "ledger_group_select_member" ON ledger_group;
CREATE POLICY "ledger_group_select_member"
  ON ledger_group FOR SELECT USING (
    owner_account_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_member gm
      WHERE gm.group_id = ledger_group.group_id
        AND gm.account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "ledger_group_insert_owner" ON ledger_group;
CREATE POLICY "ledger_group_insert_owner"
  ON ledger_group FOR INSERT WITH CHECK (owner_account_id = auth.uid());

DROP POLICY IF EXISTS "ledger_group_update_owner" ON ledger_group;
CREATE POLICY "ledger_group_update_owner"
  ON ledger_group FOR UPDATE USING (owner_account_id = auth.uid());

DROP POLICY IF EXISTS "ledger_group_delete_owner" ON ledger_group;
CREATE POLICY "ledger_group_delete_owner"
  ON ledger_group FOR DELETE USING (owner_account_id = auth.uid());

DROP POLICY IF EXISTS "group_member_select_visible" ON group_member;
CREATE POLICY "group_member_select_visible"
  ON group_member FOR SELECT USING (
    account_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM ledger_group lg
      WHERE lg.group_id = group_member.group_id
        AND lg.owner_account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "group_member_insert_owner" ON group_member;
CREATE POLICY "group_member_insert_owner"
  ON group_member FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ledger_group lg
      WHERE lg.group_id = group_member.group_id
        AND lg.owner_account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "group_member_update_owner" ON group_member;
CREATE POLICY "group_member_update_owner"
  ON group_member FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM ledger_group lg
      WHERE lg.group_id = group_member.group_id
        AND lg.owner_account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "group_member_delete_owner" ON group_member;
CREATE POLICY "group_member_delete_owner"
  ON group_member FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ledger_group lg
      WHERE lg.group_id = group_member.group_id
        AND lg.owner_account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "group_invitation_select_participant" ON group_invitation;
CREATE POLICY "group_invitation_select_participant"
  ON group_invitation FOR SELECT USING (
    inviter_id = auth.uid()
    OR lower(invitee_email) = lower((SELECT email FROM account WHERE account_id = auth.uid()))
  );

DROP POLICY IF EXISTS "group_invitation_insert_owner" ON group_invitation;
CREATE POLICY "group_invitation_insert_owner"
  ON group_invitation FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM ledger_group lg
      WHERE lg.group_id = group_invitation.group_id
        AND lg.owner_account_id = auth.uid()
    )
    AND inviter_id = auth.uid()
  );

DROP POLICY IF EXISTS "group_invitation_update_participant" ON group_invitation;
CREATE POLICY "group_invitation_update_participant"
  ON group_invitation FOR UPDATE USING (
    inviter_id = auth.uid()
    OR lower(invitee_email) = lower((SELECT email FROM account WHERE account_id = auth.uid()))
  );

DROP POLICY IF EXISTS "group_invitation_delete_owner" ON group_invitation;
CREATE POLICY "group_invitation_delete_owner"
  ON group_invitation FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM ledger_group lg
      WHERE lg.group_id = group_invitation.group_id
        AND lg.owner_account_id = auth.uid()
    )
  );

-- group member can read shared ledger rows
DROP POLICY IF EXISTS "payment_select_group_member" ON payment;
CREATE POLICY "payment_select_group_member"
  ON payment FOR SELECT USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_member gm
      WHERE gm.group_id = payment.group_id
        AND gm.account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payment_item_select_group_member" ON payment_item;
CREATE POLICY "payment_item_select_group_member"
  ON payment_item FOR SELECT USING (
    payment_id IN (
      SELECT p.payment_id
      FROM payment p
      JOIN group_member gm ON gm.group_id = p.group_id
      WHERE gm.account_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "tag_select_group_member" ON tag;
CREATE POLICY "tag_select_group_member"
  ON tag FOR SELECT USING (
    group_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM group_member gm
      WHERE gm.group_id = tag.group_id
        AND gm.account_id = auth.uid()
    )
  );

-- =============================================================================
-- 7) TRIGGERS (updated_at)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_special_performance_period_updated_at'
  ) THEN
    CREATE TRIGGER trg_special_performance_period_updated_at
      BEFORE UPDATE ON special_performance_period
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ledger_group_updated_at'
  ) THEN
    CREATE TRIGGER trg_ledger_group_updated_at
      BEFORE UPDATE ON ledger_group
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_group_invitation_updated_at'
  ) THEN
    CREATE TRIGGER trg_group_invitation_updated_at
      BEFORE UPDATE ON group_invitation
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
