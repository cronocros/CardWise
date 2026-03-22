# CardWise 프로젝트 통합 문서 가이드 (DOC-00-01)

이 문서는 CardWise 프로젝트의 모든 개발 산출물과 가이드라인을 분류하고 코드화한 **전체 문서 지도**입니다. (v3.7 헥사고날 아키텍처 완성 및 프로젝트 최적화 반영)

## 🧭 문서 카테고리 및 관리 코드 (Directory Structure)

모든 문서는 고유의 관리 코드(`DOC-xx-xx`)를 부여받아 체계적으로 관리됩니다.

### [00. 메인 (Core)](./)
- `DOC-00-01`: [README.md](README.md) - 전체 문서 가이드 (본 문서)
- `DOC-00-02`: [STATUS.md](STATUS.md) - **Single Source of Truth** (AI/IDE 작업용 종합 현황)

### [01. 분석 및 요구사항 (Analysis)](01-analysis/)
- `DOC-01-01`: [DOC-01-01-functional-requirements.md](01-analysis/DOC-01-01-functional-requirements.md) - 기능 요건 명세
- `DOC-01-02`: [DOC-01-02-non-functional-requirements.md](01-analysis/DOC-01-02-non-functional-requirements.md) - 비기능/품질 요건
- `DOC-01-03`: [DOC-01-03-feature-matrix.md](01-analysis/DOC-01-03-feature-matrix.md) - 기능 구현 대조표
- `DOC-01-04`: [DOC-01-04-risk-register.md](01-analysis/DOC-01-04-risk-register.md) - 리스크 관리부
- `DOC-01-05`: [DOC-01-05-architecture-checklist.md](01-analysis/DOC-01-05-architecture-checklist.md) - 아키텍처 점검표

### [02. 기획 및 계획 (Planning)](02-planning/)
- `DOC-02-01`: [DOC-02-01-tasks.md](02-planning/DOC-02-01-tasks.md) - 세부 태스크 및 진행 상태
- `DOC-02-02`: [DOC-02-02-refinement-plan.md](02-planning/DOC-02-02-refinement-plan.md) - 중장기 고도화 계획

### [03. 아키텍처 및 설계 (Architecture)](03-architecture/)
- `DOC-03-01`: [DOC-03-01-system-architecture.md](03-architecture/DOC-03-01-system-architecture.md) - 시스템 구성 및 인프라
- `DOC-03-02`: [DOC-03-02-application-architecture.md](03-architecture/DOC-03-02-application-architecture.md) - 헥사고날/CQRS 상세 설계
- `DOC-03-03`: [DOC-03-03-schema-design.md](03-architecture/DOC-03-03-schema-design.md) - DB ERD 및 테이블 상세
- `DOC-03-04`: [DOC-03-04-api-design.md](03-architecture/DOC-03-04-api-design.md) - REST API 설계서
- `DOC-03-05`: [DOC-03-05-auth-design.md](03-architecture/DOC-03-05-auth-design.md) - 인증/인가 메커니즘
- `DOC-03-06`: [DOC-03-06-frontend-architecture.md](03-architecture/DOC-03-06-frontend-architecture.md) - Next.js 아키텍처
- `DOC-03-07`: [DOC-03-07-data-dictionary.md](03-architecture/DOC-03-07-data-dictionary.md) - 데이터 용어 사전
- `DOC-03-08`: [DOC-03-08-tech-stack.md](03-architecture/DOC-03-08-tech-stack.md) - 기술 스택 정의서
- `DOC-03-09`: [DOC-03-09-gamification-system.md](03-architecture/DOC-03-09-gamification-system.md) - 게임화(뱃지/경험치) 로직

### [04. 디자인 (Design)](04-design/)
- `DOC-04-01`: [DOC-04-01-design-system.md](04-design/DOC-04-01-design-system.md) - 디자인 가이드 및 토큰
- `DOC-04-02`: [DOC-04-02-ux-architecture.md](04-design/DOC-04-02-ux-architecture.md) - UX 레이아웃 구조
- `DOC-04-03`: [DOC-04-03-card-ui-specification.md](04-design/DOC-04-03-card-ui-specification.md) - 카드 컴포넌트 상세

### [05. 운영 및 배포 (Ops)](05-ops/)
- `DOC-05-01`: [DOC-05-01-deployment-guide.md](05-ops/DOC-05-01-deployment-guide.md) - 배포 가이드
- `DOC-05-02`: [DOC-05-02-observability-strategy.md](05-ops/DOC-05-02-observability-strategy.md) - 모니터링/로깅 전략

### [06. 품질 및 테스트 (Test)](06-test/)
- `DOC-06-01`: [DOC-06-01-test-strategy.md](06-test/DOC-06-01-test-strategy.md) - 테스트 전략 및 계획
- `DOC-06-02`: [DOC-06-02-test-accounts.md](06-test/DOC-06-02-test-accounts.md) - 테스트 시나리오/계정

### [07. 세부 기능 명세 (Spec)](07-spec/)
- `DOC-07-01`: [DOC-07-01-auth-specification.md](07-spec/DOC-07-01-auth-specification.md) - 인증/가입 상세
- `DOC-07-02`: [DOC-07-02-card-management.md](07-spec/DOC-07-02-card-management.md) - 카드 관리 상세
- `DOC-07-03`: [DOC-07-03-ledger-specification.md](07-spec/DOC-07-03-ledger-specification.md) - 가계부(수동) 상세
- `DOC-07-04`: [DOC-07-04-ledger-inbox.md](07-spec/DOC-07-04-ledger-inbox.md) - 가계부 인박스 상세
- `DOC-07-05`: [DOC-07-05-performance-tracking.md](07-spec/DOC-07-05-performance-tracking.md) - 실적 추적 상세
- `DOC-07-06`: [DOC-07-06-benefit-search.md](07-spec/DOC-07-06-benefit-search.md) - 혜택 검색 상세
- `DOC-07-07`: [DOC-07-07-voucher-management.md](07-spec/DOC-07-07-voucher-management.md) - 바우처 관리 상세
- `DOC-07-08`: [DOC-07-08-notification.md](07-spec/DOC-07-08-notification.md) - 알림 시스템 상세
- `DOC-07-09`: [DOC-07-09-dashboard.md](07-spec/DOC-07-09-dashboard.md) - 대시보드 및 통계 상세
- `DOC-07-10`: [DOC-07-10-group-ledger.md](07-spec/DOC-07-10-group-ledger.md) - 그룹 가계부 상세
- `DOC-07-11`: [DOC-07-11-community-specification.md](07-spec/DOC-07-11-community-specification.md) - 커뮤니티 상세 명세
- `DOC-07-12`: [DOC-07-12-tag-system.md](07-spec/DOC-07-12-tag-system.md) - 태그 시스템 상세
- `DOC-07-13`: [DOC-07-13-kafka-event-design.md](07-other/DOC-07-13-kafka-event-design.md) - 이벤트 주도 아키텍처 초안

---

## 🏗️ 개발 및 문서 관리 원칙

1. **코드 기반 참조**: 모든 기능은 `F-xx`, 문서는 `DOC-xx-xx` 코드로 식별하며, 문서 내 참조는 반드시 코드를 병기한다.
2. **AI/IDE 친화적 구성**: `STATUS.md`는 프로젝트의 현재 맥락을 즉시 파악할 수 있는 진입점으로 관리한다.
3. **분류 규칙**: 기획 요건은 `01-analysis`, 시스템/기술 설계는 `03-architecture`, 구체적인 기능 명세는 `07-spec` 폴더에 위치시킨다.
