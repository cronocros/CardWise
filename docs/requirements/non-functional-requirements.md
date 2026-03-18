# CardWise - Non-Functional Requirements

---

## 성능 (Performance)

| 항목 | 기준 | 비고 |
|------|------|------|
| 일반 API 응답 | < 200ms (p95) | CRUD 엔드포인트 |
| 검색 API 응답 | < 500ms (p95) | 가맹점/혜택 검색 (fuzzy match 포함) |
| AI 추천 응답 | < 3s (p95) | Claude API 호출 포함, 캐시 hit 시 < 100ms |
| 대시보드 로딩 | < 1s (첫 렌더) | SSR + Streaming, 병렬 데이터 로드 |
| 페이지 전환 | < 300ms | Next.js prefetch 활용 |
| DB 쿼리 | < 50ms (p95) | 인덱스 활용, N+1 방지 |

---

## 가용성 (Availability)

| 항목 | 기준 | 비고 |
|------|------|------|
| 서비스 가용성 | 99.5% | Managed Service 기반 (Vercel, Supabase, Upstash) |
| 계획된 다운타임 | 월 30분 이내 | DB 마이그레이션 시 |
| 장애 복구 | < 30분 | 서버리스 자동 복구 |

---

## 확장성 (Scalability)

| Phase | 동시 사용자 | 전략 |
|-------|-----------|------|
| MVP | 100명 | 단일 백엔드 인스턴스 |
| Growth | 1,000명 | 수평 확장 (stateless BE + Redis 세션) |
| Scale | 10,000+ | MSA 전환, Kafka 도입 |

---

## 보안 (Security)

| 항목 | 기준 |
|------|------|
| 인증 | Supabase Auth (JWT), Access Token 메모리 저장(60분), Refresh Token httpOnly 쿠키(7일) |
| 인가 | Spring Security + account_id 기반 애플리케이션 레벨 인가 (MVP), RLS 정책은 향후 유저 JWT 기반 강제 전환 가능 |
| 데이터 보호 | HTTPS 전 구간, 환경변수 관리 |
| API Key | 서버 사이드 전용, 클라이언트 번들 노출 금지 |
| 입력 검증 | Bean Validation (BE) + Zod (FE) |
| Rate Limiting | Redis Sliding Window (엔드포인트별 차등) |
| OWASP | Top 10 대응 (SQL Injection, XSS, CSRF 등) |

### Rate Limit 기준

| 엔드포인트 | FREE | PREMIUM |
|-----------|------|---------|
| /api/recommend/* (AI) | 30/분 | 100/분 |
| /api/payment/* | 60/분 | 60/분 |
| /api/auth/* | 10/분 | 10/분 |
| 기타 API | 120/분 | 120/분 |

---

## 데이터 (Data)

| 항목 | 기준 |
|------|------|
| 결제 이력 | 영구 보존 (soft delete) |
| 분석 데이터 | 2년 보존 후 아카이빙 |
| 바우처 로그 | 영구 보존 (감사 추적) |
| 크롤링 로그 | 6개월 보존 |
| 백업 | Supabase 자동 (일일, point-in-time recovery) |

---

## 접근성 (Accessibility)

| 항목 | 기준 |
|------|------|
| WCAG | AA 레벨 준수 |
| 키보드 | 전체 키보드 네비게이션 |
| 스크린 리더 | ARIA 속성 적용 |
| 색상 대비 | 4.5:1 이상 |
| 반응형 | 모바일 우선 (320px ~ 1440px) |

---

## 국제화 (i18n)

| 항목 | 기준 |
|------|------|
| MVP 언어 | 한국어 전용 |
| 통화 | KRW 기본 + 해외결제 10개 통화 지원 |
| 시간대 | Asia/Seoul (KST) 기본 |
| 추후 | 다국어 대응 구조는 유지 (하드코딩 금지) |

---

## 모니터링 (Observability)

| 항목 | 도구 | 비고 |
|------|------|------|
| Frontend 성능 | Vercel Analytics | Core Web Vitals |
| Backend 로그 | Spring Boot Actuator + 구조화 로그 | JSON format |
| DB 모니터링 | Supabase Dashboard | 쿼리 성능, 커넥션 |
| 캐시 모니터링 | Upstash Console | hit rate, 메모리 |
| 에러 트래킹 | Sentry (planned) | Frontend + Backend |
