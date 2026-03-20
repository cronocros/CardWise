BEGIN;

SET timezone = 'Asia/Seoul';

-- CardWise MVP seed
-- Bundles covered:
-- - catalog_core -> F1, F4, F6, GET /cards/{cardId}/performance
-- - ledger_inbox -> F2, F3, adjustments, pending actions
-- - performance_voucher -> F4, F6, performance and voucher state

-- Networks
INSERT INTO card_network (
  network_code,
  network_name,
  logo_url,
  website_url,
  created_at
)
SELECT
  v.network_code,
  v.network_name,
  v.logo_url,
  v.website_url,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('VISA', 'Visa', 'https://example.com/networks/visa.png', 'https://www.visa.com'),
    ('MASTERCARD', 'Mastercard', 'https://example.com/networks/mastercard.png', 'https://www.mastercard.com'),
    ('DOMESTIC', 'Domestic', NULL, NULL),
    ('AMEX', 'American Express', 'https://example.com/networks/amex.png', 'https://www.americanexpress.com')
) AS v(network_code, network_name, logo_url, website_url)
ON CONFLICT (network_code) DO UPDATE
SET
  network_name = EXCLUDED.network_name,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url;

-- Card companies
INSERT INTO card_company (
  company_name,
  logo_url,
  website_url,
  created_at,
  updated_at
)
SELECT
  v.company_name,
  v.logo_url,
  v.website_url,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('Samsung Card', 'https://example.com/companies/samsung-card.png', 'https://www.samsungcard.com'),
    ('Shinhan Card', 'https://example.com/companies/shinhan-card.png', 'https://www.shinhancard.com'),
    ('Hyundai Card', 'https://example.com/companies/hyundai-card.png', 'https://www.hyundaicard.com'),
    ('KakaoBank', 'https://example.com/companies/kakaobank.png', 'https://www.kakaobank.com')
) AS v(company_name, logo_url, website_url)
WHERE NOT EXISTS (
  SELECT 1 FROM card_company cc WHERE cc.company_name = v.company_name
);

-- Categories
INSERT INTO category (parent_id, category_name, depth)
SELECT NULL, v.category_name, 0
FROM (
  VALUES
    ('Food'),
    ('Shopping'),
    ('Transport'),
    ('Insurance')
) AS v(category_name)
WHERE NOT EXISTS (
  SELECT 1 FROM category c WHERE c.parent_id IS NULL AND c.category_name = v.category_name AND c.depth = 0
);

INSERT INTO category (parent_id, category_name, depth)
SELECT p.category_id, v.category_name, 1
FROM (
  VALUES
    ('Food', 'Coffee'),
    ('Food', 'Delivery'),
    ('Shopping', 'Online Shopping'),
    ('Shopping', 'Grocery'),
    ('Transport', 'Public Transit'),
    ('Insurance', 'Premium Insurance')
) AS v(parent_category_name, category_name)
JOIN category p
  ON p.category_name = v.parent_category_name
 AND p.depth = 0
WHERE NOT EXISTS (
  SELECT 1 FROM category c WHERE c.parent_id = p.category_id AND c.category_name = v.category_name AND c.depth = 1
);

-- Merchants
INSERT INTO merchant (category_id, merchant_name, logo_url)
SELECT c.category_id, v.merchant_name, v.logo_url
FROM (
  VALUES
    ('Coffee', 'Starbucks', 'https://example.com/merchants/starbucks.png'),
    ('Online Shopping', 'Coupang', 'https://example.com/merchants/coupang.png'),
    ('Delivery', 'Baemin', 'https://example.com/merchants/baemin.png'),
    ('Grocery', 'Emart', 'https://example.com/merchants/emart.png')
) AS v(category_name, merchant_name, logo_url)
JOIN category c
  ON c.category_name = v.category_name
 AND c.depth = 1
WHERE NOT EXISTS (
  SELECT 1 FROM merchant m WHERE m.merchant_name = v.merchant_name
);

INSERT INTO merchant_alias (merchant_id, alias_name)
SELECT m.merchant_id, v.alias_name
FROM (
  VALUES
    ('Starbucks', 'STARBUCKS KOREA'),
    ('Coupang', 'COUPANG INC'),
    ('Baemin', 'BAEMIN'),
    ('Emart', 'EMART')
) AS v(merchant_name, alias_name)
JOIN merchant m
  ON m.merchant_name = v.merchant_name
