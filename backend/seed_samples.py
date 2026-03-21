import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

CARDS_TO_SEED = [
    (101, "KB국민 노리2 체크카드", "kb", "domestic", "DEBIT", 13),
    (102, "신한카드 쏠트래블", "shinhan", "visa", "DEBIT", 12),
    (103, "삼성 iD on 카드", "samsung", "mastercard", "CREDIT", 9),
    (104, "현대카드 ZERO Edition3", "hyundai", "visa", "CREDIT", 10),
    (105, "BC 바로 리워드 플러스", "bc", "mastercard", "CREDIT", 14),
    (106, "우리 롯데카드 D-Day", "woori", "domestic", "CREDIT", 16),
    (107, "하나 트래블로그 체크카드", "hana", "mastercard", "DEBIT", 17),
    (108, "NH농협 올바른 POINT", "nh", "visa", "CREDIT", 18),

    # Shinhan (12, 'shinhan')
    (201, "신한카드 Mr.Life", "shinhan", "visa", "CREDIT", 12),
    (202, "신한카드 Deep Oil", "shinhan", "mastercard", "CREDIT", 12),
    (203, "신한카드 처음 (ANNIVERSE)", "shinhan", "visa", "CREDIT", 12),
    (204, "신한카드 삑 (B.Big)", "shinhan", "mastercard", "CREDIT", 12),
    (205, "신한카드 Discount Plan+", "shinhan", "visa", "CREDIT", 12),
    (206, "신한카드 Deep Dream", "shinhan", "visa", "CREDIT", 12),
    (207, "신한카드 Air One", "shinhan", "amex", "CREDIT", 12),
    (208, "신한카드 Global Air", "shinhan", "mastercard", "CREDIT", 12),
    (209, "신한카드 Shopping Li", "shinhan", "visa", "CREDIT", 12),
    (210, "신한카드 Deep Store", "shinhan", "visa", "CREDIT", 12),

    # Hyundai (10, 'hyundai')
    (211, "현대카드 M", "hyundai", "visa", "CREDIT", 10),
    (212, "현대카드 ZERO Edition3 (할인형)", "hyundai", "visa", "CREDIT", 10),
    (213, "현대카드 ZERO Edition3 (포인트형)", "hyundai", "mastercard", "CREDIT", 10),
    (214, "현대카드 Z 패밀리 에디션2", "hyundai", "visa", "CREDIT", 10),
    (215, "American Express® Gold Card Edition2", "hyundai", "amex", "CREDIT", 10),
    (216, "현대카드 X", "hyundai", "visa", "CREDIT", 10),
    (217, "현대카드 the Pink", "hyundai", "visa", "CREDIT", 10),
    (218, "현대카드 the Green", "hyundai", "mastercard", "CREDIT", 10),
    (219, "현대카드 the Red", "hyundai", "visa", "CREDIT", 10),
    (220, "현대카드 the Black", "hyundai", "amex", "CREDIT", 10),

    # Samsung (9, 'samsung')
    (221, "삼성카드 taptap O", "samsung", "visa", "CREDIT", 9),
    (222, "삼성카드 iD ON", "samsung", "visa", "CREDIT", 9),
    (223, "삼성카드 iD SELECT ON", "samsung", "mastercard", "CREDIT", 9),
    (224, "삼성카드 iD SELECT ALL", "samsung", "visa", "CREDIT", 9),
    (225, "삼성카드 iD PLUG IN", "samsung", "mastercard", "CREDIT", 9),
    (226, "삼성카드 taptap DRIVE", "samsung", "visa", "CREDIT", 9),
    (227, "삼성카드 & MILEAGE PLATINUM (스카이패스)", "samsung", "amex", "CREDIT", 9),
    (228, "삼성카드 4", "samsung", "visa", "CREDIT", 9),
    (229, "삼성카드 6", "samsung", "mastercard", "CREDIT", 9),
    (230, "삼성카드 iD MOVE", "samsung", "visa", "CREDIT", 9),

    # KB Kookmin (13, 'kb')
    (231, "KB국민 My WE:SH 카드", "kb", "visa", "CREDIT", 13),
    (232, "KB국민 청춘대로 톡톡카드", "kb", "mastercard", "CREDIT", 13),
    (233, "KB국민 톡톡 with 카드", "kb", "visa", "CREDIT", 13),
    (234, "KB국민 탄탄대로 Miz&Mr카드", "kb", "visa", "CREDIT", 13),
    (235, "KB국민 Easy all 티타늄카드", "kb", "mastercard", "CREDIT", 13),
    (236, "KB국민 다담카드", "kb", "visa", "CREDIT", 13),
    (237, "KB국민 탄탄대로 올쇼핑 티타늄카드", "kb", "mastercard", "CREDIT", 13),
    (238, "KB국민 Be Berry 카드", "kb", "visa", "CREDIT", 13),
    (239, "KB국민 Wise 카드", "kb", "visa", "CREDIT", 13),
    (240, "KB국민 노리2 체크카드 (국내전용)", "kb", "domestic", "DEBIT", 13),

    # Lotte (16, 'lotte')
    (241, "롯데카드 LOCA 365", "lotte", "visa", "CREDIT", 16),
    (242, "롯데카드 LOCA LIKIT 1.2", "lotte", "visa", "CREDIT", 16),
    (243, "디지로카 London", "lotte", "mastercard", "CREDIT", 16),
    (244, "디지로카 Las Vegas", "lotte", "visa", "CREDIT", 16),
    (245, "디지로카 Monaco", "lotte", "amex", "CREDIT", 16),
    (246, "롯데카드 LOCA for Shopping", "lotte", "visa", "CREDIT", 16),
    (247, "롯데카드 LOCA for Auto", "lotte", "mastercard", "CREDIT", 16),
    (248, "롯데카드 LOCA for Health", "lotte", "visa", "CREDIT", 16),
    (249, "롯데카드 LOCA for Edu", "lotte", "visa", "CREDIT", 16),
    (250, "롯데카드 LIKIT FUN", "lotte", "visa", "CREDIT", 16),

    # Woori (15, 'woori')
    (251, "카드의정석 EVERY MILE SKYPASS", "woori", "visa", "CREDIT", 15),
    (252, "카드의정석 EVERY DISCOUNT", "woori", "mastercard", "CREDIT", 15),
    (253, "카드의정석 SHOPPING+", "woori", "visa", "CREDIT", 15),
    (254, "우리카드 7CORE", "woori", "visa", "CREDIT", 15),
    (255, "K-패스 우리카드 체크", "woori", "domestic", "DEBIT", 15),
    (256, "카드의정석 에브리데이 체크", "woori", "visa", "DEBIT", 15),
    (257, "위비 트래블 체크카드", "woori", "mastercard", "DEBIT", 15),
    (258, "우리카드 DA@카드의정석", "woori", "visa", "CREDIT", 15),
    (259, "우리카드 D4@카드의정석", "woori", "mastercard", "CREDIT", 15),
    (260, "카드의정석 UNTACT", "woori", "visa", "CREDIT", 15),

    # Hana (17, 'hana')
    (261, "하나카드 JADE Classic", "hana", "visa", "CREDIT", 17),
    (262, "하나 스카이패스 아멕스 플래티늄", "hana", "amex", "CREDIT", 17),
    (263, "하나 원더카드 2.0 LIFE", "hana", "visa", "CREDIT", 17),
    (264, "하나 원더카드 2.0 YOUNG", "hana", "mastercard", "CREDIT", 17),
    (265, "더 심플 하나카드", "hana", "visa", "CREDIT", 17),
    (266, "토스뱅크 하나카드 Day", "hana", "visa", "CREDIT", 17),
    (267, "하나 트래블로그 신용카드", "hana", "mastercard", "CREDIT", 17),
    (268, "하나 클럽 SK 카드", "hana", "visa", "CREDIT", 17),
    (269, "하나 Mile 1.6", "hana", "visa", "CREDIT", 17),
    (270, "하나 Smart Any", "hana", "mastercard", "CREDIT", 17),

    # NH (18, 'nh')
    (271, "NH올원 파이카드", "nh", "visa", "CREDIT", 18),
    (272, "NH농협 올바른 FLEX 카드", "nh", "mastercard", "CREDIT", 18),
    (273, "NH20 해봄카드", "nh", "visa", "CREDIT", 18),
    (274, "NH농협 올바른 POINT 카드", "nh", "visa", "CREDIT", 18),
    (275, "NH올원 Shopping&11번가카드", "nh", "mastercard", "CREDIT", 18),
    (276, "NH올원 All100카드", "nh", "visa", "CREDIT", 18),
    (277, "NH농협 Global 체크카드", "nh", "visa", "DEBIT", 18),
    (278, "NH농협 Take 5", "nh", "mastercard", "CREDIT", 18),
    (279, "NH농협 채움", "nh", "visa", "CREDIT", 18),
    (280, "NH농협 Basic", "nh", "visa", "CREDIT", 18),

    # BC (14, 'bc')
    (281, "BC 바로 클리어 플러스", "bc", "visa", "CREDIT", 14),
    (282, "BC 바로 MACAO", "bc", "mastercard", "CREDIT", 14),
    (283, "BC 바로 On&Off", "bc", "visa", "CREDIT", 14),
    (284, "BC 바로 K-first", "bc", "visa", "CREDIT", 14),
    (285, "BC 바로 Air", "bc", "mastercard", "CREDIT", 14),
    (286, "BC 바로 G-Money", "bc", "visa", "CREDIT", 14),
    (287, "BC 바로 Biz", "bc", "visa", "CREDIT", 14),
    (288, "BC 바로 Green", "bc", "mastercard", "CREDIT", 14),
    (289, "BC 바로 Shopping", "bc", "visa", "CREDIT", 14),
    (290, "BC 바로 Dining", "bc", "visa", "CREDIT", 14),
]

