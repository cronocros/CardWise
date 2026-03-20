-- Migration: Add group notification settings
-- Created: 2026-03-20
-- Description:
--   Adds group_invite_alert and group_activity_alert columns to the notification_setting table

ALTER TABLE notification_setting
  ADD COLUMN IF NOT EXISTS group_invite_alert BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS group_activity_alert BOOLEAN NOT NULL DEFAULT true;
