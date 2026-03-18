# CardWise 프론트엔드 아키텍처

> 한국 신용카드 혜택 관리 플랫폼 — 프론트엔드 기술 아키텍처 문서

---

## 목차

1. [Framework & Runtime](#1-framework--runtime)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [렌더링 전략](#3-렌더링-전략)
4. [컴포넌트 아키텍처](#4-컴포넌트-아키텍처)
5. [상태 관리](#5-상태-관리)
6. [API 통합 (BFF 패턴)](#6-api-통합-bff-패턴)
7. [인증 흐름 (클라이언트)](#7-인증-흐름-클라이언트)
8. [스타일링 시스템](#8-스타일링-시스템)
9. [주요 UI 패턴](#9-주요-ui-패턴)
10. [성능 최적화](#10-성능-최적화)
11. [테스트 전략 (계획)](#11-테스트-전략-계획)

---

## 1. Framework & Runtime

### 기술 스택 요약

```
+--------------------------------------------------+
|                  CardWise Frontend                |
+--------------------------------------------------+
|  Runtime        : Bun                            |
|  Framework      : Next.js 15 (App Router)        |
|  Language        : TypeScript (strict mode)       |
|  Styling        : Tailwind CSS + shadcn/ui       |
|  Package Manager : Bun                            |
+--------------------------------------------------+
```

### Next.js 15 App Router 선택 이유

| 기능 | 설명 | CardWise 활용 |
|------|------|---------------|
| React Server Components (RSC) | 서버에서 렌더링, JS 번들 제외 | 카드 목록, 혜택 정보 등 정적 데이터 표시 |
| Streaming | 점진적 UI 렌더링 | 대시보드 위젯별 독립적 로딩 |
| Parallel Routes | 동일 레이아웃에서 여러 페이지 동시 렌더링 | 대시보드의 여러 패널 병렬 로딩 |
| Intercepting Routes | 현재 레이아웃 유지하면서 라우트 가로채기 | 카드 목록에서 카드 상세 모달로 열기 |
| Server Actions | 서버 함수 직접 호출 | 폼 제출, 데이터 변경 처리 |
| Middleware | Edge에서 요청 가로채기 | 인증 체크, 리다이렉트 |

### Bun 런타임 선택 이유

```
+-----------------------------------------+
|            Bun 도입 효과                 |
+-----------------------------------------+
|  - 패키지 설치 속도 2~5x 향상           |
|  - 빌드 시간 단축                       |
|  - 내장 번들러/테스트러너 활용 가능      |
|  - Node.js 호환성 유지                  |
|  - lockfile: bun.lockb                  |
+-----------------------------------------+
```

### TypeScript 설정

```
tsconfig.json 주요 설정:

  strict: true            -- 엄격 모드 필수
  noUncheckedIndexedAccess: true
  paths: { "@/*": ["./src/*"] }   -- 절대경로 임포트
```

---

## 2. 프로젝트 구조

```
src/
├── app/                              # App Router 페이지
│   ├── (auth)/                       # 인증 필요 라우트 그룹
│   │   ├── dashboard/                # 대시보드
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx           # Suspense fallback
│   │   │   ├── error.tsx             # 에러 바운더리
│   │   │   └── @widgets/            # Parallel route (위젯)
│   │   ├── cards/                    # 카드 관리
│   │   │   ├── page.tsx              # 카드 목록
│   │   │   ├── [cardId]/            # 카드 상세
│   │   │   │   └── page.tsx
│   │   │   └── add/                 # 카드 추가
│   │   │       └── page.tsx
│   │   ├── ledger/                   # 가계부
│   │   │   ├── page.tsx
│   │   │   └── [month]/             # 월별 조회
│   │   │       └── page.tsx
│   │   ├── benefits/                 # 혜택 검색
│   │   │   ├── page.tsx
│   │   │   └── [categoryId]/        # 카테고리별
│   │   │       └── page.tsx
│   │   ├── vouchers/                 # 바우처 관리
│   │   │   ├── page.tsx
│   │   │   └── [voucherId]/
│   │   │       └── page.tsx
│   │   └── settings/                 # 설정
│   │       └── page.tsx
│   ├── (public)/                     # 공개 라우트
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── landing/
│   │       └── page.tsx
│   ├── api/                          # API Routes (BFF 패턴)
│   │   ├── cards/
│   │   │   └── route.ts
│   │   ├── ledger/
│   │   │   └── route.ts
│   │   ├── benefits/
│   │   │   └── route.ts
│   │   ├── vouchers/
│   │   │   └── route.ts
│   │   └── auth/
│   │       ├── callback/
│   │       │   └── route.ts
│   │       └── refresh/
│   │           └── route.ts
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── not-found.tsx                 # 404 페이지
│   └── global-error.tsx              # 전역 에러 처리
├── components/
│   ├── ui/                           # shadcn/ui 프리미티브
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── common/                       # 공통 컴포넌트
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── navigation.tsx
│   │   ├── sidebar.tsx
│   │   ├── search-bar.tsx
│   │   └── empty-state.tsx
│   ├── card/                         # 카드 도메인 컴포넌트
│   │   ├── card-list.tsx
│   │   ├── card-detail.tsx
│   │   ├── card-benefit-list.tsx
│   │   ├── card-add-form.tsx
│   │   └── card-spending-chart.tsx
│   ├── ledger/                       # 가계부 도메인 컴포넌트
│   │   ├── ledger-table.tsx
│   │   ├── ledger-entry-form.tsx
│   │   ├── ledger-summary.tsx
│   │   ├── ledger-filters.tsx
│   │   └── ledger-category-chart.tsx
│   ├── benefit/                      # 혜택 도메인 컴포넌트
│   │   ├── benefit-search.tsx
│   │   ├── benefit-card.tsx
│   │   ├── benefit-comparison.tsx
│   │   └── benefit-category-list.tsx
│   ├── dashboard/                    # 대시보드 컴포넌트
│   │   ├── spending-overview.tsx
│   │   ├── benefit-summary.tsx
│   │   ├── recent-transactions.tsx
│   │   ├── top-benefits-widget.tsx
│   │   └── monthly-chart.tsx
│   └── voucher/                      # 바우처 도메인 컴포넌트
│       ├── voucher-list.tsx
│       ├── voucher-detail.tsx
│       └── voucher-redeem-form.tsx
├── hooks/                            # 커스텀 React 훅
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   ├── use-infinite-scroll.ts
│   └── use-local-storage.ts
├── lib/                              # 유틸리티
│   ├── api.ts                        # API 클라이언트 (타입 포함)
│   ├── supabase/
│   │   ├── client.ts                 # 브라우저용 Supabase 클라이언트
│   │   ├── server.ts                 # 서버용 Supabase 클라이언트
│   │   └── middleware.ts             # 미들웨어용 Supabase 클라이언트
│   ├── utils.ts                      # cn() 등 유틸리티 함수
│   └── format.ts                     # 날짜, 통화 포맷
├── types/                            # 공유 TypeScript 타입
│   ├── card.ts
│   ├── ledger.ts
│   ├── benefit.ts
│   ├── voucher.ts
│   ├── user.ts
│   └── api.ts                        # API 응답 타입
├── styles/                           # 글로벌 스타일
│   └── globals.css                   # Tailwind 디렉티브 + CSS 변수
└── constants/                        # 앱 상수
    ├── categories.ts                 # 카드/혜택 카테고리
    ├── routes.ts                     # 라우트 경로 상수
    └── config.ts                     # 앱 설정값
```

### 디렉토리별 역할

```
+-------------------+--------------------------------------------+
|   디렉토리        |   역할                                     |
+-------------------+--------------------------------------------+
| app/              | 라우팅, 페이지, API, 레이아웃               |
| components/ui/    | shadcn/ui 프리미티브 (수정 가능)            |
| components/common/| 앱 전체에서 재사용하는 공통 UI              |
| components/{도메인}| 특정 도메인의 비즈니스 컴포넌트             |
| hooks/            | 재사용 가능한 커스텀 훅                     |
| lib/              | API 클라이언트, Supabase, 유틸리티          |
| types/            | 전역 공유 TypeScript 인터페이스             |
| styles/           | 글로벌 CSS, Tailwind 설정                  |
| constants/        | 매직넘버 제거, 열거형 관리                  |
+-------------------+--------------------------------------------+
```

---

## 3. 렌더링 전략

### 페이지별 렌더링 방식

| 페이지 | 전략 | 이유 |
|--------|------|------|
| Landing | SSG (Static) | 정적 콘텐츠, 빌드 시 생성 |
| Login / Signup | SSG | 정적 폼, 클라이언트 상호작용만 필요 |
| Dashboard | SSR + Streaming | 사용자별 데이터, Suspense로 위젯별 로딩 |
| Card List | SSR | 사용자별 카드 목록, 매 요청 시 최신 데이터 |
| Card Detail | SSR | 카드별 혜택 정보 서버에서 조회 |
| Ledger | SSR + Client Pagination | 대용량 데이터, 서버 초기 로딩 + 클라이언트 페이징 |
| Benefit Search | CSR (Client-side) | 실시간 검색, 필터 인터랙션 많음 |
| Voucher List | SSR | 사용자별 바우처, 서버에서 조회 |
| Settings | SSR | 사용자 설정 서버에서 조회 |

### 렌더링 흐름도

```
요청 유형별 렌더링 흐름
==========================

[SSG - Landing]
  빌드 시점 ──> HTML 생성 ──> CDN 캐시 ──> 즉시 응답

[SSR - Card List]
  요청 ──> 서버에서 데이터 fetch ──> HTML 생성 ──> 응답

[SSR + Streaming - Dashboard]
  요청 ──> 레이아웃/셸 즉시 응답
       ├──> [위젯 1] ──> Suspense 해소 ──> 스트리밍
       ├──> [위젯 2] ──> Suspense 해소 ──> 스트리밍
       └──> [위젯 3] ──> Suspense 해소 ──> 스트리밍

[CSR - Benefit Search]
  요청 ──> 빈 셸 응답 ──> JS 로드 ──> 클라이언트에서 fetch + 렌더링
```

### Streaming 활용 예시 (Dashboard)

```
+-------------------------------------------------------+
|  Dashboard Layout (즉시 렌더링)                        |
|-------------------------------------------------------|
|                                                       |
|  +------------------+  +------------------+           |
|  |  소비 요약        |  |  혜택 요약        |           |
|  |  [Skeleton...]   |  |  [Skeleton...]   |           |
|  |  -> 데이터 도착   |  |  -> 데이터 도착   |           |
|  |  -> 실제 렌더링   |  |  -> 실제 렌더링   |           |
|  +------------------+  +------------------+           |
|                                                       |
|  +------------------------------------------+         |
|  |  최근 거래 내역                            |         |
|  |  [Skeleton...]                            |         |
|  |  -> 데이터 도착 -> 실제 렌더링             |         |
|  +------------------------------------------+         |
+-------------------------------------------------------+

각 위젯은 독립적인 Suspense 바운더리로 감싸져
데이터가 준비되는 순서대로 클라이언트에 스트리밍됨
```

---

## 4. 컴포넌트 아키텍처

### Server Component vs Client Component 구분

```
+----------------------------------------------------------+
|                 컴포넌트 결정 트리                          |
+----------------------------------------------------------+
|                                                          |
|  이 컴포넌트가 필요한 것은?                                |
|       |                                                  |
|       +-- 데이터 fetch만 ───────> Server Component       |
|       |                                                  |
|       +-- 정적 UI 표시만 ───────> Server Component       |
|       |                                                  |
|       +-- onClick, onChange ────> Client Component       |
|       |   등 이벤트 핸들러                                |
|       |                                                  |
|       +-- useState, useEffect ──> Client Component       |
|       |   등 React 훅                                    |
|       |                                                  |
|       +-- 브라우저 API ─────────> Client Component       |
|       |   (localStorage, etc.)                           |
|       |                                                  |
|       +-- 혼합 ────────────────> 컴포지션 패턴 사용       |
|                                                          |
+----------------------------------------------------------+
```

### 컴포지션 패턴

서버 컴포넌트가 데이터를 가져오고, 클라이언트 컴포넌트에 props로 전달한다.

```
Server Component (page.tsx)
    |
    |-- 데이터 fetch (서버에서 직접)
    |
    +-- Client Component (interactive-part.tsx)
            |
            |-- props로 데이터 수신
            |-- 사용자 인터랙션 처리
            |-- 상태 관리
```

**예시: 카드 목록 페이지**

```
cards/page.tsx (Server Component)
  |
  |-- fetchCards() 서버에서 호출
  |
  +-- <CardListClient cards={cards} />
        |
        +-- 정렬/필터 UI (Client)
        +-- 카드 클릭 핸들러 (Client)
```

### shadcn/ui 기반 컴포넌트 계층

```
+---------------------------------------------------+
|  Layer 1: shadcn/ui 프리미티브                      |
|  (Button, Input, Dialog, Table, Select, Card...)   |
+---------------------------------------------------+
           |
           v
+---------------------------------------------------+
|  Layer 2: 프로젝트 공통 컴포넌트                     |
|  (Header, Sidebar, SearchBar, EmptyState...)       |
+---------------------------------------------------+
           |
           v
+---------------------------------------------------+
|  Layer 3: 도메인 컴포넌트                           |
|  (CardList, LedgerTable, BenefitSearch...)         |
+---------------------------------------------------+
           |
           v
+---------------------------------------------------+
|  Layer 4: 페이지 컴포넌트                           |
|  (app/(auth)/cards/page.tsx 등)                    |
+---------------------------------------------------+
```

### 네이밍 컨벤션

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 파일명 | kebab-case | `card-benefit-list.tsx` |
| 컴포넌트명 | PascalCase | `CardBenefitList` |
| Props 인터페이스 | `컴포넌트명 + Props` | `CardBenefitListProps` |
| 훅 파일명 | kebab-case, `use-` 접두사 | `use-debounce.ts` |
| 훅 함수명 | camelCase, `use` 접두사 | `useDebounce` |
| 유틸리티 함수 | camelCase | `formatCurrency` |
| 상수 | UPPER_SNAKE_CASE | `MAX_CARDS_PER_USER` |
| 타입/인터페이스 | PascalCase | `CardBenefit` |

### 컴포넌트 파일 구조

```
// card-benefit-list.tsx

interface CardBenefitListProps {
  cardId: string;
  benefits: Benefit[];
  onSelect?: (benefit: Benefit) => void;
}

export function CardBenefitList({ cardId, benefits, onSelect }: CardBenefitListProps) {
  // ...
}
```

---

## 5. 상태 관리

### 상태 관리 전략 개요

```
+---------------------------------------------------------------+
|                    상태 관리 매트릭스                            |
+---------------------------------------------------------------+
|                                                               |
|  서버 데이터 ──────> React Server Components                   |
|  (카드 목록,         서버에서 직접 fetch                        |
|   혜택 정보 등)      클라이언트 캐시 불필요                      |
|                                                               |
|  URL 상태 ────────> searchParams                              |
|  (필터, 페이지,      URL로 상태 공유 가능                       |
|   정렬 등)           새로고침 시 유지                           |
|                                                               |
|  로컬 UI 상태 ────> useState / useReducer                     |
|  (모달 열림/닫힘,    컴포넌트 내부 상태                         |
|   토글, 드롭다운)                                              |
|                                                               |
|  폼 상태 ─────────> React Hook Form + Zod                    |
|  (입력값, 유효성     선언적 폼 관리                             |
|   검증, 에러)        스키마 기반 검증                           |
|                                                               |
+---------------------------------------------------------------+
```

### 전역 상태 라이브러리 불필요

```
기존 방식 (Pages Router / SPA):
  서버 데이터 -> fetch -> 전역 스토어 (Redux/Zustand) -> 컴포넌트

App Router 방식:
  서버 데이터 -> RSC에서 직접 fetch -> props로 전달 (캐시 불필요)
  URL 상태   -> searchParams
  UI 상태    -> useState (로컬)

결론: Redux, Zustand 등 전역 상태 라이브러리가 필요 없다.
```

### URL 기반 상태 관리 예시

```
/ledger?month=2026-03&category=food&page=2&sort=date-desc

  month    = 2026-03        가계부 조회 월
  category = food           카테고리 필터
  page     = 2              페이지네이션
  sort     = date-desc      정렬 기준

장점:
  - 새로고침 시 상태 유지
  - URL 공유로 동일 화면 재현
  - 뒤로가기/앞으로가기 자연스럽게 동작
  - SEO 친화적 (검색 페이지)
```

### 폼 상태 관리 (React Hook Form + Zod)

```
+-------------------------------------------+
|           폼 처리 흐름                      |
+-------------------------------------------+
|                                           |
|  Zod Schema ─────> 유효성 검증 규칙 정의    |
|       |                                   |
|       v                                   |
|  React Hook Form ──> 폼 상태 관리          |
|       |                                   |
|       v                                   |
|  shadcn/ui Form ───> UI 렌더링            |
|       |                                   |
|       v                                   |
|  onSubmit ─────────> API 호출 또는         |
|                      Server Action         |
+-------------------------------------------+
```

---

## 6. API 통합 (BFF 패턴)

### 전체 아키텍처

```
+-------------+       +-------------------+       +------------------+
|             |       |                   |       |                  |
|   Browser   | ----> |  Next.js (BFF)    | ----> |  Spring Boot     |
|  (Client)   | <---- |  API Routes       | <---- |  Backend API     |
|             |       |                   |       |                  |
+-------------+       +-------------------+       +------------------+
      |                       |
      |                       |
      v                       v
  클라이언트             서버 컴포넌트에서
  컴포넌트에서           백엔드 직접 호출
  /api/* 호출            (server-to-server)
```

### 호출 경로별 정리 (권장 규칙)

| 호출 주체 | 호출 대상 | 경로 | 비고 |
|-----------|----------|------|------|
| Client Component | Next.js API Route | `/api/*` 경유 | **항상 BFF 경유 (강제 규칙)** |
| Server Component (읽기 전용) | Spring Boot API | 직접 호출 (server-to-server) | 조회용(read-only) 엔드포인트만 |
| Server Component (쓰기/부수효과) | Next.js API Route | `/api/*` 경유 | 생성/수정/삭제/side-effect |
| Next.js API Route | Spring Boot API | 서버 간 호출 (프록시) | 인증/캐싱/에러 공통 처리 |

### BFF 패턴의 장점

```
1. 보안
   - 백엔드 API URL이 클라이언트에 노출되지 않음
   - API 키/시크릿을 서버에서만 관리
   - CORS 문제 없음

2. 데이터 가공
   - 백엔드 응답을 프론트엔드에 최적화된 형태로 변환
   - 여러 백엔드 API 호출을 하나로 합칠 수 있음 (aggregation)

3. 타입 안전성
   - API Route에서 응답 타입을 보장
   - 프론트엔드-백엔드 간 계약 역할
```

### API 클라이언트 구조

```
lib/api.ts
+----------------------------------------------+
|                                              |
|  apiClient                                   |
|  ├── cards.list()      -> GET /api/cards     |
|  ├── cards.get(id)     -> GET /api/cards/:id |
|  ├── cards.create(data)-> POST /api/cards    |
|  ├── ledger.list(params) -> GET /api/ledger  |
|  ├── ledger.create(data) -> POST /api/ledger |
|  ├── benefits.search(q)  -> GET /api/benefits|
|  └── vouchers.list()     -> GET /api/vouchers|
|                                              |
|  모든 메서드는 타입화된 응답을 반환            |
|  에러 시 타입화된 ApiError를 throw            |
+----------------------------------------------+
```

### 에러 처리

```
+----------------------------------------------+
|  API 에러 응답 타입                            |
+----------------------------------------------+
|                                              |
|  interface ApiError {                        |
|    status: number;                           |
|    code: string;       // 'CARD_NOT_FOUND'   |
|    message: string;    // 사용자 표시용 메시지  |
|  }                                           |
|                                              |
+----------------------------------------------+

에러 처리 흐름:
  API 호출 실패
    |
    +-- 401 Unauthorized --> 로그인 페이지로 리다이렉트
    +-- 403 Forbidden ----> 권한 없음 안내
    +-- 404 Not Found ----> not-found.tsx 렌더링
    +-- 422 Validation ---> 폼 에러 표시
    +-- 500 Server -------> error.tsx 렌더링 + 재시도 버튼
```

---

## 7. 인증 흐름 (클라이언트)

### Supabase Auth 기반 인증

```
+---------------------------------------------------------------------+
|                        인증 아키텍처                                  |
+---------------------------------------------------------------------+
|                                                                     |
|  +----------+    +-------------+    +-----------+    +----------+   |
|  |          |    |             |    |           |    |          |   |
|  |  Browser |--->| Supabase   |--->| Supabase  |--->| Backend  |   |
|  |          |    | Auth JS    |    | Auth      |    | (Spring) |   |
|  |          |<---| Client     |<---| Server    |<---|          |   |
|  +----------+    +-------------+    +-----------+    +----------+   |
|                                                                     |
|  Access Token  : 메모리에 보관 (변수)                                |
|  Refresh Token : httpOnly 쿠키로 관리                                |
|                                                                     |
+---------------------------------------------------------------------+
```

### 토큰 저장 전략

| 토큰 | 저장 위치 | 이유 |
|------|----------|------|
| Access Token | 메모리 (JS 변수) | XSS 공격 시 탈취 방지 |
| Refresh Token | httpOnly 쿠키 | JS에서 접근 불가, CSRF 방어 가능 |

> localStorage에 토큰을 저장하지 않는다. XSS 공격에 취약하기 때문이다.

### 인증 흐름

```
1. 로그인 흐름

  사용자 ──> 이메일/비밀번호 입력
         ──> Supabase Auth signInWithPassword()
         ──> Access Token (메모리), Refresh Token (쿠키)
         ──> onAuthStateChange 이벤트 발생
         ──> AuthProvider 상태 업데이트
         ──> 대시보드로 리다이렉트


2. 소셜 로그인 흐름 (Google/Kakao)

  사용자 ──> 소셜 로그인 버튼 클릭
         ──> Supabase signInWithOAuth()
         ──> OAuth Provider 페이지로 리다이렉트
         ──> 인증 완료 후 /api/auth/callback으로 리다이렉트
         ──> 토큰 교환 및 저장
         ──> 대시보드로 리다이렉트


3. 토큰 갱신 흐름

  API 호출 ──> 401 응답
           ──> Refresh Token으로 새 Access Token 요청
           ──> 성공: 새 토큰으로 원래 요청 재시도
           ──> 실패: 로그인 페이지로 리다이렉트


4. 로그아웃 흐름

  사용자 ──> 로그아웃 버튼 클릭
         ──> Supabase signOut()
         ──> 메모리의 Access Token 제거
         ──> httpOnly 쿠키 제거
         ──> 랜딩 페이지로 리다이렉트
```

### 보호 라우트 (middleware.ts)

```
middleware.ts 동작 흐름:

  요청 수신
    |
    +-- 공개 경로인가? (/login, /signup, /landing, /api/auth/*)
    |     +-- 예 --> 통과
    |
    +-- 세션 쿠키 존재하는가?
    |     +-- 아니오 --> /login 으로 리다이렉트
    |
    +-- 세션 유효한가? (Supabase 검증)
    |     +-- 아니오 --> 토큰 갱신 시도
    |     |             +-- 성공 --> 통과
    |     |             +-- 실패 --> /login 으로 리다이렉트
    |     +-- 예 --> 통과
    |
    v
  보호된 페이지 렌더링
```

### Auth Context Provider

```
AuthProvider (Client Component)
  |
  |-- Supabase onAuthStateChange 리스너
  |-- user, session 상태 관리
  |-- signIn(), signOut() 메서드 제공
  |
  +-- useAuth() 훅으로 하위 컴포넌트에서 사용
        |
        |-- const { user, signOut } = useAuth();
```

---

## 8. 스타일링 시스템

### 스타일링 스택

```
+-------------------------------------------------------+
|                  스타일링 아키텍처                       |
+-------------------------------------------------------+
|                                                       |
|  Tailwind CSS                                         |
|  └── tailwind.config.ts                               |
|      ├── 디자인 토큰 (색상, 간격, 타이포그래피)          |
|      ├── CSS 변수 기반 테마                             |
|      └── 반응형 브레이크포인트                           |
|                                                       |
|  shadcn/ui                                            |
|  └── components/ui/ 에 직접 설치됨                     |
|      ├── 프로젝트 내부 코드로 존재 (node_modules 아님)  |
|      ├── 필요 시 직접 수정 가능                         |
|      └── CSS 변수로 테마 적용                           |
|                                                       |
|  cn() 유틸리티                                         |
|  └── clsx + tailwind-merge 조합                       |
|      └── 조건부 클래스 결합 시 충돌 방지                 |
|                                                       |
+-------------------------------------------------------+
```

### 사용하지 않는 것

| 기술 | 사용 여부 | 이유 |
|------|----------|------|
| CSS Modules | 사용 안 함 | Tailwind로 충분 |
| styled-components | 사용 안 함 | RSC와 호환 문제, 런타임 비용 |
| inline styles | 사용 안 함 | 유지보수 어려움 |
| Sass/Less | 사용 안 함 | Tailwind가 대체 |
| Emotion | 사용 안 함 | RSC와 호환 문제 |

### 디자인 토큰 (tailwind.config.ts)

```
색상 시스템 (CSS 변수 기반):

  --background       배경색
  --foreground       기본 텍스트
  --primary          주요 액션 (버튼, 링크)
  --secondary        보조 액션
  --muted            비활성 텍스트
  --accent           강조
  --destructive      삭제/경고
  --border           테두리
  --ring             포커스 링

다크 모드:
  .dark 클래스에서 CSS 변수 값을 오버라이드
  shadcn/ui의 기본 다크 모드 지원 활용
```

### 반응형 디자인

```
Mobile-First 접근:

  기본        : 모바일 (< 640px)  ← 390px 기준 설계
  sm (640px)  : 소형 태블릿
  md (768px)  : 태블릿 (사이드바 전환)
  lg (1024px) : 소형 데스크톱
  xl (1280px) : 데스크톱

예시:
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {cards.map(card => <CardItem key={card.id} card={card} />)}
  </div>
```

### 네비게이션 패턴

```
모바일 (< 768px)  → 하단 탭바 (Bottom Navigation Bar)
데스크톱 (≥ 768px) → 좌측 사이드바 (Sidebar)

탭바 구성: 홈 | 카드 | 가계부 | 혜택 | 마이
```

### 디자인 방향 (확정 2026-03-18)

**B + D 믹스**: 클린 라이트 구조 + 로즈/핑크 포인트 컬러

```
배경    : 화이트 (#ffffff, #f8fafc)
포인트  : Rose-500 (#f43f5e)
다크모드: 미지원 (추후 추가 가능)
상세    : docs/design/design-system.md 참조
```

---

## 9. 주요 UI 패턴

### 로딩 상태

```
Suspense 바운더리 + Skeleton 컴포넌트

  +------------------------------------+
  |  loading.tsx (라우트 세그먼트별)     |
  |                                    |
  |  +---------+  +---------+          |
  |  | ██████  |  | ██████  |          |
  |  | ██      |  | ██      |          |
  |  | ████    |  | ████    |          |
  |  +---------+  +---------+          |
  |                                    |
  |  Skeleton 컴포넌트로 레이아웃 유지  |
  +------------------------------------+

계층적 Suspense:
  - 라우트 레벨: loading.tsx
  - 컴포넌트 레벨: <Suspense fallback={<Skeleton />}>
```

### 에러 상태

```
error.tsx 흐름 (라우트 세그먼트별):

  에러 발생
    |
    v
  error.tsx 렌더링
  +------------------------------------+
  |                                    |
  |   [!] 오류가 발생했습니다           |
  |                                    |
  |   데이터를 불러오는 중 문제가       |
  |   발생했습니다.                     |
  |                                    |
  |   [ 다시 시도 ]  [ 홈으로 ]        |
  |                                    |
  +------------------------------------+

  - reset() 함수로 재시도 가능
  - 에러가 상위 레이아웃으로 전파되지 않음
  - global-error.tsx: root layout 에러 처리
```

### 빈 상태 (Empty State)

```
  +------------------------------------+
  |                                    |
  |         [일러스트레이션]            |
  |                                    |
  |    등록된 카드가 없습니다           |
  |                                    |
  |    카드를 추가하면 혜택을           |
  |    한눈에 확인할 수 있어요         |
  |                                    |
  |    [ + 카드 추가하기 ]             |
  |                                    |
  +------------------------------------+
```

### 주요 라이브러리별 활용

| 패턴 | 라이브러리 | 용도 |
|------|-----------|------|
| Toast 알림 | sonner | 성공/에러/정보 알림 |
| 모달/다이얼로그 | shadcn Dialog | 확인, 폼 입력 등 |
| 폼 | React Hook Form + Zod + shadcn Form | 카드 추가, 가계부 입력 등 |
| 차트 | recharts | 대시보드 소비 차트, 카테고리 분포 |
| 테이블 | @tanstack/react-table + shadcn Table | 가계부 목록, 거래 내역 |
| 날짜 선택 | shadcn Calendar + date-fns | 가계부 날짜 필터 |

### 폼 처리 흐름

```
  사용자 입력
      |
      v
  React Hook Form (실시간 상태 관리)
      |
      v
  Zod 스키마 검증
      |
      +-- 유효하지 않음 --> 인라인 에러 메시지 표시
      |
      +-- 유효함 --> onSubmit 호출
                       |
                       v
                  API 호출 (또는 Server Action)
                       |
                       +-- 성공 --> Toast 알림 + 리다이렉트/갱신
                       |
                       +-- 실패 --> 에러 Toast 또는 인라인 에러
```

---

## 10. 성능 최적화

### 이미지 최적화

```
next/image 사용:

  +-------------------------------------------+
  |  <Image>                                  |
  |  ├── 자동 WebP/AVIF 변환                  |
  |  ├── 반응형 sizes 자동 생성               |
  |  ├── lazy loading 기본 적용               |
  |  ├── CLS(Cumulative Layout Shift) 방지    |
  |  └── blur placeholder 지원               |
  +-------------------------------------------+

  카드 이미지, 로고 등 모든 이미지에 next/image 사용
```

### 폰트 최적화

```
next/font 사용:

  - 빌드 시 폰트 파일 self-hosting
  - layout shift 방지 (font-display: swap)
  - Google Fonts 외부 요청 제거
  - 한글 폰트: Pretendard 또는 Noto Sans KR
```

### 코드 분할

```
  정적 임포트 (기본):
    대부분의 컴포넌트는 정적 임포트

  동적 임포트 (heavy 컴포넌트):
    - recharts 차트 컴포넌트
    - 리치 텍스트 에디터
    - 큰 모달 컨텐츠

    const MonthlyChart = dynamic(
      () => import('@/components/dashboard/monthly-chart'),
      { loading: () => <Skeleton /> }
    );
```

### 성능 최적화 체크리스트

| 항목 | 도구/방법 | 적용 대상 |
|------|----------|----------|
| 이미지 최적화 | next/image | 모든 이미지 |
| 폰트 최적화 | next/font | 글로벌 폰트 |
| 번들 분석 | @next/bundle-analyzer | 빌드 시 |
| 코드 분할 | dynamic() import | 차트, 무거운 컴포넌트 |
| 프리페칭 | Link prefetch | 네비게이션 링크 |
| RSC | 서버 컴포넌트 기본 | 인터랙션 없는 컴포넌트 |
| Streaming | Suspense boundaries | 대시보드 |
| 캐싱 | fetch cache, revalidate | API 응답 |

### 번들 크기 관리

```
목표: First Load JS < 100KB (gzipped)

모니터링:
  bun run build    --> 페이지별 번들 크기 확인
  @next/bundle-analyzer --> 상세 번들 분석

주의:
  - date-fns는 트리쉐이킹 됨 (moment.js 사용 금지)
  - lodash 대신 개별 함수 사용 또는 네이티브 JS
  - 불필요한 polyfill 제거
```

---

## 11. 테스트 전략 (계획)

### 테스트 피라미드

```
          /\
         /  \
        / E2E \          Playwright
       / (소수) \         핵심 사용자 흐름만
      /----------\
     /  Component  \     Testing Library
    /   (중간)      \    주요 컴포넌트 인터랙션
   /----------------\
  /    Unit Tests     \  Vitest
 /     (다수)          \ 유틸리티, 훅, 비즈니스 로직
/______________________\
```

### 테스트 도구

| 유형 | 도구 | 대상 |
|------|------|------|
| Unit | Vitest | lib/, hooks/, constants/ |
| Component | Vitest + Testing Library | components/ |
| E2E | Playwright | 핵심 사용자 흐름 |

### 테스트 대상 우선순위

```
높음:
  - lib/api.ts (API 클라이언트)
  - lib/format.ts (포맷 유틸리티)
  - hooks/ (커스텀 훅)
  - Zod 스키마 (폼 유효성 검증)

중간:
  - 도메인 컴포넌트 (CardList, LedgerTable 등)
  - 폼 컴포넌트 (제출, 유효성 검증 흐름)

E2E (핵심 흐름):
  - 로그인 -> 대시보드 진입
  - 카드 추가 -> 혜택 확인
  - 가계부 항목 추가 -> 목록 확인
  - 혜택 검색 -> 결과 표시
```

---

## 부록: 의존성 목록

### 핵심 의존성

```
dependencies:
  next                    15.x
  react                   19.x
  react-dom               19.x
  @supabase/supabase-js   최신
  react-hook-form         최신
  @hookform/resolvers     최신
  zod                     최신
  recharts                최신
  @tanstack/react-table   최신
  date-fns                최신
  sonner                  최신
  clsx                    최신
  tailwind-merge          최신

devDependencies:
  typescript              5.x
  tailwindcss             4.x
  @next/bundle-analyzer   최신
  vitest                  최신 (계획)
  @testing-library/react  최신 (계획)
  playwright              최신 (계획)
```

---

> 이 문서는 CardWise 프론트엔드 아키텍처의 기술적 의사결정과 구조를 기록한다.
> 프로젝트 진행에 따라 지속적으로 업데이트한다.
