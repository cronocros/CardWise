# CardWise - 문서 인덱스 (docs/README.md)

> 이 파일은 **docs/ 폴더의 전체 문서 지도**입니다.  
> AI 에이전트나 새로운 팀원이 처음 이 프로젝트를 접할 때 여기서 시작하세요.  
> 실행 및 현황 파악 → [STATUS.md](STATUS.md) | 링크 모음 → [LINKS.md](LINKS.md)

---

## 📌 다음 중 하나를 찾고 있다면?

| 목적 | 먼저 읽을 문서 |
|------|---------------|
| 🚀 지금 당장 서버 실행 / URL 확인 | [LINKS.md](LINKS.md) |
| 📊 현재 구현 상태 / 무엇이 됐고 뭐가 남았나 | [STATUS.md](STATUS.md) |
| 🗺️ 어떤 기능을 얼마나 구현했나 (기능 코드) | [specs/feature-matrix.md](specs/feature-matrix.md) |
| 🏗️ 전체 시스템 구조 파악 | [architecture/system-architecture.md](architecture/system-architecture.md) |
| 🗄️ DB 테이블 구조 확인 | [database/schema-design.md](database/schema-design.md) |
| 🔐 인증/JWT 흐름 파악 | [architecture/auth-design.md](architecture/auth-design.md) |
| 📋 기능 요건 확인 | [requirements/functional-requirements.md](requirements/functional-requirements.md) |

---

## 프로젝트 소개

**CardWise** — 한국 신용카드/체크카드 혜택 관리 플랫폼

> "내 카드 혜택을 한눈에, 최적의 카드를 한번에"

| 핵심 가치 | 설명 |
|----------|------|
| 혜택 파악 (R1) | 내 카드의 모든 혜택(베네핏+바우처) 조회 |
| 사용현황 관리 (R2) | 바우처 잔여 횟수, 혜택 한도, 연간/월간 실적 |
| 가계부 관리 (R3) | 결제 기록 + 품목별 혜택 추적 |
| 혜택 검색 (R4) | "스타벅스 갈 건데 어떤 카드?" 최적 추천 |
| 통계/인사이트 (R5) | 월간 지출 분석, 카테고리별 통계, 카드별 달성률 |

---

## 기술 스택 요약

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Spring Boot 3.x (Kotlin) + Hexagonal Architecture |
| Database | Supabase PostgreSQL (41 tables, 26 ENUMs) |
| Auth | Supabase Auth (JWT) + `backend-proxy.ts` JWT 자동 전달 |
| Cache | Redis (로컬 Docker / Upstash 운영) |
| 배포 | Vercel (FE) + Cloud Run (BE) — 미완료 |

상세: [overview/tech-stack.md](overview/tech-stack.md)

---

## 문서 구조 및 각 파일 목적

