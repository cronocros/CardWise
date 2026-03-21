-- Migration: Add transaction_type to payment table
-- Created: 2026-03-21
-- Description: 지출/수입 구분을 위한 컬럼 추가

CREATE TYPE transaction_type_enum AS ENUM ('INCOME', 'EXPENSE');

ALTER TABLE payment ADD COLUMN transaction_type transaction_type_enum NOT NULL DEFAULT 'EXPENSE';

-- 기존 데이터는 모두 지출로 간주 (이미 지출 테이블이므로)
-- 만약 수입 데이터를 넣고 싶다면 이 컬럼을 INCOME으로 변경하면 됨
