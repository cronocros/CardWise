# CLAUDE.md — CardWise

한국 신용카드/체크카드 혜택 관리 플랫폼.

## 현재 상태

**Phase 0: 설계 완료, 구현 대기**
- 설계 문서 전체 작성 및 교차 검증 완료
- 사용자가 구현을 요청하기 전까지 코드 작성 금지
- 상세 현황: `docs/STATUS.md`

## 문서 구조

```
docs/
├── README.md                        프로젝트 개요 (개념도)
├── STATUS.md                        현재 상태 / LLM 인수인계
├── overview/tech-stack.md           기술 스택
├── architecture/
│   ├── system-architecture.md       인프라/배포
│   ├── application-architecture.md  DDD/모듈/이벤트
│   ├── frontend-architecture.md     프론트엔드
│   └── auth-design.md               인증/OAuth/계정 관리
├── planning/
│   └── mvp-scope.md                 MVP 범위 + 구현 우선순위 + 오버엔지니어링 판정
├── requirements/
│   ├── functional-requirements.md   기능 요구사항 + 프로세스 흐름
│   └── non-functional-requirements.md
├── database/
│   ├── schema-design.md             ERD + 도메인 스키마
│   └── data-dictionary.md           컬럼 상세 명세
├── design/
│   └── design-system.md             디자인 시스템 (컬러/타이포/컴포넌트)
├── testing/
│   └── test-strategy.md             테스트 전략 (단위/통합/E2E/성능/보안)
├── risk/
│   └── risk-register.md             리스크 등록부 + 대응 전략
├── api/
│   └── api-design.md                REST API 설계 원칙 + 엔드포인트 명세
├── deployment/
│   └── deployment-guide.md          CI/CD + 배포 절차 + 롤백
├── monitoring/
│   └── observability.md             로깅/메트릭/알림/SLA/Runbook
├── specs/                           기능별 상세 기획서 (화면 명세, AC, 에러 시나리오)
├── prompts/
│   ├── ui-design-prompts.md         AI 도구용 UI 디자인 프롬프트 (영문)
│   ├── design-quick-prompts.md      AI 디자인 프롬프트 간략 버전
│   └── llm-context-prompt.md        범용 LLM 인수인계 시스템 프롬프트
├── archive/
│   └── eda-kafka-design.md          EDA/Kafka (Phase 2용)
└── _legacy/                         이전 버전 문서 (참고용)
```

## Tech Stack

- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Spring Boot (Kotlin) + Hexagonal Architecture
- DB: Supabase PostgreSQL (35 tables, 19 ENUMs)
- Auth: Supabase Auth (JWT)
- Cache: Redis (로컬: Docker / 스테이징·운영: Upstash)
- 배포: Vercel (FE) + Cloud Run (BE)

## Commands

```bash
# Frontend (Bun)
cd frontend && bun install
bun dev           # localhost:3000

# Backend (Gradle)
cd backend && ./gradlew build
./gradlew bootRun # localhost:8080

# Database
supabase start    # 로컬 Supabase
supabase db reset # 마이그레이션 + 시드 적용

# Redis (Docker - 로컬 개발용)
docker compose up -d redis    # localhost:6379 시작
docker compose down           # 중지
docker exec cardwise-redis redis-cli ping  # 상태 확인
```

## Architecture

- Modular Monolith (MSA-ready)
- 9 Bounded Contexts: Card, UserCard, Ledger, Group, Benefit, Crawler, EmailParser, Notification, Analytics
- Hexagonal: Domain -> Port -> Adapter
- Module communication: Spring @EventListener (in-process)
- Kafka/Outbox: Phase 2에서 도입 (docs/archive/ 참조)
- **API 호출 규칙 (BFF)**: Client Component는 반드시 Next.js API Route (`/api/*`) 경유. Server Component는 읽기 전용만 Spring Boot 직접 호출 허용. 쓰기/부수효과는 항상 `/api/*` 경유 (상세: docs/architecture/frontend-architecture.md)

## 스킬

| 명령 | 용도 |
|------|------|
| /cardwise-spec | 기능 명세 작성 |
| /cardwise-feature-team | 서브에이전트 팀 구현 |
| /cardwise-review-team | 코드 리뷰 (3관점) |
| /cardwise-seed | 시드 데이터 SQL |
| /cardwise-migration | DB 마이그레이션 + RLS |
| /cardwise-prompt | AI 프롬프트 설계 |
| /cardwise-component | UI 컴포넌트 생성 |
| /cardwise-security | 보안 검토 |
| /cardwise-handoff | 상태 기록/인수인계 |

## Workflow Rules

- **구현 금지**: 사용자 명시적 요청 전까지 코드 작성 불가
- **스펙 먼저**: 구현 전 `/cardwise-spec`으로 명세 작성
- **Git Push 금지**: 사용자가 명시적으로 "깃에 푸시해줘" 등으로 직접 지시하지 않는 한 git push 절대 금지
- **Local Commit 자율**: 작업 완료 후 로컬 커밋은 Claude 자체 판단으로 수행 가능
- **설계 동기화**: DB 변경 시 schema-design.md + data-dictionary.md 모두 업데이트

## Agent Team Roles

`/cardwise-feature-team`, `/cardwise-review-team` 등 에이전트팀 스킬 사용 시:
- **오케스트레이터 (Claude 본인)**: 20년차 시니어 아키텍트 & 기획자. 전체 설계 검토, 작업 분배, 품질 게이트, 아키텍처 일관성 보장
- **서브에이전트**: 고급 개발자 / 시니어 기획자. 구현·문서 작성·세부 설계 담당. 오케스트레이터 지시에 따라 독립 작업 수행

## Naming Convention

- PostgreSQL: `snake_case` (테이블, 컬럼, enum)
- Kotlin: `camelCase` (변수, 함수), `PascalCase` (클래스)
- TypeScript: `camelCase` (변수), `PascalCase` (컴포넌트)
- 파일명: `kebab-case` (프론트엔드), 클래스명 기반 (백엔드)

## Security

- Supabase RLS: 모든 테이블에 정책 설계 (MVP에서는 서비스 롤 + 애플리케이션 레벨 account_id 필터 사용, 향후 유저 JWT 기반 RLS 강제 전환 가능)
- API Key: 서버 사이드 전용 (`NEXT_PUBLIC_` 접두사 금지)
- 입력 검증: Bean Validation (BE) + Zod (FE)
- Rate Limiting: Redis Sliding Window
- JWT: Access Token 메모리(60분 만료), Refresh Token httpOnly Cookie(7일, Rotation)

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # 서버 전용

# Backend
SPRING_DATASOURCE_URL=
SUPABASE_JWT_SECRET=

# AI
ANTHROPIC_API_KEY=               # 서버 전용

# Redis - 로컬 개발: Docker (localhost:6379)
# .env.local
REDIS_MODE=local                 # local | upstash
REDIS_URL=redis://localhost:6379

# Redis - 스테이징/운영: Upstash
# .env (스테이징/운영만)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```
