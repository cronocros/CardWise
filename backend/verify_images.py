import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT card_id, card_name, image_url FROM card WHERE card_name LIKE '%Deep Dream%'")
        rows = cur.fetchall()
        for r in rows:
            print(f"ID: {r[0]}, Name: {r[1]}, Image: {r[2]}")