ON CONFLICT (alias_name) DO UPDATE
SET merchant_id = EXCLUDED.merchant_id;

-- Cards
INSERT INTO card (
  card_company_id,
  card_name,
  card_type,
  annual_fee,
  image_url,
  description,
  is_active,
  annual_perf_basis,
  network_id,
  card_grade,
  has_performance_tier,
  card_rules,
  created_at,
  updated_at
)
SELECT
  cc.card_company_id,
  v.card_name,
  v.card_type::card_type_enum,
  v.annual_fee,
  v.image_url,
  v.description,
  true,
  v.annual_perf_basis::annual_perf_basis_enum,
  n.network_id,
  v.card_grade::card_grade_enum,
  v.has_performance_tier,
  v.card_rules::jsonb,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('Samsung Card', 'Samsung taptap O', 'CREDIT', 10000, 'https://example.com/cards/samsung-taptap-o.png', 'Samsung cafe and everyday spend card', 'ISSUANCE_MONTH', 'VISA', 'GOLD', true, '{"grace_period":{"enabled":true,"months":2,"min_spend_per_month":0},"notes":"Two month grace period after issuance"}'),
    ('Shinhan Card', 'Shinhan Deep Dream', 'CREDIT', 10000, 'https://example.com/cards/shinhan-deep-dream.png', 'Shinhan everyday spend card', 'ISSUANCE_DATE', 'MASTERCARD', 'CLASSIC', true, '{"grace_period":{"enabled":false,"months":0,"min_spend_per_month":0},"notes":"Annual basis by issuance date"}'),
    ('Hyundai Card', 'Hyundai ZERO', 'CREDIT', 15000, 'https://example.com/cards/hyundai-zero.png', 'Hyundai transit focused card', 'ISSUANCE_MONTH', 'DOMESTIC', 'PLATINUM', true, '{"grace_period":{"enabled":true,"months":1,"min_spend_per_month":100000},"notes":"Monthly bonus for transit"}'),
    ('KakaoBank', 'KakaoBank Check', 'CHECK', 0, 'https://example.com/cards/kakaobank-check.png', 'KakaoBank check card', 'ISSUANCE_MONTH', 'DOMESTIC', 'BASIC', false, '{"grace_period":{"enabled":false,"months":0,"min_spend_per_month":0},"notes":"No performance tiers"}')
) AS v(company_name, card_name, card_type, annual_fee, image_url, description, annual_perf_basis, network_code, card_grade, has_performance_tier, card_rules)
JOIN card_company cc
  ON cc.company_name = v.company_name
LEFT JOIN card_network n
  ON n.network_code = v.network_code
WHERE NOT EXISTS (
  SELECT 1 FROM card c WHERE c.card_company_id = cc.card_company_id AND c.card_name = v.card_name
);

-- Performance tiers
INSERT INTO performance_tier (card_id, tier_name, min_amount, max_amount, sort_order)
SELECT c.card_id, v.tier_name, v.min_amount, v.max_amount, v.sort_order
FROM (
  VALUES
    ('Samsung taptap O', '300K', 300000, 599999, 1),
    ('Shinhan Deep Dream', '500K', 500000, NULL, 1),
    ('Hyundai ZERO', '300K', 300000, NULL, 1)
) AS v(card_name, tier_name, min_amount, max_amount, sort_order)
JOIN card c ON c.card_name = v.card_name
WHERE NOT EXISTS (
  SELECT 1 FROM performance_tier pt WHERE pt.card_id = c.card_id AND pt.tier_name = v.tier_name
);

