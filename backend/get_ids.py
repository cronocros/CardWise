import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT user_card_id, card_id FROM user_card WHERE account_id = '11111111-1111-1111-1111-111111111111'")
            rows = cur.fetchall()
            print("User Cards:", rows)
            
            cur.execute("SELECT category_id, category_name FROM category")
            cats = cur.fetchall()
            print("Categories:", cats)

except Exception as e:
    print("Error:", e)
