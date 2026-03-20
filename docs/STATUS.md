# CardWise - 프로젝트 현황 (Project Status)

> **최종 갱신**: 2026-03-21  
> **현재 버전**: v3.4 (프리미엄 UI & 인터랙션 고도화)  
> **활성 브랜치**: `main`

---

## 1. 시스템 현황 (System Health)

| 구성요소 | 방식 | 상태 | 비고 |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (Turbopack) | ✅ Running | Port: 3000 |
| **Backend** | Spring Boot 3 / Kotlin | ✅ Running | Port: 8080 |
| **Database** | Supabase PostgreSQL | ✅ Connected |  |
| **OPS Dashboard** | Custom Node.js Dashboard | ✅ Running | Port: 4173 |

---

## 2. 기능 구현 요약 (Feature Highlights)

| 기능 코드 | 기능명 | 완성도 | 핵심 성과 |
| :--- | :--- | :--- | :--- |
| **F1** | 카드 관리 | 95% | 플립 애니메이션 및 브랜드별 테마 적용 |
| **F2** | 가계부 | 90% | **멀티 컬러 도트 캘린더** (수입/지출 구분) 구현 |
| **F5** | 혜택 검색 | 95% | AI 기반 혜택 추천 및 퀵 메뉴(Card Finder) 연동 |
| **F8** | 대시보드 | 100% | 종합 지출 통계 및 태그 기반 분석 완료 |
| **EXT** | 데일리 운세 | 100% | 모바일 전용 운세 페이지 (`/mobile/fortune`) 연동 |

---

## 3. 라우팅 구조 (Routing Structure)

### 📲 모바일 전용 (Mobile Native-like UI)
- `/mobile`: 홈 탭 (지출 요약, 퀵 메뉴)
- `/mobile/ledger`: 가계부 탭 (달력 기반 수입/지출 관리)
- `/mobile/cards`: 카드 탭 (보유 카드 관리, 플립 상세 보기)
- `/mobile/benefits`: 혜택 탭 (AI 추천, 혜택 검색, 오늘의 운세)
- `/mobile/community`: 커뮤니티 탭 (게시물 추천, 상세 보기 모달)
- `/mobile/profile`: 마이페이지 (배지 시스템, 설정 모달)
- `/mobile/fortune`: 오늘의 운세 상세 페이지

### 🖥️ 웹 대시보드 (Web Admin/Insight)
- `/web/dashboard`: 종합 자산 분석 및 인사이트
- `/web/cards`: 카드 발급 및 법인 카드 관리

---

## 4. 아키텍처 및 설정 준수 사항

- **Workspace Root**: `E:\Dev_ai\CardWise` 기준으로 `npm workspaces`를 적용하여 프론트엔드 의존성 해결.
- **Hydration Stability**: `sampleData.ts`에 결정론적(Deterministic) 시드 난수 생성을 적용하여 SSR-Client 불일치 해결.
- **OPS Separation**: 내부 관리용 대시보드를 제품 코드와 엄격하게 분리 (`/ops/dashboard`).

---

## 5. 전체 문서 지도 (SDLC 분류)

상세 내용은 **[docs/README.md](README.md)**를 참조하세요.

1.  **[01-analysis/](01-analysis/)**: 요구사항 정의, 기능 대조표
2.  **[02-planning/](02-planning/)**: v3.4 구현 계획, TASKS 목록
3.  **[03-architecture/](03-architecture/)**: 시스템, DB, 인증/보안 설계
4.  **[04-design/](04-design/)**: 디자인 시스템, Pencil 원본 파일
5.  **[05-implementation/](05-implementation/)**: 배포 가이드, 운영 전략
6.  **[06-testing/](06-testing/)**: 테스트 전략 및 결과
7.  **[07-other/](07-other/)**: 링크 모음, 아카이브, 과거 기록

---

## 🚀 다음 우선순위 (Next Steps)

1.  **데이터 영속성**: `localStorage` 또는 `IndexedDB`를 통한 오프라인 데이터 유지.
2.  **PWA 전환**: 서비스 워커(Service Worker) 설정을 통한 홈 화면 추가 지원.
3.  **백엔드 API 실연동**: 현재 목업(Mock)으로 처리된 커뮤니티 좋아요/댓글 로직을 Spring Boot API와 최종 바인딩.
