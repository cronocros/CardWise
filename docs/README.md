# CardWise - 프로젝트 통합 문서 가이드 (docs/README.md)

이 문서는 CardWise 프로젝트의 모든 개발 산출물과 가이드라인을 분류한 **전체 문서 지도**입니다. (v3.5 프리미엄 업적 시스템 업데이트 반영)

## 🧭 문서 카테고리 (6단계 가공 프로세스)

각 폴더는 소프트웨어 개발 생명주기(SDLC)에 따라 분류되어 있습니다.

### [01. 분석 (Analysis)](01-analysis/)
*프로젝트의 전제 조건과 요구 사항을 정의합니다.*
- `functional-requirements.md`: 주요 기능 요건 및 프로세스 흐름
- `non-functional-requirements.md`: 성능, 보안, 가용성 지표
- `risk-register.md`: 잠재적 리스크 및 대응 방안
- `audit-report.md`: 코드 및 보안 감사 결과

### [02. 기획 및 계획 (Planning)](02-planning/)
*일정, 범위, 태스크를 관리합니다.*
- `implementation_plan_v3.4.md`: 이전 버전(v3.4) 구현 로드맵
- `TASKS.md`: 기능 코드별 세부 체크리스트 및 작업 현황
- `feature-matrix.md`: 전체 완성도 대조표 (95%+)

### [03. 아키텍처 및 설계 (Architecture)](03-architecture/)
*시스템 원칙과 구조를 명시합니다.*
- `system-architecture.md`: 인프라, 배포, 인프라스트럭처
- `application-architecture.md`: Hexagonal (Kotlin) 모듈 구조
- `frontend-architecture.md`: Next.js BFF 패턴 및 상태 관리
- `auth-design.md`: Supabase JWT 인증 설계 및 흐름
- `schema-design.md`: DB ERD 및 테이블/컬럼 명세

### [04. 디자인 (Design)](04-design/)
*UI/UX 원칙과 가이드라인을 정의합니다.*
- `design-system.md`: 컬러 패밀리, 타이포그래피, 컴포넌트 토큰
- `BADGE_SYSTEM.md`: **20종 뱃지 및 업적 시스템 상세 명세 (v3.5)**
- `pencil-new.pen`: Pencil 전용 디자인 에셋 파일 (백업)

### [05. 구현 및 운영 (Implementation)](05-implementation/)
*서버 가동 및 환경 설정을 위한 실전 가이드입니다.*
- `deployment-guide.md`: Vercel/Cloud Run 배포 절차
- `observability.md`: 로깅 및 모니터링 전략

### [06. 테스트 (Testing)](06-testing/)
*품질 보증을 위한 시나리오 및 결과입니다.*
- `test-strategy.md`: 단위/통합/E2E 테스트 전략
- `test-accounts.md`: 통합 테넌시 파악 용 4대 테스트 표준 계정 및 UUID 가이드

### [07. 기타 및 아카이브 (Other)](07-other/)
*과거 기록 및 보조 도구 모음입니다.*
- `LINKS.md`: 로컬 실행 및 외부 서비스 통합 링크
- `archive/`: 이전 버전 명세서 및 완료된 이슈 기록

---

## 🚦 현재 활동 (Core Documents)

- **[STATUS.md](STATUS.md)**: 실시간 구현 현황 및 라우팅 구조 (가장 자주 읽어야 할 문서)
- **[CLAUDE.md](../CLAUDE.md)**: 개발 환경 설정 및 터미널 명령어 퀵 치트 시트

## ⚠️ 내부 관리 도구 (OPS)
- `ops/dashboard`: AI 에이전트 작업 모니터링 라이브 대시보드
- 대시보드 URL: `http://localhost:4173` (백그라운드 실행 필요)
