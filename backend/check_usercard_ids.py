import psycopg
db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT user_card_id, card_nickname FROM user_card LIMIT 5")
        print(cur.fetchall())
