import os
import random
import json
from datetime import datetime, timedelta
import psycopg

# 환경 변수에서 가져오거나 기본값 사용 (Supabase)
db_url = os.environ.get("DATABASE_URL", "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require")

# 테스트 계정 정의표 (account_id, email, display_name, is_admin, payment_count, post_count)
TEST_ACCOUNTS = [
    ('11111111-1111-1111-1111-111111111111', 'admin@cardwise.com', '마스터 관리자', True, 250, 35),
    ('22222222-2222-2222-2222-222222222222', 'userA@cardwise.com', '활성유저A', False, 120, 10),
    ('33333333-3333-3333-3333-333333333333', 'userB@cardwise.com', '뉴비유저B', False, 10, 1),
    ('a8d9f12b-3c4e-5a6b-7c8d-9e0f1a2b3c4d', 'random@cardwise.com', '랜덤테스터', False, 60, 5)
]

CAT_MAP = {
    21: '식비', 22: '쇼핑', 23: '교통', 24: '보험', 25: '카페/디저트',
    26: '배달/식사', 27: '온라인쇼핑', 28: '생활자재', 29: '대중교통', 30: '고급보험'
}

merchants_per_cat = {
    '식비': ['맥도날드', '김밥천국', '본죽', '서브웨이', '버거킹', '고베규카츠', '토끼정'],
    '카페/디저트': ['스타벅스', '투썸플레이스', '이디야커피', '메가커피', '공차', '설빙', '파바', '케이크하우스', '빽다방'],
    '쇼핑': ['무신사', '올리브영', '나이키', '아디다스', '다이소', 'H&M', '자라'],
    '배달/식사': ['배달의민족', '쿠팡이츠', '요기요', '도미노피자', '교촌치킨', 'bhc'],
    '온라인쇼핑': ['쿠팡', '네이버쇼핑', 'G마켓', '11번가', '마켓컬리'],
    '교통': ['카카오택시', '쏘카', '티머니', '코레일', 'SRT', 'S-Oil', 'GS칼텍스'],
    '대중교통': ['지하철', '버스'],
    '공통/기타': ['유튜브 프리미엄', '넷플릭스', '유플러스', '전기요금', '수도요금']
}

post_categories = ['카드추천', '절약꿀팁', '자유게시판', '금융뉴스', 'Q&A']
post_titles = [
    "이번 달 생활비 줄이는 꿀팁 공유합니다!", "사회 초년생 카드 추천 좀 해주세요.", "무신사 할인 카드 뭐가 제일 좋나요?",
    "배민 쿠폰 매일 받는 법 아시나요?", "스타벅스 50% 할인 카드 정리해봤습니다.", "연회비 없는 제일 좋은 카드는?",
    "공과금 할인 카드 진짜 있나요?", "제테크 1억 모으기 도전 중입니다", "오늘 저녁 메뉴 추천 받습니다!", "애플페이 드디어 현대카드 말고도??",
    "삼성페이랑 네이버페이 연동 꿀팁", "알뜰폰 요금제 추천 부탁드려요.", "넷플릭스 공유 금지... 대안이 있을까요?",
    "내 자산 점수 86점인데 높은 건가요?", "어제 술값으로 50만원 순삭 ㅠㅠ", "친구랑 공동 가계부 쓰기 시작했어요!", "부부 돈 관리 어떻게 하시나요?",
    "로또 1등 되면 뭐하고 싶으세요?", "취업 성공! 첫 월급 기념 부모님 선물 추천", "주말에 가기 좋은 카페 리스트"
]

