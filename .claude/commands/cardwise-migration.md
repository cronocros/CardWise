# cardwise-migration: DB 마이그레이션 생성

DB 스키마 변경 시 마이그레이션 파일과 RLS 정책을 생성한다.

## 사용 시점

- 새 테이블 추가 시
- 기존 테이블에 컬럼/인덱스 추가 시
- RLS 정책 설정/변경 시
- 사용자가 "마이그레이션", "테이블 추가", "스키마 변경" 등을 언급할 때

## 프로세스

### 1. 현재 스키마 확인

- `docs/superpowers/specs/2026-03-17-cardwise-database.md` 읽기
- 기존 마이그레이션 파일 확인: `supabase/migrations/`

### 2. 변경사항 파악

사용자에게 확인:
- 어떤 테이블/컬럼을 변경하는가?
- 새 ENUM 타입이 필요한가?
- 인덱스 추가가 필요한가?
- RLS 정책이 필요한가?

### 3. 마이그레이션 파일 생성

파일명 규칙: `{timestamp}_{description}.sql`
예: `20260317120000_create_payment_table.sql`

```sql
-- Migration: {description}
-- Created: {date}

-- Up
{CREATE TABLE / ALTER TABLE / CREATE INDEX 등}

-- RLS 정책 (해당 시)
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table}_select_own"
  ON {table}
  FOR SELECT
  USING (account_id = auth.uid());

CREATE POLICY "{table}_insert_own"
  ON {table}
  FOR INSERT
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "{table}_update_own"
  ON {table}
  FOR UPDATE
  USING (account_id = auth.uid());

CREATE POLICY "{table}_delete_own"
  ON {table}
  FOR DELETE
  USING (account_id = auth.uid());
```

### 4. RLS 정책 패턴

| 도메인 | 정책 패턴 |
|--------|----------|
| Card (Master) | 모든 인증 사용자 SELECT 허용, INSERT/UPDATE/DELETE는 admin만 |
| Account | 본인 데이터만 CRUD |
| UserCard | 본인 데이터만 CRUD (account_id = auth.uid()) |
| Ledger | 본인 데이터만 CRUD |
| Analytics | 본인 데이터만 SELECT |

관리자 정책:
```sql
CREATE POLICY "{table}_admin_all"
  ON {table}
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account
      WHERE account.account_id = auth.uid()
      AND account.is_admin = true
    )
  );
```

### 5. 체크리스트

마이그레이션 생성 후 확인:
- [ ] FK 참조 테이블이 먼저 생성되었는가?
- [ ] ENUM 타입이 먼저 정의되었는가?
- [ ] NOT NULL 컬럼에 DEFAULT가 있는가? (기존 데이터 호환)
- [ ] 인덱스명이 고유한가?
- [ ] RLS가 활성화되었는가?
- [ ] DB 설계 문서도 함께 업데이트했는가?

### 6. 실행

```bash
# 로컬 적용
supabase db reset

# 또는 개별 마이그레이션 적용
supabase migration up
```
