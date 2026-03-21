import os
import psycopg

db_url = os.environ.get("DATABASE_URL", "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require")

with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        try:
            cur.execute("SELECT current_setting('app.settings.jwt_secret', true)")
            print('JWT Secret:', cur.fetchone()[0])
        except Exception as e:
            print('Error:', e)
