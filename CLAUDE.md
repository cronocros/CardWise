# CLAUDE.md — CardWise

한국 신용카드/체크카드 혜택 관리 플랫폼.

## 현재 상태

**Phase 1 구현 진행 중 (2026-03-20 기준)**
- 활성 브랜치: `codex/integration-phase1`
- 상세 현황: `docs/STATUS.md`
- 기능 대조표: `docs/specs/feature-matrix.md`

### 핵심 메모 (다음 LLM이 반드시 알아야 할 것)
- **인증 기초 연결 완료**: `SecurityConfig`에 JWT 검증 필터 및 CORS 연동 완료. `SUPABASE_JWT_ISSUER` 환경변수로 활성화 가능 (미설정 시 임시 fallback 동작). 프론트엔드의 실제 로그인 페이지 연동은 검증 대기 중.
- **자동 마이그레이션 스크립트(`apply_migrations.py`) 완성**: `20260320100000_add_group_notification_settings.sql` 등 원격 Supabase DB 반영 시 `DATABASE_URL` 등 환경변수를 가지고 스크립트 실행하여 적용 가능.
- **`SecurityConfig` 수정 시 주의**: JWT issuer-uri는 `SUPABASE_JWT_ISSUER` 환경 변수로 주입됨

---

## Tech Stack

| 계층 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Spring Boot 3.x (Kotlin), Hexagonal Architecture |
| DB | Supabase PostgreSQL (서비스 롤 키 접속, 포트 6543 Pooler) |
| Auth | Supabase Auth — JWT | ✅ DONE | 연동 및 미들웨어 처리 완료 |
| Cache | Docker Redis (로컬) / Upstash Redis (운영) |
| 배포 | Vercel (FE) + Cloud Run (BE) — 미배포 상태 |

---

## 문서 구조

```
docs/
├── README.md                    프로젝트 개요
├── STATUS.md                    ★ 현재 상태/LLM 인수인계 (이 파일 먼저 읽을 것)
├── specs/
│   ├── feature-matrix.md        ★ 기능 구현 대조표
│   ├── F1~F12, AUTH 상세 기획서
├── architecture/
│   ├── system-architecture.md   인프라/배포
│   ├── application-architecture.md  DDD/이벤트/모듈
│   ├── frontend-architecture.md     BFF 패턴 규칙
│   └── auth-design.md               Supabase Auth 설계
├── database/
│   ├── schema-design.md         ERD + 도메인 스키마
│   └── data-dictionary.md       컬럼 명세
├── requirements/
│   └── functional-requirements.md   기능 요구사항
├── archive/                     해결된 핸드오프, 구버전 문서 보관
└── _legacy/                     초기 버전 문서 (참고용만)
```

---

## Commands

```bash
# Frontend
cd frontend && bun install
bun dev           # localhost:3000

# Backend
cd backend && ./gradlew build
./gradlew bootRun  # localhost:8080
./gradlew classes  # 컴파일만 확인

# 타입 체크 (frontend)
npx tsc --noEmit

# Redis (로컬 개발 — Docker 필요)
docker compose up -d redis
docker exec cardwise-redis redis-cli ping

# DB 마이그레이션 (원격 Supabase — psycopg 사용)
# DATABASE_URL 환경변수 설정 후:
# python apply_migrations.py  (스크립트 필요 시 재작성)
```

---

## Architecture

- **Modular Monolith** (Hexagonal) — 9 Bounded Contexts
- `api/` → `application/` → `infrastructure/` 3-layer 준수
- DB: NamedParameterJdbcTemplate (JPA ORM 사용 안 함)
- 이벤트: Spring `@EventListener` (in-process), Kafka는 Phase 3
- **BFF 규칙**: Client Component는 반드시 Next.js `/api/*` Route 경유. Server Component는 읽기 전용만 Spring Boot 직접 호출 허용.

---

## API 구조 (Spring Boot)

```
GET/POST/PATCH/DELETE /api/v1/...

주요 컨트롤러:
  /api/v1/cards           - 카드 관리
  /api/v1/ledger          - 가계부 결제
  /api/v1/performance     - 실적 조회
  /api/v1/benefits        - 혜택 검색/추천
  /api/v1/vouchers        - 바우처 관리
  /api/v1/groups          - 그룹 가계부 (F12)
  /api/v1/notifications   - 알림 센터 (F7)
  /api/v1/dashboard       - 대시보드 집계

Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## Workflow Rules

- **Git Push 금지**: 사용자 명시 요청 없이 git push 절대 금지
- **Local Commit 자율**: 작업 완료 후 로컬 커밋은 자체 판단 수행 가능
- **스펙 먼저**: 신규 기능 구현 전 `/cardwise-spec`으로 명세 작성
- **설계 동기화**: DB 변경 시 `schema-design.md` + `data-dictionary.md` 동시 업데이트
- **마이그레이션 파일**: 반드시 `supabase/migrations/` 에 타임스탬프 기반 파일로 작성

---

## Naming Convention

| 대상 | 규칙 |
|------|------|
| PostgreSQL 테이블/컬럼 | `snake_case` |
| Kotlin 변수/함수 | `camelCase` |
| Kotlin 클래스 | `PascalCase` |
| TypeScript 변수 | `camelCase` |
| React 컴포넌트 | `PascalCase` |
| 파일명 (프론트) | `kebab-case` |
| 파일명 (백엔드) | 클래스명 기반 |

---

## Security

- **현재**: 모든 API 인증 없이 접근 가능 (MVP 개발용 임시 설정)
- **목표**: Supabase JWT → Spring Security ResourceServer 연결
- API Key: `NEXT_PUBLIC_` 접두사 절대 사용 금지
- Supabase 서비스 롤 키: 백엔드 서버용만, 절대 프론트엔드 노출 금지
- RLS: 설계 완성, 현재는 애플리케이션 레벨 `account_id` 필터 사용

---

## 스킬

| 명령 | 용도 |
|------|------|
| /cardwise-spec | 기능 명세 작성 |
| /cardwise-feature-team | 서브에이전트 팀 구현 |
| /cardwise-review-team | 코드 리뷰 (3관점) |
| /cardwise-seed | 시드 데이터 SQL |
| /cardwise-migration | DB 마이그레이션 + RLS |
| /cardwise-handoff | 상태 기록/인수인계 |

---

## Environment Variables

```
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BACKEND_BASE_URL=http://localhost:8080/api/v1

# Backend (application.yml 또는 환경변수)
SPRING_DATASOURCE_URL=jdbc:postgresql://db.xxx.supabase.co:6543/postgres
SUPABASE_JWT_ISSUER=https://xxx.supabase.co/auth/v1
REDIS_MODE=local          # local | upstash
REDIS_URL=redis://localhost:6379

# (운영 시 추가)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
