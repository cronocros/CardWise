# CardWise 아키텍처·요구사항 정합성 체크리스트

최종 갱신: 2026-03-19

## 감사 범위

- `docs/architecture/system-architecture.md`
- `docs/architecture/application-architecture.md`
- `docs/architecture/frontend-architecture.md`
- `docs/requirements/functional-requirements.md`
- `docs/planning/mvp-scope.md`
- `docs/specs/F1-card-management.md`
- `docs/specs/F4-performance-tracking.md`
- `docs/specs/F8-dashboard.md`
- `docs/specs/TAG-system.md`
- `docs/api/api-design.md`

## 체크리스트

| 영역 | 기준 문서 | 상태 | 근거 코드/문서 | 조치 |
|---|---|---|---|---|
| 시스템 구성은 Next.js + Spring Boot + Supabase + Redis 중심의 모듈형 모놀리스여야 한다 | system-architecture, application-architecture | PARTIAL | `frontend/`, `backend/`, `supabase/`, `docker-compose.yml` | Next.js, Spring Boot, Supabase 경로는 맞다. Redis/Rate Limit/캐시 실장까지는 아직 연결되지 않았다. |
| 백엔드는 헥사고날/모듈형 구조를 유지해야 한다 | application-architecture | PARTIAL | `backend/src/main/kotlin/com/cardwise/{common,ledger,performance,voucher,analytics}` | Ledger, Performance, Voucher, Analytics는 분리돼 있다. Auth, Card, Benefit, Group, Notification 모듈은 아직 없다. |
| API는 `/api/v1` + `ApiResponse(data, meta)` 계약을 따라야 한다 | api-design | PASS | `backend/src/main/kotlin/com/cardwise/common/api/ApiResponse.kt`, `backend/src/main/kotlin/com/cardwise/**/api/*Controller.kt` | 현행 API는 공통 응답 래퍼를 사용한다. |
| 계정 경계는 인증 토큰 기반으로 강제되어야 한다 | auth-design, application-architecture | FAIL | `backend/src/main/kotlin/com/cardwise/common/config/SecurityConfig.kt`, `backend/src/main/kotlin/com/cardwise/common/web/RequestAccountIdResolver.kt` | 현재는 모든 요청을 허용하고 개발용 기본 account_id fallback을 쓴다. 아키텍처 요구사항과 직접 충돌한다. |
| 프론트는 모바일 우선 앱 IA(`/dashboard`, `/cards`, `/ledger`, `/benefits`, `/settings`)를 제공해야 한다 | frontend-architecture, design-system | PASS | `frontend/src/app/dashboard/page.tsx`, `frontend/src/app/cards/page.tsx`, `frontend/src/app/ledger/page.tsx`, `frontend/src/app/benefits/page.tsx`, `frontend/src/app/settings/page.tsx` | 앱 우선 구조와 하단 탭바는 반영됐다. |
| 프론트는 BFF 패턴을 통해 브라우저에서 백엔드로 붙어야 한다 | frontend-architecture | PARTIAL | `frontend/src/app/api/**/route.ts`, `frontend/src/lib/backend-proxy.ts` | BFF 라우트는 준비됐다. 다만 일부 서버 컴포넌트는 백엔드를 직접 호출한다. |
| 공개 라우트/인증 라우트/미들웨어 경계가 있어야 한다 | frontend-architecture | FAIL | `frontend/src/app/` 구조 전반 | `login`, `signup`, `landing`, `middleware.ts`가 없다. |
| F2/F3 인박스/보정 흐름이 동작해야 한다 | functional-requirements, F2/F3 specs | PASS | `backend/src/main/kotlin/com/cardwise/ledger/**`, `frontend/src/app/inbox/page.tsx`, `frontend/src/app/adjustments/page.tsx` | 현재 구현 범위 안에서 조회와 조정 흐름이 연결돼 있다. |
| F4 실적 추적은 카드별 실적/구간/유예/특별기간을 보여야 한다 | F4-performance-tracking | PASS | `backend/src/main/kotlin/com/cardwise/performance/**`, `frontend/src/app/performance/[userCardId]/page.tsx` | 명세 핵심 항목이 구현돼 있다. |
| F6 바우처는 활성/만료 임박/해금 상태와 이력을 보여야 한다 | F6-voucher-management | PASS | `backend/src/main/kotlin/com/cardwise/voucher/**`, `frontend/src/app/vouchers/page.tsx`, `frontend/src/components/vouchers-client.tsx` | 현재 구현 범위에서 충족한다. |
| F8 개인 대시보드는 월간 요약, 카드별, 카테고리, 태그, 추이를 제공해야 한다 | F8-dashboard | PASS | `frontend/src/app/dashboard/page.tsx`, `backend/src/main/kotlin/com/cardwise/analytics/**` | 이번 감사 패스에서 집계 API와 화면을 맞췄다. |
| F8 태그 통계/교차 분석 표면이 있어야 한다 | F8-dashboard, TAG-system | PASS | `frontend/src/app/dashboard/tags/page.tsx`, `frontend/src/app/dashboard/tags/cross/page.tsx`, `backend/src/main/kotlin/com/cardwise/analytics/**` | 태그 통계와 교차 분석 기본 표면 및 API를 추가했다. |
| F8 그룹 대시보드와 멤버 비교는 그룹 모듈과 연결돼야 한다 | F8-dashboard, F12-group-ledger | DEFERRED | 문서 기준만 존재 | 그룹/멤버 통계는 아직 미구현이다. |
| F1 카드 관리는 등록/목록/상세/검색/별칭 관리가 있어야 한다 | F1-card-management | PARTIAL | `frontend/src/app/cards/page.tsx` | 조회 중심 화면은 있다. 실제 카드 등록/관리 백엔드와 폼은 아직 없다. |
| F5 혜택 검색은 실제 조건 검색/추천 API와 연결되어야 한다 | F5-benefit-search | PARTIAL | `frontend/src/app/benefits/page.tsx` | 프론트 표면은 있지만, 실제 혜택 검색 백엔드는 없다. |
| F7 알림은 만료/실적 리마인더 경로가 있어야 한다 | F7-notification | FAIL | 문서 기준만 존재 | 구현 없음. |
| F12 그룹 가계부는 그룹/멤버/공유결제/거버넌스가 있어야 한다 | F12-group-ledger | FAIL | 문서 기준만 존재 | 구현 없음. |
| 상태 문서와 작업 대시보드는 현재 구현 상태를 반영해야 한다 | STATUS, ops/dashboard | PASS | `docs/STATUS.md`, `ops/dashboard/work-items.json` | 이번 감사 패스에서 메타 정합성을 다시 맞춘다. |

