import psycopg

db_url = "postgresql://postgres.spzeyjwkefsfpahhrvov:INLB5pWou0hUqONJ@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

def update_deepdream_image():
    try:
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                print("Updating Shinhan Deep Dream Image URL...")
                cur.execute("""
                    UPDATE card 
                    SET image_url = '/images/cards/shinhan_deepdream.png' 
                    WHERE card_id = 206
                """)
                conn.commit()
                print("Done!")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    update_deepdream_image()
