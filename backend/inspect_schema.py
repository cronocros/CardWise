import psycopg
db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_card' ORDER BY column_name")
        rows = cur.fetchall()
        for r in rows:
            print(f"Column: {r[0]}, Type: {r[1]}")
