-- Add parent_id for 1-depth reply feature
ALTER TABLE community_comment ADD COLUMN parent_id BIGINT REFERENCES community_comment(comment_id) ON DELETE CASCADE;

-- Insert some dummy comments as replies
DO $$ 
DECLARE
    new_comment_id bigint;
BEGIN
    -- Insert a new parent comment
    INSERT INTO community_comment (post_id, account_id, content, created_at)
    VALUES (3, '11111111-1111-1111-1111-111111111111', '트래블로그 카드 추천합니다. 하나저축 통장이랑 연계하면 충전도 간편해요.', NOW() - INTERVAL '2 hours')
    RETURNING comment_id INTO new_comment_id;

    -- Insert a reply to the above comment
    INSERT INTO community_comment (post_id, account_id, content, parent_id, created_at)
    VALUES (3, '11111111-1111-1111-1111-111111111111', '저도 트래블로그 추천! 수수료 무료라 너무 좋았어요.', new_comment_id, NOW() - INTERVAL '1 hour');

    -- Insert a reply to an existing comment (assuming id 1 exists from previous seed)
    BEGIN
        INSERT INTO community_comment (post_id, account_id, content, parent_id, created_at)
        VALUES (1, '11111111-1111-1111-1111-111111111111', '동감합니다. 정말 좋은 정보네요!', 1, NOW() - INTERVAL '30 minutes');
    EXCEPTION WHEN others THEN
        -- ignore if id 1 doesn't exist
    END;
END $$;
