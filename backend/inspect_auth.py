import os
import psycopg
db_url = os.environ.get('DATABASE_URL', 'postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require')
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        # Check an API-created user
        cur.execute("SELECT * FROM auth.users WHERE email = 'admin2@cardwise.com' LIMIT 1;")
        cols = [desc[0] for desc in cur.description]
        api_user = dict(zip(cols, cur.fetchone()))
        print("API created user:\n", api_user)

        # Check a manual created user
        cur.execute("SELECT * FROM auth.users WHERE email = 'admin@cardwise.com' LIMIT 1;")
        manual_user = dict(zip(cols, cur.fetchone()))
        print("\nManual created user:\n", manual_user)
        
        # Check Identity
        cur.execute("SELECT * FROM auth.identities WHERE user_id = %s", (manual_user['id'],))
        cols_id = [desc[0] for desc in cur.description]
        print("\nManual Identity:\n", [dict(zip(cols_id, row)) for row in cur.fetchall()])
        
        cur.execute("SELECT * FROM auth.identities WHERE user_id = %s", (api_user['id'],))
        print("\nAPI Identity:\n", [dict(zip(cols_id, row)) for row in cur.fetchall()])
