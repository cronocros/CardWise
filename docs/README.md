# CardWise - Project Overview

한국 신용카드/체크카드 혜택 관리 플랫폼

---

## 한눈에 보기

```
+-----------------------------------------------------------------------+
|                          CardWise                                      |
|                                                                        |
|   "내 카드 혜택을 한눈에, 최적의 카드를 한번에"                              |
|                                                                        |
|   +-------------------+  +-------------------+  +-------------------+  |
|   |   혜택 파악 (R1)   |  |  사용현황 관리 (R2)|  |  가계부 관리 (R3)  |  |
|   |                   |  |                   |  |                   |  |
|   | 내 카드의 모든     |  | 바우처 잔여 횟수   |  | 결제 기록         |  |
|   | 혜택 정보 조회     |  | 혜택 한도 소진률   |  | 품목별 혜택 추적   |  |
|   | 베네핏 + 바우처    |  | 연간/월간 실적     |  | 수동 + 이메일 파싱 |  |
|   +-------------------+  +-------------------+  +-------------------+  |
|                                                                        |
|   +-------------------+  +-------------------+                         |
|   |  혜택 검색 (R4)    |  | 통계/인사이트 (R5) |                         |
|   |                   |  |                   |                         |
|   | "스타벅스 갈 건데  |  | 월간 지출 분석     |                         |
|   |  어떤 카드?"       |  | 카테고리별 통계    |                         |
|   | 최적 카드 추천     |  | 카드별 실적 달성률 |                         |
|   +-------------------+  +-------------------+                         |
+-----------------------------------------------------------------------+
```

---

## 핵심 개념

```
+------------------+          +------------------+
|   Benefit        |          |   Voucher        |
|   (베네핏)        |          |   (바우처)        |
|                  |          |                  |
| 결제 시 자동 적용  |          | 별도 사용 필요     |
| 할인, 적립,       |          | 쿠폰, 라운지,     |
| 캐시백, 마일리지   |          | 보험, 서비스      |
|                  |          |                  |
| -> 가계부와 연결   |          | -> 잔여횟수 추적   |
+------------------+          +------------------+
```

```
결제 구조:

Payment (1건의 결제)
  |
  +-- PaymentItem (품목 1): 아메리카노 4,500원 [카페 10% 할인 = 450원]
  +-- PaymentItem (품목 2): 케이크 6,000원     [해당 없음]
  +-- PaymentItem (품목 3): 텀블러 25,000원    [전체 5% 적립 = 1,250원]

실적 계산: 카드 발급일 기준 연간 (달력 연도 아님)
  발급일 2025-06-15 -> 연간: 2025.06 ~ 2026.05
```

---

## 시스템 전체 구조

```
+-------------------+
|   사용자 (브라우저) |
+--------+----------+
         |
    HTTPS (REST API)
         |
+--------v----------+        +------------------+
|  Next.js 15       |        |  Supabase Auth   |
|  (Vercel)         |<------>|  (JWT 인증)       |
|                   |        +------------------+
|  - App Router     |
|  - RSC + SSR      |
|  - Tailwind/shadcn|
+--------+----------+
         |
    REST API (OpenAPI)
         |
+--------v-------------------+     +------------------+
|  Spring Boot (Kotlin)      |<--->|  Redis (Upstash)  |
|                            |     |  - 캐시           |
|  Modular Monolith          |     |  - Rate Limit     |
|  (Hexagonal Architecture)  |     +------------------+
|                            |
|  +------+ +------+ +-----+|
|  | Card | |Ledger| |Bene-||
|  |Module| |Module| |fit  ||     +------------------+
|  +------+ +------+ +-----+|<--->|  Supabase        |
|  +------+ +------+ +-----+|     |  PostgreSQL      |
|  |Vouch-| |Crawl-| |Noti-||     |  - 32 tables     |
|  |er    | |er    | |fy   ||     |  - RLS           |
|  +------+ +------+ +-----+|     +------------------+
+----------------------------+
```

---

