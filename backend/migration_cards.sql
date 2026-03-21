-- 가계부 카드 스키마 고도화: 유효기간 및 다각화된 기능(Apple Pay 등) 추가
-- 1. 카드 본체에 지원 기능 목록 추가 (JSONB)
ALTER TABLE card ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- 2. 사용자 카드에 유효 기간 추가 (발급일과는 별개)
ALTER TABLE user_card ADD COLUMN IF NOT EXISTS expiry_month VARCHAR(2);
ALTER TABLE user_card ADD COLUMN IF NOT EXISTS expiry_year VARCHAR(2);

-- 3. 기존 데이터 샘플 업데이트 (예시: 현대카드 - Apple Pay, 교통카드 등)
UPDATE card SET features = '["apple_pay", "transport", "contactless"]'::jsonb WHERE card_name LIKE '%현대카드%';
UPDATE card SET features = '["samsung_pay", "transport", "contactless", "wallet"]'::jsonb WHERE card_name LIKE '%삼성%' OR card_name LIKE '%국민%' OR card_name LIKE '%신한%';

-- 4. 유효 기간 샘플 업데이트
UPDATE user_card SET expiry_month = '12', expiry_year = '28' WHERE expiry_month IS NULL;
