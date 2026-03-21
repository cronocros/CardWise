import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT card_company_id, company_name FROM card_company")
            rows = cur.fetchall()
            print("Card Companies:", rows)
except Exception as e:
    print("Error:", e)
