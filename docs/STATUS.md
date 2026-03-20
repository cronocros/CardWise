# CardWise - Project Status

> 최종 갱신: 2026-03-20  
> 활성 브랜치: `codex/integration-phase1`

---

## 1. 시스템 현황 (현재 기준)

| 구성요소 | 방식 | 상태 |
|---------|------|------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui | ✅ 로컬 실행 중 (:3000) |
| Backend | Spring Boot 3.x (Kotlin), Hexagonal Architecture | ✅ 로컬 실행 중 (:8080) |
| Database | Supabase PostgreSQL (원격, 서비스 롤 키 기반) | ✅ 연결됨 |
| Auth | Supabase Auth (JWT) | ✅ 로그인/가입/미들웨어 연동 완료 |
| Cache | Docker Redis (로컬) / Upstash (운영 예정) | 🔶 로컬 only |
| 마이그레이션 | `supabase/migrations/` 파일 기반 | ✅ 원격 적용 완료 (4개 파일 모두 적용) |
| 배포 | Vercel (FE 예정) + Cloud Run (BE 예정) | ❌ 미배포 (로컬 수준) |

---

## 2. 기능 구현 현황 요약

> 전체 기능 대조표: [`docs/specs/feature-matrix.md`](specs/feature-matrix.md)

| 기능 | 완료율 | 핵심 갭 |
|------|--------|---------|
| AUTH | 95% | 로그인/가입/JWT 연동 완성, 소셜 로그인 미구현 |
| F1 카드 관리 | 90% | CRUD API + 등록 화면 완성 |
| F2 가계부 수동입력 | 70% | 기본 저장 완성, card_benefit 자동매칭 미완 |
| F3 인박스 | 95% | 거의 완성 |
| F4 실적 관리 | 90% | 거의 완성 |
| F5 혜택 검색 | 95% | 거의 완성 |
| F6 바우처 관리 | 95% | 만료 알림 스케줄러 완성 |
| F7 알림 | 95% | 그룹 기능 연동 완성 |
| F8 대시보드 | 95% | 사용자 소비 대시보드로 교체 완료 |
| F12 그룹 가계부 | 95% | 거의 완성 |

---

## 3. 라우팅 구조 (현재 기준)

### 사용자 기능 라우트 (CardWise 제품)

| 경로 | 기능 | 상태 |
|------|------|------|
| `/login` | 로그인/가입 | ✅ |
| `/dashboard` | F8 소비 대시보드 (월간 요약, 카드별, 카테고리) | ✅ |
| `/cards` | F1 카드 관리 | ✅ |
| `/cards/register` | 카드 등록 | ✅ |
| `/ledger` | F2/F3 가계부 허브 | ✅ |
| `/inbox` | F3 인박스 | ✅ |
| `/adjustments` | F3 결제 보정 | ✅ |
| `/performance/[id]` | F4 실적 관리 | ✅ |
| `/benefits` | F5 혜택 검색 | ✅ |
| `/benefits/cards/[id]` | 카드별 혜택 상세 | ✅ |
| `/vouchers` | F6 바우처 관리 | ✅ |
| `/notifications` | F7 알림 | ✅ |
| `/settings` | 사용자 설정 | ✅ |
| `/settings/notifications` | 알림 설정 | ✅ |
| `/groups` | F12 그룹 가계부 | ✅ |
| `/groups/[id]` | 그룹 상세 | ✅ |
| `/dashboard/tags` | 태그 통계 | ✅ |
| `/dashboard/tags/cross` | 태그 교차분석 | ✅ |

### 개발자 전용 라우트 (CardWise 제품 기능이 아님)

> ⚠️ 아래 경로는 **CardWise 제품 기능이 아닙니다.**  
> 개발자가 AI 에이전트 상태와 Human-in-the-Loop 대기 큐를 모니터링하는 **내부 OPS 도구**입니다.

| 경로 | 용도 |
|------|------|
| `/ops/live` | AI 에이전트 모니터링 + Human-in-the-Loop 대기 큐 뷰어 |

---

