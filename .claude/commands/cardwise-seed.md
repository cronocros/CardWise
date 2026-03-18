# cardwise-seed: 시드 데이터 SQL 생성

Supabase PostgreSQL에 카드/혜택/가맹점 등 시드 데이터를 삽입하는 SQL을 생성한다.

## 사용 시점

- 개발/테스트 환경 초기 데이터 필요 시
- 새 도메인 테이블 추가 후 테스트 데이터 필요 시
- 사용자가 "시드", "테스트 데이터", "초기 데이터" 등을 언급할 때

## 프로세스

### 1. DB 스키마 확인

`docs/superpowers/specs/2026-03-17-cardwise-database.md`를 읽어 현재 스키마를 파악한다.

### 2. 시드 대상 결정

사용자에게 어떤 도메인의 시드가 필요한지 확인:

| 도메인 | 시드 내용 | 의존성 |
|--------|----------|--------|
| Card | 카드사, 카드, 실적구간, 혜택, 바우처 | 없음 (최상위) |
| Category/Merchant | 업종 카테고리, 가맹점, 별칭 | 없음 |
| Account | 테스트 계정 | 없음 |
| UserCard | 사용자 카드 등록, 실적, 바우처 인스턴스 | Card + Account |
| Ledger | 결제, 품목, 태그 | UserCard + Merchant |
| Analytics | 월간 요약 | 전체 |

### 3. SQL 생성 규칙

- 삽입 순서: FK 의존성 순서 준수
- `GENERATED ALWAYS AS IDENTITY` 컬럼은 INSERT에서 제외
- account는 UUID 직접 지정 (Supabase Auth와 연동 테스트용)
- ENUM 값은 정의된 타입만 사용
- 금액은 BIGINT (KRW=원, USD=센트)
- 해외결제 시드 포함 시 exchange_rate_snapshot도 함께 생성
- `ON CONFLICT DO NOTHING` 추가 (멱등성)

### 4. 기본 시드셋

요청이 없으면 아래 기본셋을 생성:

```
카드사 3개: 삼성카드, 신한카드, 현대카드
카드 5개: 각 카드사 대표 카드 1~2개
실적구간: 카드별 3개 (30만/50만/100만)
카테고리: 대분류 5개 + 소분류 10개
가맹점: 10개 (스타벅스, 이마트, 쿠팡, 배달의민족 등)
가맹점별칭: 가맹점당 2~3개 (명세서 표기 변형)
혜택: 카드당 3~5개 (DISCOUNT, POINT, CASHBACK 등)
바우처: 카드당 1~2개 (라운지, 쿠폰 등)
```

### 5. 출력

SQL 파일을 `supabase/seed.sql` (또는 지정 경로)에 저장한다.
트랜잭션으로 감싸서 원자적 실행을 보장한다:

```sql
BEGIN;
-- 시드 데이터
COMMIT;
```

실행 방법도 안내:
```bash
# Supabase CLI
supabase db reset  # seed.sql 자동 실행

# 또는 직접 실행
psql $DATABASE_URL -f supabase/seed.sql
```
