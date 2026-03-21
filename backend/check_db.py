import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            # Check user_account or similar
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = cur.fetchall()
            print("Tables:", [t[0] for t in tables])
            
            # Find the account id
            if ('user_account',) in [tuple(t) for t in tables]:
                cur.execute("SELECT account_id FROM user_account LIMIT 1")
                row = cur.fetchone()
                if row:
                    print("Account ID found:", row[0])
            elif ('account',) in [tuple(t) for t in tables]:
                cur.execute("SELECT account_id FROM account LIMIT 1")
                row = cur.fetchone()
                if row:
                    print("Account ID found:", row[0])
except Exception as e:
    print("Error:", e)
