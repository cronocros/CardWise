-- 2026.03.22. 05:00:00. Card Registration Enhancement
-- New fields for user_card and registration metadata

-- 1. Create Issuer and Brand tables
CREATE TABLE IF NOT EXISTS public.card_issuer (
    issuer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.card_brand (
    brand_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add columns to user_card
ALTER TABLE public.user_card 
ADD COLUMN IF NOT EXISTS issuer_id TEXT REFERENCES public.card_issuer(issuer_id),
ADD COLUMN IF NOT EXISTS brand_id TEXT REFERENCES public.card_brand(brand_id),
ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'CREDIT',
ADD COLUMN IF NOT EXISTS card_number_first_four TEXT,
ADD COLUMN IF NOT EXISTS card_number_last_four TEXT,
ADD COLUMN IF NOT EXISTS monthly_target_amount BIGINT DEFAULT 300000,
ADD COLUMN IF NOT EXISTS annual_target_amount BIGINT DEFAULT 10000000,
ADD COLUMN IF NOT EXISTS is_notification_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';

-- 3. Insert Master Data (Issuers)
INSERT INTO public.card_issuer (issuer_id, name) VALUES
('hyundai', '현대카드'),
('samsung', '삼성카드'),
('shinhan', '신한카드'),
('kb', 'KB국민카드'),
('lotte', '롯데카드'),
('woori', '우리카드'),
('hana', '하나카드'),
('nh', 'NH농협카드'),
('bc', 'BC카드'),
('toss', '토스뱅크'),
('kakao', '카카오뱅크'),
('kbank', '케이뱅크'),
('ibk', 'IBK기업은행')
ON CONFLICT (issuer_id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Insert Master Data (Brands)
INSERT INTO public.card_brand (brand_id, name) VALUES
('visa', 'VISA'),
('mastercard', 'MasterCard'),
('amex', 'AMEX'),
('unionpay', 'UnionPay'),
('jcb', 'JCB'),
('local', '국내전용')
ON CONFLICT (brand_id) DO UPDATE SET name = EXCLUDED.name;
