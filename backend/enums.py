import os
import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT n.nspname as schema, t.typname as type FROM pg_type t LEFT JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e'")
            enums = cur.fetchall()
            for e in enums:
                print(f"Enum: {e[1]}")
                cur.execute(f"SELECT enumlabel FROM pg_enum WHERE enumtypid = '{e[1]}'::regtype")
                labels = cur.fetchall()
                print(f"  Labels: {[l[0] for l in labels]}")
except Exception as e:
    print("Error:", e)