-- Benefits
INSERT INTO card_benefit (
  card_id,
  performance_tier_id,
  benefit_type,
  target_type,
  category_id,
  merchant_id,
  discount_type,
  discount_value,
  monthly_limit_count,
  monthly_limit_amount,
  min_payment_amount,
  description,
  is_active,
  valid_from,
  valid_until,
  performance_period_lag,
  benefit_source,
  activation_rules,
  created_at,
  updated_at
)
SELECT
  c.card_id,
  pt.performance_tier_id,
  v.benefit_type::benefit_type_enum,
  v.target_type::benefit_target_type_enum,
  cat.category_id,
  m.merchant_id,
  v.discount_type::discount_type_enum,
  v.discount_value,
  v.monthly_limit_count,
  v.monthly_limit_amount,
  v.min_payment_amount,
  v.description,
  true,
  v.valid_from,
  v.valid_until::date,
  v.performance_period_lag::benefit_period_lag_enum,
  v.benefit_source::benefit_source_enum,
  v.activation_rules::jsonb,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('Samsung taptap O', '300K', 'DISCOUNT', 'CATEGORY', 'Coffee', NULL, 'RATE', 5.00, 10, 10000, 0, 'Samsung cafe discount', DATE '2026-01-01', NULL, 'PREV_MONTH', 'ISSUER', '{"grace_period_exempt":true,"min_single_payment":10000}'),
    ('Shinhan Deep Dream', '500K', 'CASHBACK', 'ALL', NULL, NULL, 'RATE', 0.50, NULL, NULL, 0, 'Shinhan all spend cashback', DATE '2026-01-01', NULL, 'CURRENT_MONTH', 'ISSUER', '{"linked_service":"mobile app"}'),
    ('Shinhan Deep Dream', '500K', 'DISCOUNT', 'MERCHANT', NULL, 'Starbucks', 'RATE', 10.00, 5, 15000, 10000, 'Shinhan Starbucks merchant discount', DATE '2026-01-01', NULL, 'PREV_PREV_MONTH', 'NETWORK', '{"seasonal":{"active_months":[1,2,3,10,11,12]}}'),
    ('Hyundai ZERO', '300K', 'DISCOUNT', 'CATEGORY', 'Public Transit', NULL, 'RATE', 10.00, 10, 30000, 0, 'Hyundai transit discount', DATE '2026-01-01', NULL, 'PREV_MONTH', 'PARTNERSHIP', '{"linked_service":"transport pass"}'),
    ('KakaoBank Check', NULL, 'POINT', 'ALL', NULL, NULL, 'RATE', 0.20, NULL, NULL, 0, 'KakaoBank check base points', DATE '2026-01-01', NULL, 'CURRENT_MONTH', 'ISSUER', '{"grace_period_exempt":false}')
) AS v(card_name, tier_name, benefit_type, target_type, category_name, merchant_name, discount_type, discount_value, monthly_limit_count, monthly_limit_amount, min_payment_amount, description, valid_from, valid_until, performance_period_lag, benefit_source, activation_rules)
JOIN card c ON c.card_name = v.card_name
LEFT JOIN performance_tier pt ON pt.card_id = c.card_id AND pt.tier_name = v.tier_name
LEFT JOIN category cat ON cat.category_name = v.category_name AND cat.depth = 1
LEFT JOIN merchant m ON m.merchant_name = v.merchant_name
WHERE NOT EXISTS (
  SELECT 1 FROM card_benefit cb WHERE cb.card_id = c.card_id AND cb.description = v.description
);

-- Vouchers
INSERT INTO card_voucher (
  card_id,
  voucher_name,
  voucher_type,
  period_type,
  total_count,
  description,
  is_active,
  valid_from,
  valid_until,
  unlock_conditions,
  created_at,
  updated_at
)
SELECT
  c.card_id,
  v.voucher_name,
  v.voucher_type::voucher_type_enum,
  v.period_type::period_type_enum,
  v.total_count,
  v.description,
  true,
  v.valid_from,
  v.valid_until,
  v.unlock_conditions::jsonb,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('Samsung taptap O', 'Airport Lounge', 'LOUNGE', 'YEARLY', 2, 'Samsung lounge access voucher', DATE '2026-01-01', DATE '2026-12-31', '{"requires_annual_performance":3000000,"unlock_type":"AUTO","available_after_months":6}'),
    ('Shinhan Deep Dream', 'Coffee Coupon', 'COUPON', 'MONTHLY', 1, 'Shinhan coffee voucher', DATE '2026-01-01', DATE '2026-12-31', '{"grace_period_exempt":true,"unlock_type":"AUTO"}'),
    ('KakaoBank Check', 'Cash Machine Fee Waiver', 'OTHER', 'MONTHLY', 1, 'KakaoBank cash machine voucher', DATE '2026-01-01', DATE '2026-12-31', '{"unlock_type":"AUTO","notes":"Basic voucher for check card"}')
) AS v(card_name, voucher_name, voucher_type, period_type, total_count, description, valid_from, valid_until, unlock_conditions)
JOIN card c ON c.card_name = v.card_name
WHERE NOT EXISTS (
  SELECT 1 FROM card_voucher cv WHERE cv.card_id = c.card_id AND cv.voucher_name = v.voucher_name
);

