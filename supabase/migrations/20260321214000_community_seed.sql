-- Community Seed Data
-- 🪐 전체, 💡 꿀팁, 💰 절약, ❓ 질문, 💬 자유

INSERT INTO community_post (account_id, category, title, content, view_count, created_at, updated_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 'CARD_HACKS', '사회초년생을 위한 신용카드 추천 Top 3 💡', '사회 생활 시작하면서 카드 고민 많으시죠? 전월 실적 상관 없이 혜택 좋은 카드들을 정리해봤습니다. 1. 현대카드 ZERO Edition2 2. 신한카드 Deep Dream 3. 삼성카드 tap tap O...', 124, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'SAVING_TIPS', '이번 달 통신비 2만원 아낀 썰 💰', '알뜰폰 요금제로 바꾸고 제휴 카드 혜택까지 받으니까 정말 많이 아껴지네요! 여러분도 월 고정 지출부터 점검해보세요.', 256, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'QNA', '해외 결제 수수료 없는 카드 있나요? ❓', '다음 달에 일본 여행 가는데 환전 수수료 아낄 수 있는 트래블로그나 트래블월렛 중에 뭐가 더 좋을까요?', 89, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
('11111111-1111-1111-1111-111111111111', 'FREE', '오늘 날씨 너무 좋네요 ☀️', '카드 긁으러 쇼핑 가기 딱 좋은 날씨입니다 (농담입니다 절약해야죠...) 모두 즐거운 주말 보내세요!', 42, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

INSERT INTO community_comment (post_id, account_id, content, created_at)
VALUES 
(1, '11111111-1111-1111-1111-111111111111', '정말 유용한 정보네요! 감사합니다 ^^', NOW() - INTERVAL '1 day'),
(1, '11111111-1111-1111-1111-111111111111', '저는 롯데카드 로카 라이킷 쓰고 있는데 이것도 괜찮더라구요.', NOW() - INTERVAL '12 hours'),
(2, '11111111-1111-1111-1111-111111111111', '저도 조만간 알뜰폰으로 갈아타려구요 ㅎㅎ', NOW() - INTERVAL '10 hours');
