import psycopg
db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
with psycopg.connect(db_url) as conn:
    with conn.cursor() as cur:
        # Check if already exists (just in case)
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_card' AND column_name = 'image_url'")
        if cur.fetchone() is None:
            cur.execute("ALTER TABLE user_card ADD COLUMN image_url varchar(255)")
            conn.commit()
            print("Added image_url column to user_card table.")
        else:
            print("image_url column already exists.")
