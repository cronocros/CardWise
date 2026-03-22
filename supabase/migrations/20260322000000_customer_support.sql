-- Migration: Customer Support Schema (Notice, Inquiry, FAQ)
-- Created: 2026-03-22

-- 1. 공지사항 (Notice)
CREATE TABLE IF NOT EXISTS notice (
    notice_id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_critical BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. 1:1 문의 (Inquiry)
CREATE TABLE IF NOT EXISTS inquiry (
    inquiry_id BIGSERIAL PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES account(account_id),
    category TEXT NOT NULL, -- BILLING (결제/정산), CARD_INFO (카드정보), GAMIFICATION (이벤트/배지), OTHER (기타)
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    answer TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ANSWERED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    answered_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 3. FAQ (자주 묻는 질문)
CREATE TABLE IF NOT EXISTS faq (
    faq_id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS 설정
ALTER TABLE notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- 공지사항 및 FAQ는 모든 인증된 사용자가 읽기 가능
CREATE POLICY "notice_select_authenticated" ON notice FOR SELECT TO authenticated USING (true);
CREATE POLICY "faq_select_authenticated" ON faq FOR SELECT TO authenticated USING (true);

-- 1:1 문의는 본인 것만 조회 및 작성 가능
CREATE POLICY "inquiry_select_own" ON inquiry FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "inquiry_insert_own" ON inquiry FOR INSERT WITH CHECK (account_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER trg_notice_updated_at BEFORE UPDATE ON notice FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inquiry_updated_at BEFORE UPDATE ON inquiry FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_faq_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION set_updated_at();
