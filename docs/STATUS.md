# CardWise - 프로젝트 현황 (Project Status)

> **최종 갱신**: 2026-03-22  
> **현재 버전**: v3.6 (**지능형 카드 등록 Flow & 백엔드 실연동**)  
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
| **F1** | 카드 관리 | 100% | **지능형 카드 등록(계층 선택/검색) 및 백엔드 실연동** 완료 |
| **F2** | 가계부 | 90% | **멀티 컬러 도트 캘린더** (수입/지출 구분) 구현 |
| **F5** | 혜택 검색 | 100% | **AI 스마트 분석** 및 오늘의 추천 🔥 혜택 고도화 |
| **F8** | 대시보드 | 100% | 종합 지출 통계 및 태그 기반 분석 완료 |
| **EXT** | 데일리 운세 | 100% | 모바일 전용 운세 페이지 (`/mobile/fortune`) 연동 |
| **NEW** | **프로필 & 업적** | 100% | **프리미엄 히어로 카드, 레벨 시스템(XP), 20종 뱃지 센터** 구현 |

---

## 3. 라우팅 구조 (Routing Structure)

### 📲 모바일 전용 (Mobile Native-like UI)
- `/mobile`: 홈 탭 (지출 요약, 퀵 메뉴)
- `/mobile/ledger`: 가계부 탭 (달력 기반 수입/지출 관리)
- `/mobile/cards`: 카드 탭 (보유 카드 관리, 플립 상세 보기)
- `/mobile/add-card`: **새로운 카드 등록 (지능형 계층 선택/검색 시스템)**
- `/mobile/benefits`: 혜택 탭 (**AI 스마트 분석**, 혜택 검색, 오늘의 운세)
- `/mobile/community`: 커뮤니티 탭 (게시물 추천, 상세 보기 모달)
- `/mobile/profile`: 마이페이지 (프리미엄 히어로 카드, 설정 모달)
- `tab === 'all-badges'`: **업적 센터** (20종 뱃지 갤러리 및 카테고리별 그리드)
- `/mobile/fortune`: 오늘의 운세 상세 페이지

---

## 4. UI/UX 및 아키텍처 특이사항

- **Hexagonal Architecture**: 백엔드 시스템에 CQRS, DDD, MSA 원칙을 적용한 헥사고날 아키텍처 도입.
- **Intelligent Registration**: 카드사 -> 브랜드 -> 상품명으로 이어지는 지능형 계층 선택기 및 전역 검색 기능.
- **Full Localization**: 모든 UI 요소를 한국어로 현지화 완료.
- **Gamification**: 레벨(LV.24 ELITE), 경험치(XP), 20종 뱃지를 통합한 사용자 참여 유인책 강화.
- **Premium Design**: 글래스모피즘, 그라데이션 글로우, 아바타 인터랙션을 적용한 고해상도 프로필 UI.

---

## 5. 전체 문서 지도 (SDLC 분류)

상세 내용은 **[docs/README.md](README.md)**를 참조하세요.

1. [01-analysis/](01-analysis/): 요구사항 정의, 기능 대조표
2. [02-planning/](02-planning/): v3.6 구현 계획, TASKS 목록
3. [03-architecture/](03-architecture/): 시스템, DB, 인증/보안 설계
4. [04-design/](04-design/): 디자인 시스템, Pencil 원본 파일
5. [05-implementation/](05-implementation/): 배포 가이드, 운영 전략
6. [06-testing/](06-testing/): 테스트 전략 및 결과
7. [07-other/](07-other/): 링크 모음, 아카이브, 과거 기록

---

## 🚀 다음 우선순위 (Next Steps)

1. **데이터 오프라인 모드**: `IndexedDB`를 통한 오프라인 지출 기록 지원.
2. **PWA 전환**: 서비스 워커(Service Worker) 설정을 통한 홈 화면 추가 지원.
3. **영수증 OCR**: 카메라 및 이미지 인식을 통한 자동 지출 내역 입력 (Tesseract.js 연동).
