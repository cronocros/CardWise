import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'card'")
            cols = cur.fetchall()
            for col in cols:
                print(col)
except Exception as e:
    print("Error:", e)