```
docs/
├── README.md                ← 지금 보고 있는 파일. 문서 전체 인덱스 + 목적 설명
├── STATUS.md                ← 현재 구현 상태, 라우팅 구조, 다음 할 일 (LLM 인수인계용)
├── LINKS.md                 ← 로컬/외부 전체 실행 링크 모음 (개발 중 바로 열기용)
│
├── overview/
│   └── tech-stack.md        기술 스택 상세 선정 이유 및 버전
│
├── architecture/
│   ├── system-architecture.md      인프라, 배포, 네트워크 구조
│   ├── application-architecture.md DDD 모듈, Hexagonal 패키지 구조
│   ├── frontend-architecture.md    Next.js BFF 패턴, 라우팅, 컴포넌트 설계
│   └── auth-design.md              Supabase JWT 인증 흐름, 미들웨어, 백엔드 연동
│
├── planning/
│   └── mvp-scope.md         MVP 범위 정의 + 구현 우선순위
│
├── requirements/
│   ├── functional-requirements.md    기능 요구사항 + 프로세스 흐름 다이어그램
│   └── non-functional-requirements.md 성능, 보안, 가용성 요건
│
├── database/
│   ├── schema-design.md     ERD + 도메인별 스키마 (41 tables, 26 ENUMs)
│   └── data-dictionary.md   테이블/컬럼 상세 명세
│
├── design/
│   └── design-system.md     컬러 토큰, 타이포그래피, 컴포넌트 가이드
│
├── api/
│   └── api-design.md        REST API 설계 원칙 + 엔드포인트 명세
│
├── specs/                   기능별 상세 기획서 (기능 코드 기준)
│   ├── feature-matrix.md    ★ 전체 기능 구현 현황표 (기능 코드 + 완료율)
│   ├── AUTH-signup-login.md 회원가입 / 로그인 / OAuth 흐름
│   ├── F1-card-management.md 카드 등록/수정/삭제
│   ├── F2-ledger-manual.md  가계부 수동 입력 + 해외결제(FX)
│   ├── F3-ledger-inbox.md   인박스 (AI 처리 대기 → 사용자 확인)
│   ├── F4-performance-tracking.md 연간/월간 실적 계산
│   ├── F5-benefit-search.md 혜택 검색 + 최적 카드 추천
│   ├── F6-voucher-management.md 바우처 잔여 횟수 추적 + 만료 알림
│   ├── F7-notification.md   알림 시스템 + 스케줄러
│   ├── F8-dashboard.md      소비 대시보드 + 태그 교차 분석
│   ├── F12-group-ledger.md  그룹/가족 공유 가계부
│   └── TAG-system.md        태그 시스템 및 통계
│
├── testing/
│   └── test-strategy.md     테스트 전략 (단위/통합/E2E)
│
├── risk/
│   └── risk-register.md     리스크 목록 및 대응 방안
│
├── deployment/
│   └── deployment-guide.md  CI/CD + Vercel/Cloud Run 배포 절차
│
├── monitoring/
│   └── observability.md     로깅, 메트릭, 알림 전략
│
├── prompts/
│   ├── llm-context-prompt.md      AI 에이전트에게 이 프로젝트를 설명하는 시스템 프롬프트
│   ├── ui-design-prompts.md       AI 도구용 UI 디자인 프롬프트 (상세)
│   └── design-quick-prompts.md    AI 디자인 프롬프트 간략 버전
│
├── archive/
│   ├── 2026-03-20-f7-f12-handoff-RESOLVED.md  F7/F12 구현 이슈 해결 기록
│   └── eda-kafka-design.md                     EDA/Kafka 설계 (Phase 2용 보관)
│
└── _legacy/                 이전 버전 문서 (참고용만, 현행 아님)
```

---

## ⚠️ OPS 라이브 대시보드 (제품 기능 아님)

`/ops/live` 경로의 "AI 에이전트 모니터링 + Human-in-the-Loop 뷰"는 **CardWise 제품 기능이 아닙니다.**  
개발자가 구현 중 에이전트 상태와 대기 큐를 확인하기 위한 **내부 OPS 도구**로, 별도 분리되어 있습니다.  
→ [LINKS.md - 개발자 도구 섹션](LINKS.md#-개발자-도구-ops-cardwise-제품-기능-아님) 참고

---

## 개발 Phase

| Phase | 주요 기능 | 상태 |
|-------|----------|------|
| Phase 1 (MVP) | F1~F8, F12 (카드 등록, 가계부, 실적, 혜택, 바우처, 알림, 대시보드, 그룹) | **구현 중 (90%+)** |
| Phase 2 | SMS/이메일 파싱 자동화 | 미착수 |
| Phase 3 | 카드사 이벤트 크롤링, MSA 전환 | 미착수 |

---

## 수익 모델

| | FREE | PREMIUM |
|---|------|---------|
| 카드 | 3장 | 무제한 |
| 입력 | 수동만 | + 이메일 파싱 |
| 통계 | 기본 | 고급 + 인사이트 |
| 알림 | 없음 | 만료/실적 알림 |