-- Special performance periods
INSERT INTO special_performance_period (
  card_id,
  period_name,
  start_date,
  end_date,
  credit_multiplier,
  is_active,
  description,
  created_at,
  updated_at
)
SELECT
  c.card_id,
  v.period_name,
  v.start_date,
  v.end_date,
  v.credit_multiplier,
  true,
  v.description,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('Samsung taptap O', 'Spring Spend Boost', DATE '2026-04-01', DATE '2026-06-30', 1.20, 'Spring bonus multiplier'),
    ('Hyundai ZERO', 'Golden Week Bonus', DATE '2026-09-01', DATE '2026-09-30', 1.50, 'September travel bonus')
) AS v(card_name, period_name, start_date, end_date, credit_multiplier, description)
JOIN card c ON c.card_name = v.card_name
WHERE NOT EXISTS (
  SELECT 1 FROM special_performance_period spp WHERE spp.card_id = c.card_id AND spp.period_name = v.period_name
);

-- Exclusion master and mapping
INSERT INTO performance_exclusion_code (
  code,
  name,
  description,
  default_scope,
  created_at
)
SELECT
  v.code,
  v.name,
  v.description,
  v.default_scope::performance_exclusion_scope_enum,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('TAX', 'Tax', 'Tax payments excluded from performance', 'ALL_PERFORMANCE'),
    ('GIFT_CARD', 'Gift Card', 'Gift card purchases excluded from performance', 'ALL_PERFORMANCE'),
    ('CASH_ADVANCE', 'Cash Advance', 'Cash advance excluded from performance', 'ALL_PERFORMANCE'),
    ('INSURANCE_PREMIUM', 'Insurance Premium', 'Insurance premium excluded from performance', 'ANNUAL_ONLY'),
    ('PREPAID_CARD', 'Prepaid Card', 'Prepaid card top-up excluded from performance', 'MONTHLY_ONLY')
) AS v(code, name, description, default_scope)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_scope = EXCLUDED.default_scope;

INSERT INTO card_performance_exclusion (
  card_id,
  exclusion_code_id,
  effective_scope,
  is_active,
  valid_from,
  valid_until
)
SELECT
  c.card_id,
  pec.exclusion_code_id,
  v.effective_scope::performance_exclusion_scope_enum,
  true,
  v.valid_from,
  v.valid_until
FROM (
  VALUES
    ('Samsung taptap O', 'TAX', 'ALL_PERFORMANCE', DATE '2026-01-01', CAST(NULL AS DATE)),
    ('Samsung taptap O', 'GIFT_CARD', 'ALL_PERFORMANCE', DATE '2026-01-01', CAST(NULL AS DATE)),
    ('Hyundai ZERO', 'INSURANCE_PREMIUM', 'ANNUAL_ONLY', DATE '2026-01-01', CAST(NULL AS DATE)),
    ('KakaoBank Check', 'CASH_ADVANCE', 'ALL_PERFORMANCE', DATE '2026-01-01', CAST(NULL AS DATE))
) AS v(card_name, code, effective_scope, valid_from, valid_until)
JOIN card c ON c.card_name = v.card_name
JOIN performance_exclusion_code pec ON pec.code = v.code
ON CONFLICT (card_id, exclusion_code_id) DO UPDATE
SET
  effective_scope = EXCLUDED.effective_scope,
  is_active = EXCLUDED.is_active,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until;

-- Accounts
INSERT INTO account (account_id, email, is_admin, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'mina.kim@example.com', false, TIMESTAMPTZ '2026-03-19 09:00:00+09:00'),
  ('22222222-2222-2222-2222-222222222222', 'jiyun.park@example.com', false, TIMESTAMPTZ '2026-03-19 09:00:00+09:00')
ON CONFLICT (email) DO UPDATE
SET is_admin = EXCLUDED.is_admin;

