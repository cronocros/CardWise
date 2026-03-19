-- Migration: F7 notification center + F12 group governance/payment write
-- Created: 2026-03-20
-- Description:
--   Adds in-app notification records and group soft-delete support so
--   notification center, group payment write paths, and group governance
--   actions can align with the application architecture.

CREATE TABLE IF NOT EXISTS notification (
  notification_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id       UUID         NOT NULL REFERENCES account,
  notification_type VARCHAR(20) NOT NULL
    CHECK (notification_type IN ('VOUCHER', 'PERFORMANCE', 'GROUP', 'SYSTEM')),
  event_code       VARCHAR(50)  NOT NULL,
  title            VARCHAR(200) NOT NULL,
  body             TEXT         NOT NULL,
  action_url       VARCHAR(500),
  action_label     VARCHAR(50),
  reference_table  VARCHAR(50),
  reference_id     BIGINT,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_account_created
  ON notification (account_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_account_unread
  ON notification (account_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notification_account_type
  ON notification (account_id, notification_type, created_at DESC);

ALTER TABLE ledger_group
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ledger_group_active
  ON ledger_group (owner_account_id, deleted_at)
  WHERE deleted_at IS NULL;

ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_select_own" ON notification;
CREATE POLICY "notification_select_own"
  ON notification FOR SELECT USING (account_id = auth.uid());

DROP POLICY IF EXISTS "notification_insert_own" ON notification;
CREATE POLICY "notification_insert_own"
  ON notification FOR INSERT WITH CHECK (account_id = auth.uid());

DROP POLICY IF EXISTS "notification_update_own" ON notification;
CREATE POLICY "notification_update_own"
  ON notification FOR UPDATE USING (account_id = auth.uid());

DROP POLICY IF EXISTS "notification_delete_own" ON notification;
CREATE POLICY "notification_delete_own"
  ON notification FOR DELETE USING (account_id = auth.uid());
