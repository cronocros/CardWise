import os
import psycopg

db_url = os.environ.get("DATABASE_URL", "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require")

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        try:
            # First, check identity structure
            cur.execute("SELECT id FROM auth.users WHERE email = 'admin2@cardwise.com'")
            uid = cur.fetchone()
            if uid:
                uid = uid[0]
                new_uid = '11111111-1111-1111-1111-111111111112'
                cur.execute("UPDATE auth.users SET id = %s, email_confirmed_at = now() WHERE id = %s", (new_uid, uid))
                conn.commit()
                print("UUID successfully updated via CASCADE.")
        except Exception as e:
            print("Failed to update UUID:", e)