-- User cards
INSERT INTO user_card (
  account_id,
  card_id,
  card_nickname,
  issued_at,
  is_primary,
  is_active,
  created_at,
  updated_at
)
SELECT
  a.account_id,
  c.card_id,
  v.card_nickname,
  v.issued_at,
  v.is_primary,
  true,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('mina.kim@example.com', 'Samsung taptap O', 'Main Samsung card', DATE '2025-12-15', true),
    ('mina.kim@example.com', 'Shinhan Deep Dream', 'Everyday card', DATE '2026-01-08', false),
    ('mina.kim@example.com', 'Hyundai ZERO', 'Travel card', DATE '2026-02-14', false),
    ('jiyun.park@example.com', 'KakaoBank Check', 'Daily check card', DATE '2026-02-01', true)
) AS v(email, card_name, card_nickname, issued_at, is_primary)
JOIN account a ON a.email = v.email
JOIN card c ON c.card_name = v.card_name
WHERE NOT EXISTS (
  SELECT 1 FROM user_card uc WHERE uc.account_id = a.account_id AND uc.card_id = c.card_id AND uc.issued_at = v.issued_at
);

-- Exchange rates
INSERT INTO exchange_rate_snapshot (
  currency,
  rate_to_krw,
  rate_date,
  source,
  created_at
)
SELECT
  v.currency::currency_enum,
  v.rate_to_krw,
  v.rate_date,
  v.source,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('USD', 1330.0000, DATE '2026-03-19', 'MARKET')
) AS v(currency, rate_to_krw, rate_date, source)
ON CONFLICT (currency, rate_date) DO UPDATE
SET rate_to_krw = EXCLUDED.rate_to_krw, source = EXCLUDED.source;

-- User performance
INSERT INTO user_performance (
  user_card_id,
  performance_tier_id,
  year_month,
  monthly_spent,
  annual_accumulated,
  created_at,
  updated_at
)
SELECT
  uc.user_card_id,
  pt.performance_tier_id,
  v.year_month,
  v.monthly_spent,
  v.annual_accumulated,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('mina.kim@example.com', 'Samsung taptap O', '2026-03', 420000, 420000, '300K'),
    ('mina.kim@example.com', 'Shinhan Deep Dream', '2026-03', 330000, 330000, '500K'),
    ('jiyun.park@example.com', 'KakaoBank Check', '2026-03', 120000, 120000, NULL)
) AS v(email, card_name, year_month, monthly_spent, annual_accumulated, tier_name)
JOIN account a ON a.email = v.email
JOIN user_card uc ON uc.account_id = a.account_id
JOIN card c ON c.card_name = v.card_name AND c.card_id = uc.card_id
LEFT JOIN performance_tier pt ON pt.card_id = c.card_id AND pt.tier_name = v.tier_name
ON CONFLICT (user_card_id, year_month) DO UPDATE
SET
  performance_tier_id = EXCLUDED.performance_tier_id,
  monthly_spent = EXCLUDED.monthly_spent,
  annual_accumulated = EXCLUDED.annual_accumulated,
  updated_at = EXCLUDED.updated_at;

-- Vouchers and logs
INSERT INTO user_voucher (
  user_card_id,
  card_voucher_id,
  remaining_count,
  total_count,
  valid_from,
  valid_until,
  created_at,
  updated_at
)
SELECT
  uc.user_card_id,
  cv.card_voucher_id,
  v.remaining_count,
  v.total_count,
  v.valid_from,
  v.valid_until,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('mina.kim@example.com', 'Samsung taptap O', 'Airport Lounge', 2, 2, DATE '2026-01-01', DATE '2026-12-31'),
    ('mina.kim@example.com', 'Shinhan Deep Dream', 'Coffee Coupon', 1, 1, DATE '2026-01-01', DATE '2026-12-31'),
    ('jiyun.park@example.com', 'KakaoBank Check', 'Cash Machine Fee Waiver', 1, 1, DATE '2026-01-01', DATE '2026-12-31')
) AS v(email, card_name, voucher_name, remaining_count, total_count, valid_from, valid_until)
JOIN account a ON a.email = v.email
JOIN user_card uc ON uc.account_id = a.account_id
JOIN card c ON c.card_name = v.card_name AND c.card_id = uc.card_id
JOIN card_voucher cv ON cv.card_id = c.card_id AND cv.voucher_name = v.voucher_name
WHERE NOT EXISTS (
  SELECT 1 FROM user_voucher uv WHERE uv.user_card_id = uc.user_card_id AND uv.card_voucher_id = cv.card_voucher_id AND uv.valid_from = v.valid_from
);

