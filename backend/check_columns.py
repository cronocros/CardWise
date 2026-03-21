import psycopg
db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'card' AND column_name = 'image_url'")
        print(f"Card image_url: {cur.fetchone()}")
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_card' AND column_name = 'image_url'")
        print(f"UserCard image_url: {cur.fetchone()}")
