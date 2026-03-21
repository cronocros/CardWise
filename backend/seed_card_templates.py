import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

CARDS = [
    (101, "KB국민 노리2 체크카드", "kb", "domestic", "CHECK", 13),
    (102, "신한카드 쏠트래블", "shinhan", "visa", "CHECK", 12),
    (103, "삼성 iD on 카드", "samsung", "mastercard", "CREDIT", 9),
    (104, "현대카드 ZERO Edition3", "hyundai", "visa", "CREDIT", 10),
    (105, "BC 바로 리워드 플러스", "bc", "mastercard", "CREDIT", 14),
    (106, "우리 롯데카드 D-Day", "woori", "domestic", "CREDIT", 16),
]

def seed_card_templates():
    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                print("Seeding card templates...")
                for cid, name, issuer_id, brand_id, ctype, coid in CARDS:
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
                print("Done!")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    seed_card_templates()
