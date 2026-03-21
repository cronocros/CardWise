import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'card_type_enum'::regtype")
            labels = cur.fetchall()
            print(f"Card Type Labels: {[l[0] for l in labels]}")
except Exception as e:
    print("Error:", e)
