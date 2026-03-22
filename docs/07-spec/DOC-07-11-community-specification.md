# CardWise 커뮤니티(Community) 상세 명세 (DOC-07-11)

> **상태**: v3.7 현행화 완료 (커뮤니티 전 도메인 백엔드 연동 완성)

CardWise v4.0에서는 사용자가 유익한 금융 정보를 공유하고 소통할 수 있는 프리미엄 커뮤니티 공간을 제공합니다.

---

## 1. 커뮤니티 기능 코드 (F-16-xx)

| 코드 | 기능명 (Feature) | 상세 설명 | 상태 |
| :--- | :--- | :--- | :---: |
| **F-16-01** | **피드 조회 (Feed)** | 카테고리별/인기순/최신순 실시간 게시글 피드 조회 | ✅ DONE |
| **F-16-02** | **게시글 관리 (Post)** | 게시글 작성(CRUD), 이미지 첨부, 태그 부착 | ✅ DONE |
| **F-16-03** | **댓글 시스템 (Comment)** | 게시글별 댓글 작성 및 관리, 대댓글(Phase 2) 대비 설계 | ✅ DONE |
| **F-16-04** | **반응 시스템 (Reaction)** | 좋아요(Like), 북마크(Bookmark) 토글 및 카운트 실시간 연동 | ✅ DONE |
| **F-16-05** | **카테고리 필터링** | 카드꿀팁, 절약인증, 질문/답변, 자유게시판 분류 | ✅ DONE |

---

## 2. 주요 카테고리 정의 (CAT-xx)

- **CAT-HACKS**: `💡 꿀팁` 카드 혜택 활용, 연회비 절감 노하우 등.
- **CAT-SAVING**: `💰 절약` 가계부 인증, 무지출 챌린지 성과 공유.
- **CAT-QNA**: `❓ 질문` 자산 관리 관련 질문 및 전문가/사용자 답변.
- **CAT-FREE**: `💬 자유` 일상 대화 및 가벼운 금융 이야기.

---

## 3. UI/UX 구현 명세 (UI-xx)

### 3.1 모바일 커뮤니티 탭 (UI-01)
- `CommunityView`: 피드형 레이아웃, 상단 필터링 UI (`Planet` 컨셉 아이콘 적용).
- `CommunityDetailModal`: 게시글 상세 조회 및 댓글 인터랙션이 포함된 통합 모달.

### 3.2 웹 커뮤니티 페이지 (UI-02)
- `/web/community`: 넓은 화면에 최적화된 리스트-상세 2단 레이아웃.
- 사이드바 네비게이션을 통한 빠른 카테고리 전환.

---

## 4. 백엔드 연동 및 보안 (Architecture)

### 4.1 도메인 구조
- `com.cardwise.community` 모듈 (Hexagonal).
- **CQRS**: `PostCommandService`와 `PostQueryService` 분리. [DOC-03-02-application-architecture.md](../03-architecture/DOC-03-02-application-architecture.md) 참조.

### 4.2 데이터 스키마
- `community_post`, `community_comment`, `community_post_like`, `community_post_bookmark` 테이블 연동.
- **RLS**: 본인이 작성한 글/댓글만 수정/삭제 가능하도록 Supabase 정책 적용. [DOC-03-03-schema-design.md](../03-architecture/DOC-03-03-schema-design.md) 참조.

---

## 🔗 연관 문서 (Related Docs)

- **[DOC-01-01] [DOC-01-01-functional-requirements.md](../01-analysis/DOC-01-01-functional-requirements.md)**: 전체 시스템 기획 및 요건
- **[DOC-03-02] [DOC-03-02-application-architecture.md](../03-architecture/DOC-03-02-application-architecture.md)**: 헥사고날 아키텍처 상세
- **[DOC-03-03] [DOC-03-03-schema-design.md](../03-architecture/DOC-03-03-schema-design.md)**: DB 엔티티 설계서
- **[DOC-00-02] [STATUS.md](../STATUS.md)**: 현재 구현 현황 및 로드맵