INSERT INTO user_voucher_log (
  user_voucher_id,
  voucher_action,
  memo,
  created_at
)
SELECT
  uv.user_voucher_id,
  v.voucher_action::voucher_action_enum,
  v.memo,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('mina.kim@example.com', 'Shinhan Deep Dream', 'Coffee Coupon', 'USE', 'Used at Starbucks on March 7'),
    ('jiyun.park@example.com', 'KakaoBank Check', 'Cash Machine Fee Waiver', 'CANCEL', 'Voucher canceled after duplicate approval')
) AS v(email, card_name, voucher_name, voucher_action, memo)
JOIN account a ON a.email = v.email
JOIN user_card uc ON uc.account_id = a.account_id
JOIN card c ON c.card_name = v.card_name AND c.card_id = uc.card_id
JOIN card_voucher cv ON cv.card_id = c.card_id AND cv.voucher_name = v.voucher_name
JOIN user_voucher uv ON uv.user_card_id = uc.user_card_id AND uv.card_voucher_id = cv.card_voucher_id
WHERE NOT EXISTS (
  SELECT 1 FROM user_voucher_log uvl WHERE uvl.user_voucher_id = uv.user_voucher_id AND uvl.voucher_action = v.voucher_action::voucher_action_enum AND uvl.memo = v.memo
);

INSERT INTO user_benefit_usage (
  user_card_id,
  card_benefit_id,
  year_month,
  used_count,
  used_amount,
  created_at,
  updated_at
)
SELECT
  uc.user_card_id,
  cb.card_benefit_id,
  v.year_month,
  v.used_count,
  v.used_amount,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('mina.kim@example.com', 'Samsung taptap O', 'Samsung cafe discount', '2026-03', 4, 48000),
    ('mina.kim@example.com', 'Shinhan Deep Dream', 'Shinhan all spend cashback', '2026-03', 3, 330000),
    ('jiyun.park@example.com', 'KakaoBank Check', 'KakaoBank check base points', '2026-03', 2, 120000)
) AS v(email, card_name, benefit_description, year_month, used_count, used_amount)
JOIN account a ON a.email = v.email
JOIN user_card uc ON uc.account_id = a.account_id
JOIN card c ON c.card_name = v.card_name AND c.card_id = uc.card_id
JOIN card_benefit cb ON cb.card_id = c.card_id AND cb.description = v.benefit_description
ON CONFLICT (user_card_id, card_benefit_id, year_month) DO UPDATE
SET
  used_count = EXCLUDED.used_count,
  used_amount = EXCLUDED.used_amount,
  updated_at = EXCLUDED.updated_at;

-- Payments
INSERT INTO payment (
  account_id,
  user_card_id,
  merchant_id,
  merchant_name_raw,
  paid_at,
  currency,
  original_amount,
  krw_amount,
  exchange_rate_id,
  payment_source,
  memo,
  deleted_at,
  created_at,
  updated_at,
  final_krw_amount,
  is_adjusted,
  external_transaction_id
)
SELECT
  a.account_id,
  uc.user_card_id,
  m.merchant_id,
  v.merchant_name_raw,
  v.paid_at,
  v.currency::currency_enum,
  v.original_amount,
  v.krw_amount,
  ex.exchange_rate_id,
  v.payment_source::payment_source_enum,
  v.memo,
  NULL,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  v.final_krw_amount,
  v.is_adjusted,
  v.external_transaction_id
