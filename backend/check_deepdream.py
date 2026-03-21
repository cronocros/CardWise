import psycopg2
try:
    conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/cardwise')
    cur = conn.cursor()
    cur.execute("SELECT card_id, card_name, image_url FROM card WHERE card_name LIKE '%Deep Dream%'")
    rows = cur.fetchall()
    for r in rows:
        print(r)
    cur.close()
    conn.close()
except Exception as e:
    print(e)