## 4. 아키텍처 준수 현황

### Backend (Spring Boot - Hexagonal)

| 원칙 | 상태 | 비고 |
|------|------|------|
| 모듈 분리 (Bounded Context) | ✅ OK | card, benefit, ledger, group, notification, performance, voucher, analytics |
| Port/Adapter 구조 | ✅ OK | api / application / infrastructure 3-layer 준수 |
| NamedParameterJdbcTemplate (Supabase) | ✅ OK | JPA ORM 없이 직접 SQL 사용 |
| @Transactional 범위 | ✅ OK | 서비스 레이어에서 적절히 적용 |
| 인증/인가 (JWT) | ✅ OK | SecurityConfig + 프론트 프록시 JWT 전달 연동 |
| Redis 캐시 무효화 | 🔶 PARTIAL | 설계는 있으나 실구현 검증 필요 |

### Frontend (Next.js - BFF Pattern)

| 원칙 | 상태 | 비고 |
|------|------|------|
| Supabase Auth 미들웨어 | ✅ OK | 비로그인 시 `/login` 리디렉션 |
| 백엔드 JWT 전달 | ✅ OK | `backend-proxy.ts`에서 Authorization + X-Account-Id 자동 주입 |
| `NEXT_PUBLIC_` 접두사 금지 | ✅ OK | `.env.local` 기준 준수 |
| Supabase 클라이언트 서버사이드 | ✅ OK | `createClient` 서버 전용 |
| Zod 입력 검증 | 🔶 PARTIAL | 일부 폼에만 적용됨 |

---

## 5. 소스코드 진단 (리팩토링 필요 항목)

### 즉시 수정 필요

1. **`NotificationService.createNotificationIfAccountExists`** — 내부에서 accountId를 email처럼 찾는 로직 오사용 가능성 존재

### 구조 개선 권고

2. **`GroupService`** — NotificationService를 직접 호출하는 방식 → 이벤트 기반(`@ApplicationEventPublisher`)으로 전환 권고
3. **에러 핸들링 일관성** — 일부 API Route에서 try-catch 누락 또는 불일치 응답 포맷
4. **F2 가계부** — card_benefit 자동매칭 미완성

---

## 6. 빠른 접속 URL (로컬 개발 기준)

### 사용자 기능

| 서비스 | URL |
|--------|-----|
| 로그인 | http://localhost:3000/login |
| 소비 대시보드 | http://localhost:3000/dashboard |
| 혜택 검색 | http://localhost:3000/benefits |
| 그룹 허브 | http://localhost:3000/groups |
| 알림 센터 | http://localhost:3000/notifications |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### 개발자 도구 (OPS - 제품 기능 아님)

| 서비스 | URL | 비고 |
|--------|-----|------|
| **라이브 대시보드** | http://localhost:3000/ops/live | AI 에이전트 모니터링, 개발자 전용 |

---

## 7. 다음 우선순위

1. **AUTH 소셜 로그인** — Google/Kakao OAuth 연동
2. **Vercel + Cloud Run 배포** — 환경 변수 세팅 및 CI/CD 파이프라인 구성
3. **Redis 기능 검증** — Rate Limiting, 캐시 무효화 로직 운영환경 테스트
4. **F2 가계부 card_benefit 자동매칭** — 결제 입력 시 혜택 자동 연결

---

## 8. 관련 문서

| 문서 | 경로 |
|------|------|
| 기능 명세 | `docs/requirements/functional-requirements.md` |
| **기능 대조표 (Feature Matrix)** | `docs/specs/feature-matrix.md` |
| 시스템 아키텍처 | `docs/architecture/system-architecture.md` |
| 애플리케이션 아키텍처 | `docs/architecture/application-architecture.md` |
| 프론트엔드 아키텍처 | `docs/architecture/frontend-architecture.md` |
| 인증 설계 | `docs/architecture/auth-design.md` |
| DB 스키마 | `docs/database/schema-design.md` |
| 디자인 시스템 | `docs/design/design-system.md` |
| 아카이브 (이전 이슈) | `docs/archive/` |
