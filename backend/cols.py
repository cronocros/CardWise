import os
import sys
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
table_name = sys.argv[1] if len(sys.argv) > 1 else 'card'

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{table_name}'")
            cols = cur.fetchall()
            for col in cols:
                print(col)
except Exception as e:
    print("Error:", e)