def generate_sample_data():
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            try:
                # 1. Base Setup (Categories & Card Companies)
                print("Updating categories and card companies...")
                for cid, name in CAT_MAP.items():
                    cur.execute("UPDATE category SET category_name = %s WHERE category_id = %s", (name, cid))
                
                for cid, name in [(13, 'KB Kookmin Card'), (14, 'BC Card'), (15, 'Woori Card'), (16, 'Lotte Card')]:
                    cur.execute("INSERT INTO card_company (card_company_id, company_name) OVERRIDING SYSTEM VALUE VALUES (%s, %s) ON CONFLICT DO NOTHING", (cid, name))
                
                # 2. Cards Setup
                print("Registering more cards...")
                card_pool = [
                    (101, "KB국민 노리2 체크카드", "ISSUANCE_MONTH", 13, "CHECK", 0),
                    (102, "신한카드 쏠트래블", "ISSUANCE_MONTH", 12, "CHECK", 0),
                    (103, "삼성 iD on 카드", "ISSUANCE_MONTH", 9, "CREDIT", 15000),
                    (104, "현대카드 ZERO Edition3", "ISSUANCE_MONTH", 10, "CREDIT", 10000),
                    (105, "BC 바로 리워드 플러스", "ISSUANCE_MONTH", 14, "CREDIT", 12000),
                    (106, "우리 롯데카드 D-Day", "ISSUANCE_MONTH", 16, "CREDIT", 15000)
                ]
                for cid, name, basis, co_id, ctype, fee in card_pool:
                    cur.execute("""
                        INSERT INTO card (card_id, card_name, annual_perf_basis, has_performance_tier, is_active, card_company_id, card_type, annual_fee, card_rules)
                        OVERRIDING SYSTEM VALUE
                        VALUES (%s, %s, %s, true, true, %s, %s, %s, '{}')
                        ON CONFLICT (card_id) DO UPDATE SET card_name = EXCLUDED.card_name
                    """, (cid, name, basis, co_id, ctype, fee))

                # 3. Setup Accounts and Seed Test Data
                now = datetime.now()

                for account_id, email, display_name, is_admin, payment_count, post_count in TEST_ACCOUNTS:
                    print(f"\n--- Processing Setup for Account: {display_name} ({account_id}) ---")
                    
                    # 3-1. Upsert Account (Ensure RLS/FK dependencies are met without Supabase Auth)
                    cur.execute("""
                        INSERT INTO account (account_id, email, is_admin) 
                        VALUES (%s, %s, %s)
                        ON CONFLICT (account_id) DO UPDATE SET email = EXCLUDED.email, is_admin = EXCLUDED.is_admin
                    """, (account_id, email, is_admin))

                    cur.execute("""
                        INSERT INTO account_profile (account_id, display_name, gender, birth_year) 
                        VALUES (%s, %s, 'M', 1995)
                        ON CONFLICT (account_id) DO UPDATE SET display_name = EXCLUDED.display_name
                    """, (account_id, display_name))

                    cur.execute("""
                        INSERT INTO notification_setting (account_id) VALUES (%s) ON CONFLICT DO NOTHING
                    """, (account_id,))

                    # 3-2. User Cards
                    for cid, _, _, _, _, _ in card_pool:
                        # Skip some cards randomly for non-admin to have varied data
                        if not is_admin and random.random() < 0.4: continue
                        
                        cur.execute("""
                            INSERT INTO user_card (account_id, card_id, card_nickname, issued_at, is_active)
                            VALUES (%s, %s, NULL, '2024-01-01', true)
                            ON CONFLICT DO NOTHING
                        """, (account_id, cid))
                    
                    cur.execute("SELECT user_card_id FROM user_card WHERE account_id = %s", (account_id,))
                    user_card_ids = [r[0] for r in cur.fetchall()]
                    
                    if not user_card_ids:
                        continue # No cards, skip payment generation

                    # 3-3. Cleanup Existent Dependencies
                    cur.execute("SELECT payment_id FROM payment WHERE account_id = %s", (account_id,))
                    payment_ids = [r[0] for r in cur.fetchall()]
                    
                    # Safe clearing (Ignoring missing table errors if some schema upgrades are skipped)
                    try: cur.execute("DELETE FROM payment_adjustment WHERE payment_id = ANY(%s)", (payment_ids,))
                    except: conn.rollback(); cur.execute("ROLLBACK")
                    try: cur.execute("DELETE FROM user_pending_action WHERE account_id = %s", (account_id,))
                    except: conn.rollback(); cur.execute("ROLLBACK")
                    
                    cur.execute("DELETE FROM payment_item WHERE payment_id = ANY(%s)", (payment_ids,))
                    cur.execute("DELETE FROM payment_draft WHERE payment_id = ANY(%s)", (payment_ids,))
                    cur.execute("DELETE FROM payment WHERE account_id = %s", (account_id,))
                    
                    # 3-4. Generate Payments
                    print(f"Generating {payment_count} payments for {display_name}...")
                    for _ in range(payment_count):
                        days_ago = random.uniform(0, 95)
                        paid_at = now - timedelta(days=days_ago)
                        cat_id = random.choice(list(CAT_MAP.keys()))
                        cat_name = CAT_MAP[cat_id]
                        merchant = random.choice(merchants_per_cat.get(cat_name, ['일반상점']))
                        
                        if cat_name in ['쇼핑', '온라인쇼핑']: amount = random.randint(35000, 500000)
                        elif cat_name in ['카페/디저트']: amount = random.randint(4500, 30000)
                        elif cat_name in ['식비', '배달/식사']: amount = random.randint(15000, 110000)
                        elif cat_name in ['교통', '대중교통']: amount = random.randint(1250, 45000)
                        else: amount = random.randint(5000, 150000)
                        
                        ucid = random.choice(user_card_ids)
                        # Check columns (fallback for recent schema if final_krw_amount exists)
                        try:
                            cur.execute("""
                                INSERT INTO payment (account_id, user_card_id, merchant_name_raw, paid_at, krw_amount, final_krw_amount, is_adjusted, updated_at)
                                VALUES (%s, %s, %s, %s, %s, %s, false, NOW())
                            """, (account_id, ucid, merchant, paid_at, amount, amount))
                        except psycopg.errors.UndefinedColumn:
                            conn.rollback()
                            cur.execute("""
                                INSERT INTO payment (account_id, user_card_id, merchant_name_raw, paid_at, krw_amount, updated_at)
                                VALUES (%s, %s, %s, %s, %s, NOW())
                            """, (account_id, ucid, merchant, paid_at, amount))

                    # 3-5. Community Posts
                    print(f"Generating {post_count} community posts for {display_name}...")
                    cur.execute("DELETE FROM community_comment WHERE post_id IN (SELECT post_id FROM community_post WHERE account_id = %s)", (account_id,))
                    cur.execute("DELETE FROM community_post_like WHERE post_id IN (SELECT post_id FROM community_post WHERE account_id = %s)", (account_id,))
                    cur.execute("DELETE FROM community_post_bookmark WHERE post_id IN (SELECT post_id FROM community_post WHERE account_id = %s)", (account_id,))
                    cur.execute("DELETE FROM community_post WHERE account_id = %s", (account_id,))

                    sample_tags = ["꿀팁", "내돈내산", "재테크", "카드추천", "절약", "맛집탐방", "여행에미치다"]
                    for i in range(post_count):
                        title = random.choice(post_titles)
                        content = f"'{title}' 에 대한 저의 생각을 공유합니다. 요즘 가계부 관리하면서 느낀 점이 많네요. 다들 어떻게 관리하시나요? 댓글 부탁드려요!"
                        cat = random.choice(post_categories)
                        tags_json = json.dumps(random.sample(sample_tags, 3))
                        created_at = now - timedelta(days=random.uniform(0, 60))
                        
                        cur.execute("""
                            INSERT INTO community_post (account_id, category, title, content, tags, view_count, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                        """, (account_id, cat, title, content, tags_json, random.randint(20, 3000), created_at))
                
                conn.commit()
                print("\n=========================================")
                print(" Successfully completed multi-account seed!")
                print("=========================================")

            except Exception as e:
                print(f"FATAL ERROR: {e}")
                conn.rollback()
                raise e

if __name__ == "__main__":
    generate_sample_data()
