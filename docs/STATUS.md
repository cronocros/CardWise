# CardWise - Project Status & Handoff

> 이 문서는 LLM/AI 에이전트 또는 새로운 개발자가 프로젝트를 이어받을 때 참조하는 인수인계 문서이다.
> 최종 갱신 시 반드시 날짜와 변경 내용을 기록한다.

---

## 최종 갱신

- **날짜**: 2026-03-18
- **갱신자**: Claude (AI Assistant)
- **내용**: 다중통화 MVP 승격, 가족/그룹 공유 가계부 도메인 신설 (3 테이블, 2 ENUM), 태그 교차 분석 설계, Auth/OAuth 설계 보강, 기능별 상세 기획서 작성, 문서 구조 정리 (mvp-scope.md → planning/), API 테스팅(Swagger/SpringDoc) 문서화, Git 초기화

---

## 현재 Phase

**Phase 0: 설계 및 프로젝트 준비** (코드 작성 전)

---

## 완료된 작업

| # | 작업 | 완료일 | 산출물 |
|---|------|--------|--------|
| 1 | 핵심 요구사항 정의 | 2026-03-17 | requirements/functional-requirements.md |
| 2 | 기술 스택 확정 | 2026-03-17 | overview/tech-stack.md |
| 3 | DB 스키마 설계 (35 tables, 19 ENUMs) | 2026-03-17 | database/schema-design.md, data-dictionary.md |
| 4 | 아키텍처 설계 (시스템 + 어플리케이션) | 2026-03-17 | architecture/*.md |
| 5 | 프론트엔드 아키텍처 설계 | 2026-03-17 | architecture/frontend-architecture.md |
| 6 | 프로세스 흐름 도식화 (F1~F8, F12) | 2026-03-17 | requirements/functional-requirements.md |
| 7 | 해외결제/다중통화 DB 설계 | 2026-03-17 | database/schema-design.md |
| 8 | EDA/Kafka 설계 아카이빙 | 2026-03-17 | archive/eda-kafka-design.md |
| 9 | 스킬 9개 생성 | 2026-03-17 | .claude/commands/cardwise-*.md |
| 10 | 프로젝트 개요 문서 | 2026-03-17 | README.md |
| 11 | 디자인 시스템 문서 | 2026-03-18 | design/design-system.md |
| 12 | /cardwise-handoff 스킬 추가 | 2026-03-17 | .claude/commands/cardwise-handoff.md |
| 13 | 디자인 시안 2개 — Rose Glass / Rose Blossom | 2026-03-18 | design-preview/*.html |
| 14 | UI 디자인 프롬프트 문서 | 2026-03-18 | docs/prompts/ui-design-prompts.md |
| 15 | Redis 로컬 Docker 설계 반영 | 2026-03-18 | docker-compose.yml, system-architecture.md |
| 16 | 테스트 전략 문서 | 2026-03-18 | docs/testing/test-strategy.md |
| 17 | 리스크 등록부 | 2026-03-18 | docs/risk/risk-register.md |
| 18 | API 설계 문서 | 2026-03-18 | docs/api/api-design.md |
| 19 | 배포 가이드 | 2026-03-18 | docs/deployment/deployment-guide.md |
| 20 | 모니터링/관측성 문서 | 2026-03-18 | docs/monitoring/observability.md |
| 21 | LLM 범용 컨텍스트 프롬프트 | 2026-03-18 | docs/prompts/llm-context-prompt.md |
| 22 | 보안/운영 핵심 결정 반영 | 2026-03-18 | 다수 문서 |
| 23 | MVP 범위 & 구현 우선순위 분석 | 2026-03-18 | docs/planning/mvp-scope.md |
| 24 | 다중통화 MVP 승격 | 2026-03-18 | planning/mvp-scope.md, schema-design.md |
| 25 | 가족/그룹 공유 가계부 도메인 신설 | 2026-03-18 | schema-design.md, data-dictionary.md, application-architecture.md |
| 26 | 태그 교차 분석 설계 | 2026-03-18 | functional-requirements.md, api-design.md |
| 27 | Auth/OAuth 전용 설계 문서 | 2026-03-18 | docs/architecture/auth-design.md |
| 28 | 기능별 상세 기획서 10개 | 2026-03-18 | docs/specs/*.md |
| 29 | API 테스팅 전략 (Swagger/SpringDoc) | 2026-03-18 | docs/api/api-design.md |
| 30 | 문서 구조 정리 & 일관성 확보 | 2026-03-18 | CLAUDE.md, STATUS.md, README.md |
| 31 | Git 초기화 & 첫 커밋 | 2026-03-18 | .gitignore, git init |

---

## 진행 중인 작업

없음 (설계 정리 완료, 구현 대기)

---

## 다음 단계 (사용자 결정 대기)

| 우선순위 | 작업 | 전제 조건 |
|---------|------|----------|
| 1 | Supabase 프로젝트 초기화 + Phase 1 26개 테이블 마이그레이션 | 사용자 구현 지시 |
| 2 | Spring Boot 프로젝트 초기화 (Gradle + 9모듈 패키지) | 사용자 구현 지시 |
| 3 | Next.js 프로젝트 초기화 (App Router + shadcn/ui) | 사용자 구현 지시 |
| 4 | GitHub Actions CI/CD 파이프라인 구성 | 구현 지시 후 |
| 5 | Sprint 1 시작: Auth + 카드 등록 (F1) | 위 3개 완료 후 |

> **MVP 구현 범위**: `docs/planning/mvp-scope.md` 참조 (Phase 1 = 26 테이블 + F1/F2/F4/F5/F6/F8/F12 + Auth + 다중통화)

---

## 핵심 설계 결정 (Key Decisions)

| # | 결정 | 이유 | 대안 (기각) |
|---|------|------|-----------|
| D1 | Spring Boot (Kotlin) 백엔드 분리 | MSA 전환 준비, 타입 안전성 | Next.js API Routes 단독 |
| D2 | Hexagonal Architecture | 모듈 독립성, 테스트 용이성 | Layered Architecture |
| D3 | Modular Monolith (MSA-ready) | MVP 속도 + 확장성 | 처음부터 MSA |
| D4 | Supabase PostgreSQL | 관리형, Auth 통합, RLS | 자체 PostgreSQL |
| D5 | Redis (Upstash) | 캐시 + Rate Limit, 서버리스 | In-memory cache |
| D6 | Spring @EventListener (MVP) | 인프라 비용 0, 모듈 분리 | Kafka (과도한 복잡도) |
| D7 | Benefit/Voucher 분리 | 행동 패턴 상이, 컬럼 세트 상이 | 단일 테이블 |
| D8 | KRW 기준 통합 + 원본 통화 보존 | 실적 계산 단순화, 원본 추적 | 다중 통화 병렬 |
| D9 | 카드 발급일 기준 연간 실적 | 한국 카드사 실제 정책 반영 | 달력 연도 기준 |
| D10 | Payment(1) -> PaymentItem(N) 구조 | 쿠팡 등 복수 품목 대응 | 단일 결제 테이블 |
| D11 | 가족/그룹 공유 가계부 (Group BC) | 가족 공동 가계부는 핵심 사용 시나리오 | 개인 가계부만 |
| D12 | 다중통화 MVP 포함 | Amazon/AliExpress/해외여행 빈번 | Phase 1.5 연기 |

---

## 파일 구조

```
E:\Dev_ai\CardWise\
+-- CLAUDE.md                           프로젝트 지침
+-- docker-compose.yml                  Redis 로컬 개발
+-- docs/
|   +-- README.md                       프로젝트 개요 (개념도 포함)
|   +-- STATUS.md                       <<< 이 파일 (인수인계)
|   +-- overview/
|   |   +-- tech-stack.md               기술 스택 상세
|   +-- architecture/
|   |   +-- system-architecture.md      인프라/배포
|   |   +-- application-architecture.md DDD/모듈/이벤트 (9 BC)
|   |   +-- frontend-architecture.md    프론트엔드
|   |   +-- auth-design.md              인증/OAuth/계정 관리
|   +-- planning/
|   |   +-- mvp-scope.md                MVP 범위 + 구현 우선순위
|   +-- requirements/
|   |   +-- functional-requirements.md  기능 요구사항 + 프로세스 (F1~F12)
|   |   +-- non-functional-requirements.md
|   +-- database/
|   |   +-- schema-design.md            ERD + 도메인 스키마 (35 tables, 19 ENUMs)
|   |   +-- data-dictionary.md          컬럼 상세 명세
|   +-- specs/                          기능별 상세 기획서
|   |   +-- AUTH-signup-login.md
|   |   +-- F1-card-management.md
|   |   +-- F2-ledger-manual.md
|   |   +-- F4-performance-tracking.md
|   |   +-- F5-benefit-search.md
|   |   +-- F6-voucher-management.md
|   |   +-- F7-notification.md
|   |   +-- F8-dashboard.md
|   |   +-- F12-group-ledger.md
|   |   +-- TAG-system.md
|   +-- design/
|   |   +-- design-system.md            디자인 시스템
|   +-- testing/
|   |   +-- test-strategy.md            테스트 전략
|   +-- risk/
|   |   +-- risk-register.md            리스크 등록부
|   +-- api/
|   |   +-- api-design.md               REST API + Swagger/SpringDoc
|   +-- deployment/
|   |   +-- deployment-guide.md         CI/CD + 배포 절차
|   +-- monitoring/
|   |   +-- observability.md            로깅/메트릭/알림
|   +-- prompts/
|   |   +-- ui-design-prompts.md        AI UI 디자인 프롬프트
|   |   +-- design-quick-prompts.md     AI 디자인 프롬프트 간략 버전
|   |   +-- llm-context-prompt.md       범용 LLM 인수인계 프롬프트
|   +-- archive/
|   |   +-- eda-kafka-design.md         EDA/Kafka (Phase 2용)
|   +-- _legacy/                        이전 버전 문서 (참고용)
+-- .claude/
|   +-- commands/                       Claude Code 스킬 (9개)
```

---

## 사용 가능한 스킬

| 스킬 | 용도 | 사용 시점 |
|------|------|----------|
| /cardwise-spec | 기능 명세 작성 | 새 기능 구현 전 |
| /cardwise-feature-team | 서브에이전트 팀 구현 | 기능 구현 시 |
| /cardwise-review-team | 코드 리뷰 (3관점) | 구현 완료 후 |
| /cardwise-seed | 시드 데이터 SQL | 테스트 데이터 필요 시 |
| /cardwise-migration | DB 마이그레이션 + RLS | 스키마 변경 시 |
| /cardwise-prompt | AI 프롬프트 설계 | AI 기능 구현 시 |
| /cardwise-component | UI 컴포넌트 생성 | 프론트엔드 구현 시 |
| /cardwise-security | 보안 검토 | PR 생성 전 |
| /cardwise-handoff | 상태 기록/인수인계 | 세션 종료 시 |

---

## LLM 인수인계 가이드

### 이 프로젝트를 처음 접하는 AI/LLM에게

1. **먼저 읽을 것**: `CLAUDE.md` -> `docs/README.md` -> 이 파일 (`STATUS.md`)
2. **설계 이해**: `docs/architecture/` 4개 문서 순서대로
3. **DB 이해**: `docs/database/schema-design.md` -> `data-dictionary.md`
4. **기능 이해**: `docs/requirements/functional-requirements.md` -> `docs/specs/`
5. **MVP 범위**: `docs/planning/mvp-scope.md`
6. **구현 금지**: 사용자가 명시적으로 요청하기 전까지 코드 작성 금지

### 주의사항

- 설계 변경 시 관련 문서 모두 동기화 필요
- DB 변경 시 schema-design.md + data-dictionary.md 모두 업데이트
- 새 기능 추가 시 `/cardwise-spec`으로 명세 먼저 작성
- 보안 체크리스트는 `/cardwise-security`로 반드시 실행
