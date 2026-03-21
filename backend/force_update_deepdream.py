import psycopg
db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("UPDATE card SET image_url = '/images/cards/shinhan_deepdream.png' WHERE card_name LIKE '%Deep Dream%'")
        conn.commit()
        print(f"Updated {cur.rowcount} rows.")
