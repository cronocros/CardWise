import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = sorted([t[0] for t in cur.fetchall()])
            print("Tables:", tables)
            
            # Check for payment or similar
            if 'payment' in tables:
                print("Payment table exists")
            else:
                print("Payment table DOES NOT exist in public schema.")
            
            # Check for card
            if 'card' in tables:
                print("Card table exists")
            if 'user_card' in tables:
                print("UserCard table exists")

except Exception as e:
    print("Error:", e)