## 이번 감사에서 바로 맞춘 항목

- F8 대시보드 집계 API를 실제 코드에 추가했다.
  - `/api/v1/dashboard/monthly`
  - `/api/v1/dashboard/cards`
  - `/api/v1/dashboard/categories`
  - `/api/v1/dashboard/trends`
  - `/api/v1/tags/stats`
  - `/api/v1/tags/stats/cross`
- 프론트 대시보드 홈이 월간 요약, 카드별 집계, 카테고리, 태그, 추이를 함께 읽도록 보강됐다.
- `/dashboard/tags`, `/dashboard/tags/cross`를 추가해 F8/TAG 명세의 더보기/교차 분석 진입면을 구현했다.
- `docs/api/api-design.md`, `docs/STATUS.md`, `ops/dashboard/work-items.json`를 현재 구현 기준으로 갱신했다.

## 남은 핵심 갭

1. 인증/인가
   - 현재 보안 설정은 설계 문서 기준에 미달한다.
   - Supabase 세션 검증, 미들웨어, account_id 해석을 실제 토큰 기반으로 바꿔야 한다.
2. 그룹 가계부
   - F12와 F8 그룹 대시보드가 아직 비어 있다.
3. 혜택 검색 백엔드
   - 현재는 앱 표면만 있고 실제 검색/추천 API가 없다.
4. 알림
   - 바우처 만료/실적 리마인더 경로가 없다.
5. 운영 인프라
   - Redis 캐시, rate limiting, CORS, 관측성 구성은 문서 대비 미완성이다.
