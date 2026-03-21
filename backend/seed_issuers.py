import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

ISSUERS = [
    ('shinhan', '신한카드', True),
    ('hyundai', '현대카드', True),
    ('samsung', '삼성카드', True),
    ('kb', 'KB국민카드', True),
    ('lotte', '롯데카드', True),
    ('woori', '우리카드', True),
    ('hana', '하나카드', True),
    ('nh', 'NH농협카드', True),
    ('bc', 'BC카드', True),
]

BRANDS = [
    ('visa', 'Visa', True),
    ('mastercard', 'Mastercard', True),
    ('amex', 'Amex', True),
    ('jcb', 'JCB', True),
    ('unionpay', 'UnionPay', True),
    ('domestic', '국내전용', True),
]

def seed_issuers_brands():
    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                print("Seeding card_issuer...")
                for iid, name, active in ISSUERS:
                    cur.execute("""
                        INSERT INTO card_issuer (issuer_id, name, is_active)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (issuer_id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active
                    """, (iid, name, active))
                
                print("Seeding card_brand...")
                for bid, name, active in BRANDS:
                    cur.execute("""
                        INSERT INTO card_brand (brand_id, name, is_active)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (brand_id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active
                    """, (bid, name, active))
                
                conn.commit()
                print("Done!")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    seed_issuers_brands()
