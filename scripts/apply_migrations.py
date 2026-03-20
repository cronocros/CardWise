#!/usr/bin/env python3
"""
CardWise - Supabase 원격 DB 마이그레이션 적용 스크립트
사용법: python scripts/apply_migrations.py
환경변수 DATABASE_URL 또는 args로 연결 문자열 전달
"""
import os
import sys
import glob

try:
    import psycopg
except ImportError:
    print("psycopg가 설치되어 있지 않습니다. 설치: pip install psycopg[binary]")
    sys.exit(1)

def get_db_url():
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    if len(sys.argv) > 1:
        return sys.argv[1]
    print("사용법: DATABASE_URL=<url> python scripts/apply_migrations.py")
    print("  또는: python scripts/apply_migrations.py <connection_string>")
    sys.exit(1)

def get_applied_migrations(cursor):
    """이미 적용된 마이그레이션 목록을 추적 테이블에서 조회"""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS _migration_history (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    cursor.execute("SELECT filename FROM _migration_history ORDER BY filename")
    return {row[0] for row in cursor.fetchall()}

def apply_migrations(db_url: str):
    migration_dir = os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations")
    migration_files = sorted(glob.glob(os.path.join(migration_dir, "*.sql")))

    if not migration_files:
        print("마이그레이션 파일이 없습니다.")
        return

    print(f"발견된 마이그레이션 파일: {len(migration_files)}개")

    with psycopg.connect(db_url) as conn:
        with conn.cursor() as cur:
            applied = get_applied_migrations(cur)
            conn.commit()

            for filepath in migration_files:
                filename = os.path.basename(filepath)
                if filename in applied:
                    print(f"  [SKIP]  {filename} (이미 적용됨)")
                    continue

                print(f"  [APPLY] {filename} ...", end=" ", flush=True)
                with open(filepath, "r", encoding="utf-8") as f:
                    sql = f.read()

                try:
                    cur.execute(sql)
                    cur.execute(
                        "INSERT INTO _migration_history (filename) VALUES (%s)",
                        (filename,)
                    )
                    conn.commit()
                    print("✓")
                except Exception as e:
                    conn.rollback()
                    print(f"✗ 실패!")
                    print(f"     오류: {e}")
                    print("마이그레이션 중단. 이후 파일은 적용되지 않았습니다.")
                    sys.exit(1)

    print("\n모든 마이그레이션이 성공적으로 적용되었습니다.")

if __name__ == "__main__":
    apply_migrations(get_db_url())