FROM (
  VALUES
    ('mina.kim@example.com', 'Samsung taptap O', 'Starbucks', TIMESTAMPTZ '2026-03-05 08:12:00+09:00', 'KRW', NULL, 12000, NULL, 'MANUAL', 'Morning coffee', 12000, false, NULL),
    ('mina.kim@example.com', 'Shinhan Deep Dream', 'Coupang', TIMESTAMPTZ '2026-03-11 21:05:00+09:00', 'KRW', NULL, 24000, NULL, 'EMAIL', 'Home goods order', 24000, false, NULL),
    ('mina.kim@example.com', 'Samsung taptap O', 'AMAZON.COM', TIMESTAMPTZ '2026-03-15 23:40:00+09:00', 'USD', 53.20, 70756, 'USD', 'SMS', 'Kindle books and apps', 71000, true, NULL),
    ('jiyun.park@example.com', 'KakaoBank Check', 'Baemin', TIMESTAMPTZ '2026-03-16 19:20:00+09:00', 'KRW', NULL, 18500, NULL, 'EXCEL', 'Family dinner delivery', 18500, false, NULL),
    ('jiyun.park@example.com', 'KakaoBank Check', 'Emart', TIMESTAMPTZ '2026-03-18 10:10:00+09:00', 'KRW', NULL, 48000, NULL, 'MYDATA', 'Groceries and insurance', 45000, true, 'MYDATA-20260319-0001')
) AS v(email, card_name, merchant_name_raw, paid_at, currency, original_amount, krw_amount, exchange_rate_code, payment_source, memo, final_krw_amount, is_adjusted, external_transaction_id)
JOIN account a ON a.email = v.email
JOIN user_card uc ON uc.account_id = a.account_id
JOIN card c ON c.card_name = v.card_name AND c.card_id = uc.card_id
LEFT JOIN merchant m ON m.merchant_name = v.merchant_name_raw
LEFT JOIN exchange_rate_snapshot ex ON ex.currency = v.currency::currency_enum AND ex.rate_date = DATE '2026-03-19'
WHERE NOT EXISTS (
  SELECT 1
  FROM payment p
  WHERE p.account_id = a.account_id
    AND p.user_card_id = uc.user_card_id
    AND p.merchant_name_raw = v.merchant_name_raw
    AND p.paid_at = v.paid_at
    AND p.currency = v.currency::currency_enum
    AND p.krw_amount = v.krw_amount
    AND p.payment_source = v.payment_source::payment_source_enum
);

INSERT INTO payment_item (
  payment_id,
  item_name,
  amount,
  category_id,
  card_benefit_id,
  benefit_amount,
  created_at,
  excluded_from_performance
)
SELECT
  p.payment_id,
  v.item_name,
  v.amount,
  cat.category_id,
  cb.card_benefit_id,
  v.benefit_amount,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  v.excluded_from_performance
FROM (
  VALUES
    ('Starbucks', TIMESTAMPTZ '2026-03-05 08:12:00+09:00', 'Coffee latte', 12000, 'Coffee', 'Samsung cafe discount', 600, false),
    ('Coupang', TIMESTAMPTZ '2026-03-11 21:05:00+09:00', 'Kitchen supplies', 24000, 'Online Shopping', 'Shinhan all spend cashback', 120, false),
    ('AMAZON.COM', TIMESTAMPTZ '2026-03-15 23:40:00+09:00', 'Kindle books', 70756, 'Online Shopping', NULL, 0, false),
    ('Baemin', TIMESTAMPTZ '2026-03-16 19:20:00+09:00', 'Dinner delivery', 18500, 'Delivery', NULL, 0, false),
    ('Emart', TIMESTAMPTZ '2026-03-18 10:10:00+09:00', 'Insurance premium', 12000, 'Premium Insurance', NULL, 0, true)
) AS v(merchant_name_raw, paid_at, item_name, amount, category_name, benefit_description, benefit_amount, excluded_from_performance)
JOIN payment p ON p.merchant_name_raw = v.merchant_name_raw AND p.paid_at = v.paid_at
JOIN user_card uc ON uc.user_card_id = p.user_card_id
JOIN card c ON c.card_id = uc.card_id
LEFT JOIN category cat ON cat.category_name = v.category_name AND cat.depth = 1
LEFT JOIN card_benefit cb ON cb.card_id = c.card_id AND cb.description = v.benefit_description
WHERE NOT EXISTS (
  SELECT 1 FROM payment_item pi WHERE pi.payment_id = p.payment_id AND pi.item_name = v.item_name AND pi.amount = v.amount
);

INSERT INTO payment_adjustment (
  payment_id,
  adjustment_type,
  original_krw_amount,
  adjusted_krw_amount,
  reason,
  billed_at,
  created_at
)
SELECT
  p.payment_id,
  v.adjustment_type::payment_adjustment_type_enum,
  v.original_krw_amount,
  v.adjusted_krw_amount,
  v.reason,
  v.billed_at,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00'