def seed_sample_cards():
    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                print("Checking/Adding companies...")
                cur.execute("INSERT INTO card_company (card_company_id, company_name) OVERRIDING SYSTEM VALUE VALUES (17, 'Hana Card'), (18, 'NH Nonghyup Card') ON CONFLICT DO NOTHING")
                
                print(f"Seeding {len(CARDS_TO_SEED)} card templates...")
                for cid, name, issuer_id, brand_id, ctype, coid in CARDS_TO_SEED:
                    cur.execute("""
                        INSERT INTO card (card_id, card_name, issuer_id, brand_id, card_type, card_company_id, annual_perf_basis, has_performance_tier, is_active, card_rules)
                        OVERRIDING SYSTEM VALUE
                        VALUES (%s, %s, %s, %s, %s, %s, 'ISSUANCE_MONTH', true, true, '{}')
                        ON CONFLICT (card_id) DO UPDATE SET 
                            card_name = EXCLUDED.card_name,
                            issuer_id = EXCLUDED.issuer_id,
                            brand_id = EXCLUDED.brand_id,
                            card_type = EXCLUDED.card_type,
                            card_company_id = EXCLUDED.card_company_id
                    """, (cid, name, issuer_id, brand_id, ctype, coid))
                
                conn.commit()
                print("Successfully completed sample card seed!")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    seed_sample_cards()
