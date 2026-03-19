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
| Auth | Supabase Auth (JWT) | ❌ **미연결** — `SecurityConfig`가 모든 요청 허용 상태 |
| Cache | Docker Redis (로컬) / Upstash (운영 예정) | 🔶 로컬 only |
| 마이그레이션 | `supabase/migrations/` 파일 기반, psycopg 수동 적용 | 🔶 일부 미적용 (아래 참조) |
| 배포 | Vercel (FE 예정) + Cloud Run (BE 예정) | ❌ 미배포 (로컬 수준) |

### 미적용 마이그레이션

```
supabase/migrations/20260320100000_add_group_notification_settings.sql
→ notification_setting 테이블에 group_invite_alert, group_activity_alert 컬럼 추가
→ 원격 DB에 아직 미적용 (psycopg 스크립트로 별도 적용 필요)
```

---

## 2. 기능 구현 현황 요약

> 전체 기능 대조표: [`docs/specs/feature-matrix.md`](specs/feature-matrix.md)

| 기능 | 완료율 | 핵심 갭 |
|------|--------|---------|
| AUTH | 10% | 실인증 미구현, 개발용 fallback accountId 사용 중 |
| F1 카드 관리 | 40% | 조회 완성, 등록/수정/삭제 CRUD 미구현 |
| F2 가계부 수동입력 | 70% | 기본 저장 완성, 혜택 자동매칭 미완 |
| F3 인박스 | 95% | 거의 완성 |
| F4 실적 관리 | 90% | 거의 완성 |
| F5 혜택 검색 | 95% | 거의 완성 |
| F6 바우처 관리 | 85% | 만료 알림 스케줄러 미구현 |
| F7 알림 | 80% | 그룹 알림 연동 완성, 스케줄러 배치 미구현 |
| F8 대시보드 | 90% | 거의 완성 |
| F12 그룹 가계부 | 95% | 거의 완성 |

---

## 3. 아키텍처 준수 현황

### Backend (Spring Boot - Hexagonal)

| 원칙 | 상태 | 비고 |
|------|------|------|
| 모듈 분리 (Bounded Context) | ✅ OK | card, benefit, ledger, group, notification, performance, voucher, analytics |
| Port/Adapter 구조 | ✅ OK | api / application / infrastructure 3-layer 준수 |
| NamedParameterJdbcTemplate (Supabase) | ✅ OK | JPA ORM 없이 직접 SQL 사용 |
| @Transactional 범위 | ✅ OK | 서비스 레이어에서 적절히 적용 |
| 인증/인가 (JWT) | ❌ NOT OK | SecurityConfig 미실장, accountId fallback 사용 중 |
| Redis 캐시 무효화 | 🔶 PARTIAL | 설계는 있으나 실구현 검증 필요 |

### Frontend (Next.js - BFF Pattern)

| 원칙 | 상태 | 비고 |
|------|------|------|
| Server Component 읽기 / API Route 쓰기 | 🔶 PARTIAL | 일부 경로에서 혼용 존재 |
| `NEXT_PUBLIC_` 접두사 금지 (서버 전용 키) | ✅ OK | `.env.local` 기준 준수 |
| Supabase 클라이언트 서버사이드 사용 | ✅ OK | `createClient` 서버 전용 |
| Zod 입력 검증 | 🔶 PARTIAL | 일부 폼에만 적용됨 |

### Database (Supabase PostgreSQL)

| 항목 | 상태 | 비고 |
|------|------|------|
| 마이그레이션 파일 관리 | ✅ OK | `supabase/migrations/` 기반 |
| Supabase 서비스 롤 키 접속 | ✅ OK | 백엔드에서 서비스 롤로만 DB 접근 |
| RLS 설정 | 🔶 PARTIAL | 설계 완성, 운영 적용은 애플리케이션 레벨 인가 우선 |
| Connection Pooler (포트 6543) | ✅ OK | `application.yml` 기준 확인됨 |

---

## 4. 소스코드 진단 (리팩토링 필요 항목)

### 즉시 수정 필요

1. **`SecurityConfig`** — 모든 요청 허용 상태. JWT 검증 필터 실장 전까지 인증 우회됨
2. **`RequestAccountIdResolver`** — 하드코딩된 fallback accountId (`"00000000-0000-0000-0000-000000000001"` 등) 사용 중
3. **`NotificationService.createNotificationIfAccountExists`** — 내부에서 accountId를 email처럼 찾는 로직 오사용 가능성 존재 (GroupService에서 직접 호출하는 로직과 중복)

### 구조 개선 권고

4. **`GroupService`** — NotificationService를 직접 호출하는 방식. 이벤트 기반(`@ApplicationEventPublisher`)으로 전환하면 결합도 낮아짐
5. **프론트 BFF 혼용** — 일부 페이지에서 Server Component가 Spring Boot를 직접 호출함. API Route 경유로 일관성 개선 필요
6. **에러 핸들링 일관성** — 일부 API Route에서 try-catch 누락 또는 불일치 응답 포맷 사용됨

---

## 5. 빠른 접속 URL (로컬 개발 기준)

| 서비스 | URL |
|--------|-----|
| 앱 홈 | http://localhost:3000/dashboard |
| 그룹 허브 | http://localhost:3000/groups |
| 알림 센터 | http://localhost:3000/notifications |
| 알림 설정 | http://localhost:3000/settings/notifications |
| 혜택 검색 | http://localhost:3000/benefits |
| 태그 통계 | http://localhost:3000/dashboard/tags |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |

---

## 6. 다음 우선순위

1. **AUTH 실구현** (가장 높음) — Supabase JWT → Spring Security 연결
2. **원격 DB 마이그레이션 적용** — `group_invite_alert`, `group_activity_alert` 컬럼 추가
3. **스케줄러 구현** — 바우처 만료 알림 (Daily), 실적 리마인더 (Monthly)
4. **F1 카드 CRUD 구현** — 카드 등록/수정/삭제
5. **Vercel + Cloud Run 배포** — 환경 변수 세팅 및 CI/CD 파이프라인

---

## 7. 관련 문서

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
