# cardwise-security: 보안 검토 체크리스트

새 코드에 대한 보안 검토를 수행한다. 각 항목을 체계적으로 확인하고 결과를 보고한다.

## 사용 시점

- 새 기능 구현 완료 후
- PR 생성 전 보안 점검
- 새 API 엔드포인트 추가 시
- DB 테이블 추가/변경 시
- 사용자가 "보안", "security", "검토" 등을 언급할 때

## 체크리스트

### 1. Supabase RLS (Row Level Security)

```
점검 대상: supabase/migrations/ 내 모든 CREATE TABLE
```

- [ ] 새 테이블에 `ENABLE ROW LEVEL SECURITY` 적용됨
- [ ] SELECT 정책: 본인 데이터만 조회 (`account_id = auth.uid()`)
- [ ] INSERT 정책: 본인 데이터만 삽입
- [ ] UPDATE 정책: 본인 데이터만 수정
- [ ] DELETE 정책: 본인 데이터만 삭제 (또는 soft delete만 허용)
- [ ] Master 데이터 (card, category 등): 인증 사용자 SELECT 허용, 관리자만 수정

### 2. API Key / Secret 노출

```
점검 대상: 전체 소스 코드
```

- [ ] ANTHROPIC_API_KEY가 서버 사이드에서만 사용됨
- [ ] SUPABASE_SERVICE_ROLE_KEY가 서버 사이드에서만 사용됨
- [ ] `NEXT_PUBLIC_` 접두사로 시작하는 변수에 민감 키 없음
- [ ] .env 파일이 .gitignore에 포함됨
- [ ] 하드코딩된 API 키/비밀번호 없음
- [ ] 클라이언트 번들에 서버 전용 코드 미포함 (Next.js server-only 패턴)

### 3. 입력 검증

```
점검 대상: Backend Controller / API Route
```

- [ ] 모든 API 엔드포인트에 Bean Validation 적용 (@Valid, @NotNull 등)
- [ ] 프론트엔드 입력에 Zod 스키마 검증
- [ ] 경로 파라미터 / 쿼리 파라미터 타입 검증
- [ ] 파일 업로드 시 크기/타입 제한
- [ ] JSON 요청 body 크기 제한

### 4. 인증/인가

```
점검 대상: Spring Security Config, Middleware
```

- [ ] 보호 라우트에 JwtAuthenticationFilter 적용
- [ ] API 엔드포인트별 인가 규칙 (일반 사용자 vs 관리자)
- [ ] JWT 만료 시간 적절 (Access: 15분, Refresh: 7일)
- [ ] Refresh Token 갱신 로직 안전 (httpOnly Cookie)

### 5. Rate Limiting

```
점검 대상: Redis 기반 Rate Limiter
```

- [ ] `/api/recommend/*` (AI 호출): 분당 30회 (FREE) / 100회 (PREMIUM)
- [ ] `/api/payment/*`: 분당 60회
- [ ] `/api/auth/*`: 분당 10회
- [ ] Rate limit 초과 시 429 응답 + Retry-After 헤더

### 6. SQL Injection / DB 보안

- [ ] Spring Data JPA 또는 Supabase client 사용 (raw SQL 지양)
- [ ] 동적 쿼리 사용 시 파라미터 바인딩
- [ ] DB 연결 문자열이 환경변수에서 로드

### 7. XSS / CSRF

- [ ] 사용자 입력 HTML 이스케이프 (React 기본 처리)
- [ ] `dangerouslySetInnerHTML` 미사용
- [ ] CSRF 토큰 적용 (해당 시)
- [ ] Content-Security-Policy 헤더 설정

### 8. 해외결제 관련

- [ ] exchange_rate_snapshot 조작 방지 (관리자만 생성)
- [ ] 환율 음수/0 방지 (CHECK constraint)
- [ ] original_amount 조작으로 krw_amount 왜곡 불가

## 보고 형식

```
## 보안 검토 결과

검토 일시: {date}
검토 범위: {파일 목록}

### 요약
- 전체: {N}개 항목 검토
- PASS: {N}개
- FAIL: {N}개
- N/A: {N}개

### FAIL 항목 (즉시 수정 필요)
| # | 카테고리 | 항목 | 위치 | 설명 |
|---|---------|------|------|------|

### 권장 개선 사항
| # | 항목 | 설명 |
|---|------|------|
```