FROM (
  VALUES
    ('AMAZON.COM', TIMESTAMPTZ '2026-03-15 23:40:00+09:00', 'FX_CORRECTION', 70756, 71000, 'Network finalization requires correction', DATE '2026-03-16'),
    ('Emart', TIMESTAMPTZ '2026-03-18 10:10:00+09:00', 'BILLING_DISCOUNT', 48000, 45000, 'Billing discount applied after statement cut', DATE '2026-03-19')
) AS v(merchant_name_raw, paid_at, adjustment_type, original_krw_amount, adjusted_krw_amount, reason, billed_at)
JOIN payment p ON p.merchant_name_raw = v.merchant_name_raw AND p.paid_at = v.paid_at
WHERE NOT EXISTS (
  SELECT 1
  FROM payment_adjustment pa
  WHERE pa.payment_id = p.payment_id
    AND pa.adjustment_type = v.adjustment_type::payment_adjustment_type_enum
    AND pa.original_krw_amount = v.original_krw_amount
    AND pa.adjusted_krw_amount = v.adjusted_krw_amount
);

INSERT INTO user_pending_action (
  account_id,
  action_type,
  reference_table,
  reference_id,
  title,
  description,
  status,
  priority,
  created_at,
  resolved_at
)
SELECT
  a.account_id,
  v.action_type::pending_action_type_enum,
  v.reference_table,
  CASE v.reference_table
    WHEN 'payment_adjustment' THEN (
      SELECT pa.adjustment_id
      FROM payment_adjustment pa
      JOIN payment p ON p.payment_id = pa.payment_id
      WHERE p.merchant_name_raw = v.target_merchant_name_raw
        AND p.paid_at = v.target_paid_at
      LIMIT 1
    )
    WHEN 'payment' THEN (
      SELECT p.payment_id
      FROM payment p
      WHERE p.merchant_name_raw = v.target_merchant_name_raw
        AND p.paid_at = v.target_paid_at
      LIMIT 1
    )
    WHEN 'payment_item' THEN (
      SELECT pi.payment_item_id
      FROM payment_item pi
      JOIN payment p ON p.payment_id = pi.payment_id
      WHERE p.merchant_name_raw = v.target_merchant_name_raw
        AND p.paid_at = v.target_paid_at
      LIMIT 1
    )
  END,
  v.title,
  v.description,
  v.status,
  v.priority,
  TIMESTAMPTZ '2026-03-19 09:00:00+09:00',
  v.resolved_at
FROM (
  VALUES
    ('mina.kim@example.com', 'FX_CORRECTION_NEEDED', 'payment_adjustment', 'AMAZON.COM', TIMESTAMPTZ '2026-03-15 23:40:00+09:00', 'Confirm FX correction for Amazon purchase', 'USD charge needs user confirmation', 'PENDING', 'HIGH', NULL),
    ('mina.kim@example.com', 'DUPLICATE_DETECTED', 'payment', 'Coupang', TIMESTAMPTZ '2026-03-11 21:05:00+09:00', 'Possible duplicate Coupang payment', 'Two similar entries were detected', 'PENDING', 'MEDIUM', NULL),
    ('jiyun.park@example.com', 'EXCEL_REVIEW', 'payment', 'Baemin', TIMESTAMPTZ '2026-03-16 19:20:00+09:00', 'Review uploaded Excel row', 'Imported row needs review before confirmation', 'PENDING', 'MEDIUM', NULL),
    ('jiyun.park@example.com', 'PERFORMANCE_EXCLUSION_CHECK', 'payment_item', 'Emart', TIMESTAMPTZ '2026-03-18 10:10:00+09:00', 'Check insurance premium exclusion', 'Insurance premium should not count toward performance', 'RESOLVED', 'LOW', TIMESTAMPTZ '2026-03-19 09:00:00+09:00')
) AS v(email, action_type, reference_table, target_merchant_name_raw, target_paid_at, title, description, status, priority, resolved_at)
JOIN account a ON a.email = v.email
WHERE NOT EXISTS (
  SELECT 1
  FROM user_pending_action upa
  WHERE upa.account_id = a.account_id
    AND upa.action_type = v.action_type::pending_action_type_enum
    AND upa.title = v.title
);

COMMIT;
