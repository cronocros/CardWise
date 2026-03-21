# CardWise 커뮤니티(Community) 탭 기획 및 명세 (COMMUNITY_SPEC.md)

CardWise v4.0에서는 단순 자산 관리를 넘어 사용자 간의 유익한 금융 정보를 공유할 수 있는 커뮤니티 공간을 제공합니다.

## 1. 커뮤니티 주요 구조

### 1.1. 주요 카테고리

- `CARD_HACKS`: 카드 꿀팁 (혜택 활용, 연회비 절감 등)
- `SAVING_TIPS`: 절약 인증 (가계부 인증, 무지출 챌린지 등)
- `QNA`: 질문과 답변 (자산 관리, 카드 추천 등)
- `FREE`: 자유 게시판

### 1.2. 주요 기능

- **게시글**: CRUD (작성, 조회, 수정, 삭제). Soft Delete 적용.
- **댓글**: CRUD. 게시물 상세에서 조회 및 작성.
- **반응(Reaction)**:
  - **좋아요**: 토글 방식. 게시글마다 계정당 1회.
  - **스크랩(북마크)**: 토글 방식. 마이 페이지 또는 스크랩 탭에서 확인 가능.
- **검색 및 정렬**:
  - 키워드 검색 (제목 + 내용)
  - 카테고리 필터링
  - 태그 필터링 (JSONB/Array 저장 방식 기반)
  - 정렬: 최신순(LATEST), 인기순(POPULAR - 좋아요/댓글 합산)

## 2. API 엔드포인트 명세

기본 베이스 경로: `/api/v1/community`

### 2.1. 게시글 (Posts)

- `GET /posts`: 목록 조회 (페이징, 필터링, 정렬)
- `GET /posts/{postId}`: 상세 조회 (조회수 증가 포함)
- `POST /posts`: 신규 작성
- `PATCH /posts/{postId}`: 수정 (작성자 전용)
- `DELETE /posts/{postId}`: 삭제 (Soft Delete, 작성자 전용)

### 2.2. 반응 (Reactions)

- `POST /posts/{postId}/like`: 좋아요 토글
- `POST /posts/{postId}/bookmark`: 스크랩 토글

### 2.3. 댓글 (Comments)

- `GET /posts/{postId}/comments`: 게시물별 댓글 목록
- `POST /posts/{postId}/comments`: 댓글 작성
- `PATCH /comments/{commentId}`: 댓글 수정 (작성자 전용)
- `DELETE /comments/{commentId}`: 댓글 삭제 (작성자 전용)

## 3. DB 스키마 (Table Design)

- `community_post`: `post_id`, `account_id`, `category`, `title`, `content`, `image_url`, `tags(jsonb)`, `view_count`, `created_at`, `updated_at`, `deleted_at`
- `community_comment`: `comment_id`, `post_id`, `account_id`, `content`, `created_at`, `updated_at`, `deleted_at`
- `community_post_like`: `post_id`, `account_id`, `created_at` (PK: post_id, account_id)
- `community_post_bookmark`: `post_id`, `account_id`, `created_at` (PK: post_id, account_id)

### 2.4. BFF API Proxy (Next.js)

기존 프론트엔드와 백엔드 사이의 BFF(Backend For Frontend) 프록시 라우트입니다. 클라이언트 기반 컴포넌트(Client Components)에서는 보안 및 CORS 준수를 위해 백엔드로 직접 요청하지 않고 반드시 이 프록시 경로를 사용합니다. `cardwise-api.ts`의 `backendUrl` 함수는 이를 자동으로 처리합니다.

- `/api/community/posts`: 게시글 목록 조회 (`GET`)
- `/api/community/posts/{postId}`: 상세 조회/수정/삭제 (`GET`, `PATCH`, `DELETE`)
- `/api/community/posts/{postId}/like`: 좋아요 토글 (`POST`)
- `/api/community/posts/{postId}/bookmark`: 스크랩 토글 (`POST`)
- `/api/community/posts/{postId}/comments`: 게시글별 댓글 모음/작성 (`GET`, `POST`)
- `/api/community/comments/{commentId}`: 댓글 삭제 (`DELETE`)

## 4. UI/UX 구현사항

- **모바일 (Mobile UI)**: 
  - `CommunityView`: 피드형 레이아웃, 카테고리 필터링 (`🪐 전체`, `💡 꿀팁`, `💰 절약`, `❓ 질문`, `💬 자유`)
  - `CommunityDetailModal`: 게시글 상세 및 댓글 관리 모달 (`modals.tsx`)
- **웹 (Web UI)**:
  - `/web/community`: 데스크탑 최적화 커뮤니티 페이지
  - 사이드바 네비게이션 및 검색 필터링 지원
- **공통 디자인**:
  - `Pretendard` 국문 폰트 및 `Inter` 영문 폰트 혼용
  - 로즈 블로섬(Rose Blossom) 테마 토큰 (`rose-500`, `slate-900` 등) 및 글래스모피즘 효과 적용

## 5. 실행 및 확인 방법

- **백엔드**: `backend/src/main/kotlin/com/cardwise/community` 하위 패키지 실행
- **프론트엔드**: `npm run dev` 실행 후 하단 네비게이션 '커뮤니티' 클릭 또는 `/web/community` 접속
- **DB**: `supabase/migrations/20260321110000_community_schema.sql` 확인

