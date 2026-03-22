-- 2026.03.22. 06:00:00. Card Template Enhancements
-- Link master card table to issuers and brands

-- 1. Add issuer_id and brand_id to card table
ALTER TABLE public.card 
ADD COLUMN IF NOT EXISTS issuer_id TEXT REFERENCES public.card_issuer(issuer_id),
ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES public.card_brand(brand_id);

-- 2. Update existing cards with issuer info (optional, based on card_company_id if mapping exists)
-- Assuming card_company_id 1 = 현대, 2 = 삼성 ... etc (mapping from initial_schema)
UPDATE public.card SET issuer_id = 'hyundai' WHERE card_company_id = 1;
UPDATE public.card SET issuer_id = 'samsung' WHERE card_company_id = 2;

-- 3. Insert some sample Card Templates with Brands and Features
INSERT INTO public.card (card_name, issuer_id, brand_id, card_type, features, is_active) VALUES
('LOCA LIKIT 1.2', 'lotte', 'visa', 'CREDIT', '["contactless", "apple_pay"]', true),
('신한카드 Mr.Life', 'shinhan', 'visa', 'CREDIT', '["transport", "samsung_pay"]', true),
('신한카드 Deep Dream', 'shinhan', 'mastercard', 'CREDIT', '["transport"]', true),
('현대카드 M Boost', 'hyundai', 'visa', 'CREDIT', '["apple_pay", "contactless"]', true),
('삼성카드 taptap O', 'samsung', 'mastercard', 'CREDIT', '["transport", "samsung_pay"]', true),
('KB국민 나랑사랑카드', 'kb', 'local', 'DEBIT', '["transport", "wallet"]', true),
('네이버페이 머니 하나 체크카드', 'hana', 'visa', 'DEBIT', '["contactless"]', true);
