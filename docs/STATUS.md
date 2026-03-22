# CardWise 프로젝트 종합 현황 (DOC-00-02)

> **v3.7 최종 갱신**: 2026-03-22  
> **상태**: **Single Source of Truth (SSOT)** - AI 및 IDE 개발 도구가 즉시 맥락을 파악하기 위한 문서입니다.

---

## 🏗️ 1. 아키텍처 및 기술 스택 (Architecture & Stack)

| 구분 | 내용 | 관련 설계 문서 |
| :--- | :--- | :--- |
| **백엔드** | Spring Boot 3.4 / Kotlin (Hexagonal + CQRS) | [DOC-03-02](03-architecture/DOC-03-02-application-architecture.md) |
| **프론트엔드** | Next.js 16 (App Router) / Tailwind CSS | [DOC-03-06](03-architecture/DOC-03-06-frontend-architecture.md) |
| **데이터베이스**| Supabase PostgreSQL (Remote) | [DOC-03-03](03-architecture/DOC-03-03-schema-design.md) |
| **캐시/메시징**| Upstash Redis (Serverless) | [DOC-03-01](03-architecture/DOC-03-01-system-architecture.md) |
| **인프라** | Vercel (FE), Google Cloud Run (BE) | [DOC-05-01](05-ops/DOC-05-01-deployment-guide.md) |

---

## 📂 2. 코드 가이드 (Developer Context)

### 🧩 백엔드 구조 (Domain-First)
모든 비즈니스 로직은 `domain` 및 `application` 레이어에 위치하며, 기술적 세부사항은 `adapter`에 격리됩니다.
- **예시 도메인 (참조)**: `com.cardwise.card` 패키지는 헥사고날 정석 구조를 따릅니다.
- **CQRS**: 상태 변경은 `CommandService`, 복잡한 조항은 `QueryService`를 활용합니다.
- **이벤트**: 모듈 간 통신은 `Spring ApplicationEvent` 기반 비결합 방식을 사용합니다.

### 📲 프론트엔드 구조 (Mobile-Centric)
- **모바일 뷰**: `frontend/src/app/mobile` 하위에 위치하며 네이티브 앱과 같은 경험을 제공합니다.
- **BFF 패턴**: `/api/**` 경로의 Route Handler를 통해 백엔드와 통신하며 JWT 및 계정 ID를 관리합니다.
- **상태 관리**: URL 쿼리 파라미터 및 React Client State를 주로 사용하며, 대규모 상태는 Context API를 활용합니다.

---

## ✅ 3. 현재 구현 완료 기능 (Feature Matrix)

| 구분 | 기능명 | 요약 | 상세 명세 |
| :--- | :--- | :--- | :--- |
| **카드** | 지능형 관리 | 계층 검색 등록, 실적 구간 추적 | [DOC-07-02](07-spec/DOC-07-02-card-management.md) |
| **가계부** | 스마트 레저 | 멀티 컬러 캘린더, 다중 태그, FX 지원 | [DOC-07-03](07-spec/DOC-07-03-ledger-specification.md) |
| **커뮤니티**| 소셜 피드 | 포스트/댓글 CRUD, 좋아요/북마크 반응 | [DOC-07-11](07-spec/DOC-07-11-community-specification.md) |
| **인사이트**| AI 분석 | AI 기반 소비 리포트 및 오늘의 혜택 추천 | [DOC-07-06](07-spec/DOC-07-06-benefit-search.md) |
| **게임화** | 레벨/뱃지 | LV.24, XP 바, 20종 업적 갤러리 | [DOC-03-09](03-architecture/DOC-03-09-gamification-system.md) |

---

## 🚀 4. 현재 진행사항 및 로드맵 (Roadmap)

1. **[P1] 소셜 로그인 연동**: Google, Kakao OAuth 정식 프로덕션 연동 (진행 중)
2. **[P2] 영수증 AI OCR**: Tesseract.js 기반 영수증 인식 및 자동 가계부 등록 (대기)
3. **[P2] 오프라인 지능형 큐잉**: 네트워크 단절 시 IndexedDB 활용 오프라인 모드 (대기)
4. **[P3] PWA 고도화**: 푸시 알림 및 모바일 앱 설치 최적화 (대기)

---

## 🛠️ 5. AI/IDE 개발 툴을 위한 환경 설정

- **프로젝트 루트**: `e:\Dev_ai\CardWise`
- **백엔드 포트**: `8080` (API 베이스: `/api/v1`)
- **프론트엔드 포트**: `3000`
- **OPS 대시보드**: `4173` (에이전트 실시간 모니터링용)
- **주요 터미널 명령어**: `re-run-server.py` (전체 재구동), `run-be.bat` (백엔드만)

> **주의사항**: 소스 코드 수정 시 반드시 `docs/01-analysis/DOC-01-03-feature-matrix.md`의 완료 상태를 업데이트하여 AI 에이전트 간의 컨텍스트 동기화를 유지하십시오.