## 기술 스택 요약

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Spring Boot (Kotlin) + Hexagonal Architecture |
| Database | Supabase PostgreSQL (35 tables, 19 ENUMs) |
| Auth | Supabase Auth (JWT) |
| Cache | Redis (Upstash) |
| 배포 | Vercel (FE) + Cloud Run (BE) |

상세: [docs/overview/tech-stack.md](overview/tech-stack.md)

---

## 문서 구조

```
docs/
+-- README.md                           <-- 지금 보고 있는 파일
+-- STATUS.md                           현재 진행 상태 / LLM 인수인계
|
+-- overview/
|   +-- tech-stack.md                   기술 스택 상세 정의
|
+-- architecture/
|   +-- system-architecture.md          인프라 / 배포 / 네트워크
|   +-- application-architecture.md     DDD / 모듈 / 패키지 구조
|   +-- frontend-architecture.md        프론트엔드 설계
|   +-- auth-design.md                  인증/OAuth/계정 관리
|
+-- planning/
|   +-- mvp-scope.md                    MVP 범위 + 구현 우선순위
|
+-- requirements/
|   +-- functional-requirements.md      기능 요구사항 + 프로세스 흐름
|   +-- non-functional-requirements.md  성능 / 보안 / 가용성
|
+-- database/
|   +-- schema-design.md                ERD + 도메인별 스키마 (35 tables, 19 ENUMs)
|   +-- data-dictionary.md              테이블/컬럼 상세 명세
|
+-- design/
|   +-- design-system.md                디자인 시스템 (컬러/타이포/컴포넌트)
|
+-- api/
|   +-- api-design.md                   REST API 설계 + 엔드포인트 명세
|
+-- specs/                              기능별 상세 기획서
|   +-- AUTH-signup-login.md            회원가입/로그인/OAuth
|   +-- F1-card-management.md           카드 등록/관리
|   +-- F2-ledger-manual.md             가계부 (수동 입력 + 해외결제)
|   +-- F4-performance-tracking.md      실적 추적
|   +-- F5-benefit-search.md            혜택 검색
|   +-- F6-voucher-management.md        바우처 관리
|   +-- F7-notification.md              알림
|   +-- F8-dashboard.md                 대시보드 + 태그 교차 분석
|   +-- F12-group-ledger.md             가족/그룹 공유 가계부
|   +-- TAG-system.md                   태그 시스템 & 통계
|
+-- testing/
|   +-- test-strategy.md                테스트 전략
|
+-- risk/
|   +-- risk-register.md                리스크 등록부
|
+-- deployment/
|   +-- deployment-guide.md             CI/CD + 배포 절차
|
+-- monitoring/
|   +-- observability.md                로깅/메트릭/알림
|
+-- prompts/
|   +-- ui-design-prompts.md            AI 도구용 UI 디자인 프롬프트
|   +-- design-quick-prompts.md         AI 디자인 프롬프트 간략 버전
|   +-- llm-context-prompt.md           범용 LLM 인수인계 시스템 프롬프트
|
+-- archive/
|   +-- eda-kafka-design.md             EDA/Kafka 설계 (Phase 2용 보관)
|
+-- _legacy/                            이전 버전 문서 (참고용)
```

---

## 개발 Phase

| Phase | 주요 기능 | 상태 |
|-------|----------|------|
| Phase 1 (MVP) | 카드 등록, 가계부, 실적 관리, 혜택 검색, 바우처, 알림, 대시보드, 그룹 가계부 | 설계 완료, 구현 대기 |
| Phase 2 | SMS 파싱 | 미착수 |
| Phase 3 | 카드사 이벤트, 사후 분석/시뮬레이션, MSA 전환 | 미착수 |

---

## 수익 모델

| | FREE | PREMIUM |
|---|------|---------|
| 카드 | 3장 | 무제한 |
| 입력 | 수동 | + 이메일 파싱 |
| 통계 | 기본 | 고급 + 인사이트 |
| 알림 | - | 만료/실적 알림 |
