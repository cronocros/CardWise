import os
import psycopg

db_url = os.environ.get("DATABASE_URL", "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require")
# Target only the last two migrations I created
TARGET_MIGRATIONS = [
    "20260321182000_auth_user_trigger.sql",
    "20260321183000_gamification.sql"
]

def apply_migrations():
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            for filename in TARGET_MIGRATIONS:
                path = os.path.join("../supabase/migrations", filename)
                print(f"Applying migration: {filename}")
                with open(path, "r", encoding='utf-8') as f:
                    sql = f.read()
                cur.execute(sql)
            
            # Sync existing test accounts
            TEST_ACCOUNTS = [
                ('11111111-1111-1111-1111-111111111111', 'admin@cardwise.com'),
                ('22222222-2222-2222-2222-222222222222', 'userA@cardwise.com'),
                ('33333333-3333-3333-3333-333333333333', 'userB@cardwise.com'),
                ('a8d9f12b-3c4e-5a6b-7c8d-9e0f1a2b3c4d', 'random@cardwise.com')
            ]
            
            for uuid, email in TEST_ACCOUNTS:
                name = email.split('@')[0].capitalize()
                cur.execute("INSERT INTO public.account (account_id, email, is_admin) VALUES (%s, %s, %s) ON CONFLICT (account_id) DO UPDATE SET email = EXCLUDED.email", (uuid, email, email.startswith('admin')))
                
                cur.execute("""
                    INSERT INTO public.account_profile (account_id, display_name, level, exp, point, tier_name)
                    VALUES (%s, %s, 24, 840, 15000, 'PLATINUM')
                    ON CONFLICT (account_id) DO UPDATE SET 
                        level = EXCLUDED.level,
                        exp = EXCLUDED.exp,
                        tier_name = EXCLUDED.tier_name,
                        display_name = EXCLUDED.display_name
                """, (uuid, name))
                
                # Starting badge
                cur.execute("INSERT INTO public.user_badge (account_id, badge_id) VALUES (%s, 'pioneer') ON CONFLICT (account_id, badge_id) DO NOTHING", (uuid,))

        conn.commit()
    print("Target migrations and sync applied successfully.")

if __name__ == "__main__":
    apply_migrations()
