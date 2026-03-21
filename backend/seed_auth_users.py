import os
import psycopg

db_url = os.environ.get("DATABASE_URL", "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require")

TEST_ACCOUNTS = [
    ('11111111-1111-1111-1111-111111111111', 'admin@cardwise.com'),
    ('22222222-2222-2222-2222-222222222222', 'userA@cardwise.com'),
    ('33333333-3333-3333-3333-333333333333', 'userB@cardwise.com'),
    ('a8d9f12b-3c4e-5a6b-7c8d-9e0f1a2b3c4d', 'random@cardwise.com')
]

DEFAULT_PASSWORD = "password123!"

def seed_auth_users():
    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            
            for uuid, email in TEST_ACCOUNTS:
                print(f"Upserting Auth User: {email} ({uuid})")
                
                cur.execute("SELECT id FROM auth.users WHERE id = %s", (uuid,))
                exists = cur.fetchone()
                
                if not exists:
                    raw_user_meta = f'{{"sub":"{uuid}","email":"{email}","email_verified":false,"phone_verified":false}}'
                    cur.execute("""
                        INSERT INTO auth.users (
                            id, instance_id, aud, role, email, encrypted_password, 
                            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
                            created_at, updated_at, phone, is_sso_user, is_anonymous,
                            confirmation_token, recovery_token, email_change_token_new, email_change
                        )
                        VALUES (
                            %s, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
                            %s, crypt(%s, gen_salt('bf', 10)), now(), 
                            '{"provider": "email", "providers": ["email"]}', %s::jsonb, now(), now(), NULL, false, false,
                            '', '', '', ''
                        )
                    """, (uuid, email, DEFAULT_PASSWORD, raw_user_meta))

                # Insert identity manually
                identity_data = f'{{"sub":"{uuid}","email":"{email}","email_verified":false,"phone_verified":false}}'
                
                try:
                    cur.execute("""
                        INSERT INTO auth.identities (
                            id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
                        )
                        VALUES (
                            gen_random_uuid(), %s, %s, %s::jsonb, 'email', now(), now(), now()
                        )
                        ON CONFLICT (provider_id, provider) DO UPDATE SET identity_data = EXCLUDED.identity_data
                    """, (uuid, uuid, identity_data))
                except Exception as e:
                    print(f"Error inserting identity for {email}: {e}")
                    conn.rollback()
                    # Re-open transaction since error breaks it
                    conn.rollback()
                    continue

                raw_user_meta = f'{{"sub":"{uuid}","email":"{email}","email_verified":false,"phone_verified":false}}'
                cur.execute("""
                    UPDATE auth.users 
                    SET encrypted_password = crypt(%s, gen_salt('bf', 10)),
                        role = 'authenticated',
                        aud = 'authenticated',
                        email_confirmed_at = now(),
                        phone = NULL,
                        raw_user_meta_data = %s::jsonb,
                        is_sso_user = false,
                        is_anonymous = false,
                        confirmation_token = COALESCE(confirmation_token, ''),
                        recovery_token = COALESCE(recovery_token, ''),
                        email_change_token_new = COALESCE(email_change_token_new, ''),
                        email_change = COALESCE(email_change, '')
                    WHERE id = %s
                """, (DEFAULT_PASSWORD, raw_user_meta, uuid))
            
            conn.commit()
            print("Successfully populated auth.users and auth.identities for tester accounts.")

if __name__ == "__main__":
    seed_auth_users()
