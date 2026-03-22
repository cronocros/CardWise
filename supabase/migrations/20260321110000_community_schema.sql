-- Community Schema Migration
-- post, comment, like, bookmark

CREATE TABLE IF NOT EXISTS community_post (
    post_id BIGSERIAL PRIMARY KEY,
    account_id UUID NOT NULL,
    category TEXT NOT NULL, -- CARD_HACKS, SAVING_TIPS, QNA, FREE
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_community_post_account_id ON community_post(account_id);
CREATE INDEX idx_community_post_category ON community_post(category);
CREATE INDEX idx_community_post_deleted_at ON community_post(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS community_comment (
    comment_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES community_post(post_id),
    account_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_community_comment_post_id ON community_comment(post_id);
CREATE INDEX idx_community_comment_deleted_at ON community_comment(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS community_post_like (
    like_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES community_post(post_id),
    account_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, account_id)
);

CREATE TABLE IF NOT EXISTS community_post_bookmark (
    bookmark_id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES community_post(post_id),
    account_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, account_id)
);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_community_post_updated_at
    BEFORE UPDATE ON community_post
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_community_comment_updated_at
    BEFORE UPDATE ON community_comment
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
