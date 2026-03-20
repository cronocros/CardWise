---

## 0. 최근 디자인 및 퍼블리싱 작업 요약 (2026-03-20)

### 주요 성과
- **마스코트 브랜드화**: `App Asset Sheet: Kkulsori`를 제작하여 5가지 감정/동작 포즈와 전용 아이콘셋을 확립했습니다.
- **에셋 자동화**: 시트 이미지에서 개별 투명 PNG를 자동으로 추출하는 빌드 스크립트(`extract_assets.mjs`)를 구현하여 에셋 관리 효율성을 높였습니다.
- **로그인 경험 고도화**: `Rose Glass` 테마에 마스코트 캐릭터를 결합하여 브랜드 정체성을 강화하고, Floating 애니메이션과 `next/image` 최적화를 적용했습니다.
- **디자인 아키텍처 문서화**: UX 원칙, 디자인 가이드, AI 프롬프트를 체계적으로 정리하여 (`docs/design/`) 일관된 개발 환경을 구축했습니다.

### 퍼블리싱 내역
- [x] 로그인 페이지: 마스코트 로고 및 배경 장식 요소 추가
- [x] 전용 아이콘셋 추출 완료 (18종)
- [x] 마스코트 포즈 추출 완료 (5종)
- [x] 디자인 시스템 문서 업데이트 및 프롬프트 가이드 제작

## 1. 디자인 방향 (시안 혼합 전략)

세 가지 시안의 강점을 맥락에 따라 선택 적용한다.

| 시안 | 스타일 | 적용 컨텍스트 |
|------|--------|-------------|
| **Rose Glass** (시안 A) | 다크 글래스모피즘, Blob 배경 | 스플래시 화면, 실적 달성 모달, 특별 이벤트 화면 |
| **Rose Blossom** (시안 B) | 소프트 화이트+핑크, 카드 라이트 | **기본 앱 UI** (대부분의 화면) |
| **Rose Minimal** (구 시안) | 클린 라인, 섀도 없음 | 설정, 리스트 중심 화면 |

### 핵심 원칙
- **모바일 앱 우선**: 390px 기준, 하단 탭바 네비게이션
- **주 배경**: `rose-50 (#fff1f2)` 라이트 베이스 (Rose Blossom 기준)
- **포인트 컬러**: `rose-400 (#fb7185)` — 딱딱하지 않은 부드러운 핑크
- **다크 글래스**: 달성 모달·특별 화면에서만 활성화
- **마스코트**: 허니 배저 캐릭터 전 화면 일관 적용

---

## 2. 색상 토큰

### Primary (Rose)

| 토큰 | 값 | 용도 |
|------|----|------|
| `primary-50`  | `#fff1f2` | 페이지 배경, 섹션 배경 tint |
| `primary-100` | `#ffe4e6` | hover 상태, 선택 항목 배경 |
| `primary-200` | `#fecdd3` | border, 구분선, 카드 테두리 |
| `primary-300` | `#fda4af` | 진행 바 그라디언트 시작점 |
| `primary-400` | `#fb7185` | **메인 포인트 컬러** (버튼, 액티브, 강조) |
| `primary-500` | `#f43f5e` | hover/pressed, 강조 텍스트 |
| `primary-600` | `#e11d48` | 다크모드 포인트, 글래스 배경 accent |
| `primary-700` | `#be123c` | 다크 글래스 배경 blob 색상 |
| `primary-900` | `#9f1239` | 다크 글래스 배경 blob 깊은 색상 |

### Neutral (Gray)

| 토큰 | 값 | 용도 |
|------|----|------|
| `neutral-0`   | `#ffffff` | 카드 배경, 컨테이너 |
| `neutral-50`  | `#f8fafc` | 서브 섹션 배경 |
| `neutral-100` | `#f1f5f9` | 비활성 배경 |
| `neutral-200` | `#e2e8f0` | border, divider |
| `neutral-400` | `#94a3b8` | placeholder, 비활성 아이콘 |
| `neutral-500` | `#64748b` | 보조 텍스트 |
| `neutral-700` | `#334155` | 본문 텍스트 |
| `neutral-900` | `#0f172a` | 제목, 강조 텍스트 |

### 글래스모피즘 토큰 (다크 화면 전용)

| 토큰 | 값 | 용도 |
|------|----|------|
| `glass-bg` | `rgba(255,255,255,0.12)` | 글래스 카드 배경 |
| `glass-border` | `rgba(255,255,255,0.20)` | 글래스 카드 테두리 |
| `glass-shadow` | `0 4px 20px rgba(251,113,133,0.12)` | 글래스 카드 그림자 |
| `dark-base` | `#1a0010` | 다크 글래스 페이지 배경 |

### Semantic

| 토큰 | 값 | 용도 |
|------|----|------|
| `success`    | `#10b981` | 혜택 적용, 포인트 적립, 구간 달성 |
| `warning`    | `#f59e0b` | 실적 주의, 만료 임박 |
| `error`      | `#ef4444` | 에러, 지출 금액 |
| `info`       | `#3b82f6` | 안내, 카드사 정보 |

### 카드 그라디언트 팔레트

카드 썸네일에 사용하는 그라디언트 프리셋 (카드사/카드 종류별 자동 배정):

| 프리셋 | 값 |
|--------|----|
| Rose   | `linear-gradient(135deg, #f43f5e, #f97316)` |
| Ocean  | `linear-gradient(135deg, #1e40af, #3b82f6)` |
| Forest | `linear-gradient(135deg, #065f46, #10b981)` |
| Violet | `linear-gradient(135deg, #6d28d9, #a78bfa)` |
| Gold   | `linear-gradient(135deg, #b45309, #fbbf24)` |
| Slate  | `linear-gradient(135deg, #1e293b, #475569)` |

---

## 3. 타이포그래피

### 폰트

```
기본 폰트: Pretendard (next/font으로 self-hosting)
폴백:     'Noto Sans KR', -apple-system, sans-serif
```

### 스케일

| 토큰 | size / weight | 용도 |
|------|--------------|------|
| `display`     | 28px / 700 | 대시보드 큰 금액 |
| `title-lg`    | 22px / 700 | 페이지 제목 |
| `title-md`    | 18px / 600 | 섹션 제목 |
| `title-sm`    | 16px / 600 | 카드 제목, 서브섹션 |
| `body-lg`     | 15px / 400 | 본문 |
| `body-md`     | 14px / 400 | 기본 본문 |
| `body-sm`     | 13px / 400 | 보조 설명 |
| `caption`     | 12px / 400 | 라벨, 날짜 |
| `overline`    | 11px / 500 | 카테고리 뱃지 |

> **무게 원칙**: 딱딱하지 않도록 Bold(700) 사용 최소화. 주요 숫자/금액만 700, 일반 제목은 SemiBold(600) 사용.

---

## 4. 레이아웃

### 모바일 뷰포트 기준

```
기준 너비  : 390px (iPhone 15)
최소 너비  : 360px
최대 너비  : 430px (모바일 상한)
데스크톱   : max-width 480px 중앙 정렬 또는 2컬럼 레이아웃
```

### 네비게이션 패턴

```
모바일 (< 768px)   → 하단 탭바 (Bottom Navigation Bar)
데스크톱 (≥ 768px) → 좌측 사이드바 240px (Sidebar)
```

### 하단 탭바 구성

| 탭 | 아이콘 | 라우트 |
|----|--------|--------|
| 홈 | House | `/dashboard` |
| 카드 | CreditCard | `/cards` |
| 가계부 | BookOpen | `/ledger` |
| 혜택 | Search | `/benefits` |
| 마이 | User | `/settings` |

### 간격 시스템

```
spacing-1  : 4px
spacing-2  : 8px
spacing-3  : 12px
spacing-4  : 16px   ← 기본 패딩
spacing-5  : 20px
spacing-6  : 24px
spacing-8  : 32px
spacing-10 : 40px
```

### 반응형 브레이크포인트

```
mobile   : 기본 (< 640px)
sm       : 640px   소형 태블릿
md       : 768px   태블릿 (사이드바 전환)
lg       : 1024px  데스크톱
xl       : 1280px  와이드 데스크톱
```

---

## 5. 마스코트 — 허니 배저

### 캐릭터 특징

- **외형**: 흑백 투톤 (하체 검정, 등/머리 흰색). 통통한 체형, 큰 눈.
- **구현**: SVG 인라인 (이미지 파일 없이 코드로 렌더링)
- **레퍼런스**: `design-preview/sample-a-rose-glass.html`, `sample-b-rose-blossom.html` 참조

### 포즈 3종

| 포즈 | 사용 위치 | 트리거 |
|------|----------|--------|
| **Waving** (손 흔들기) | 헤더 인사말 옆 아바타 (40px) | 항상 표시 |
| **Celebrating** (양팔 번쩍) | 실적 구간 달성 모달 | 구간 달성 시 |
| **Thinking** (턱 짚기) | AI 추천 로딩, 빈 상태 | 데이터 없음 / AI 처리 중 |

### 등장 위치

```
헤더          : Waving 포즈 40px 아바타 (rose-100 원형 배경)
실적 구간 트랙 : 현재 달성 위치에 22px 미니 아바타 이동
달성 모달     : Celebrating 포즈 80px + bounce 애니메이션
AI 추천       : Thinking 포즈 60px + 말풍선
빈 상태       : Thinking 포즈 64px + 안내 메시지
```

### 구현 가이드

```tsx
// 컴포넌트 구조
<MascotAvatar pose="waving" size={40} />
<MascotAvatar pose="celebrating" size={80} animate />
<MascotAvatar pose="thinking" size={60} />
```

---

## 6. 실적 구간 UI 패턴

### 구간 정의 (DB 기반, 하드코딩 금지)

```
시작(0원) → 1구간(30만원) → 2구간(50만원) → 3구간(100만원)
```

### 트랙 스타일 (Rose Blossom 기준, 기본)

```
트랙 바 배경  : rose-200 (#fecdd3), border-radius 9999px
트랙 바 채움  : linear-gradient(90deg, rose-300 → rose-400)
노드 (미달성) : white 원 + rose-200 border 2px
노드 (달성)   : rose-400 solid 원 + 체크 아이콘
노드 크기     : 12px (미달성) / 14px (달성)
마스코트 위치 : 현재 진행률 % 위치에 absolute 배치
```

```css
/* 트랙 채움 너비 계산 */
width: calc((currentSpend / maxTier) * 100%)
```

### 달성 뱃지

각 구간 노드 하단에 혜택 요약 표시:
```
● 30만 달성  →  스타벅스 30% 할인 ✓
● 50만 달성  →  주유 5% 캐시백   ✓
○ 100만 목표 →  마일리지 3,000점  (D-18만)
```

### 달성 모달 트리거

실적이 구간 임계값을 초과하는 순간:
1. 화면 하단에서 축하 모달 slide-up
2. Celebrating 마스코트 + bounce
3. 컨페티 30개 랜덤 위치 fall
4. "다음 목표: ₩XXX만" 안내

---

## 7. 차트 / 비주얼 컴포넌트

모든 차트는 **외부 라이브러리 없이 SVG + CSS 애니메이션**으로 구현한다.

### 7.1 버킷 (실린더) 차트

월간 목표 대비 달성률을 물이 차오르는 원통으로 표현.

```
형태    : 원통형 (border-radius 상단 50% / 하단 50%)
높이    : 80px
채움    : linear-gradient(180deg, rose-300 → rose-400)
애니메이션: 탭 진입 시 0% → 실제% 1.5초 ease-out
물결 효과: ::before pseudo-element, translateX 8s linear infinite
라벨    : 상단 항목명 (할인/적립), 하단 달성 금액
```

```tsx
<BucketChart label="할인" percent={82} amount={12300} goal={15000} />
<BucketChart label="적립" percent={60} amount={8100} goal={13500} />
```

### 7.2 도넛 차트 (카테고리 지출)

```
구현    : SVG <circle> stroke-dasharray
반지름  : 40px
중앙    : 총 금액 표시 (bold)
세그먼트: 최대 5개 카테고리 (나머지 → 기타)
색상    : rose-400, #60a5fa(파랑), #34d399(초록), #fbbf24(노랑), neutral-400
애니메이션: 탭 진입 시 stroke-dashoffset 순차 등장 (staggered 0.1s)
```

### 7.3 라디얼 게이지 (카드별 실적)

```
구현    : SVG arc (반원형)
범위    : 0 ~ 100만원 (max 카드 최고 구간)
채움    : rose-400 gradient
배경    : rose-100
수치    : 중앙 % 표시
```

### 7.4 세로 바 차트 (주간 지출)

```
막대 수  : 7개 (Mon ~ Sun)
색상    : 오늘 날짜 rose-400 / 나머지 rose-200
애니메이션: 탭 진입 시 height 0 → 실제값 staggered 0.05s 간격
```

### 7.5 면적 그래프 (월별 트렌드)

```
구현    : SVG <polyline> + 채움 영역 <polygon>
포인트  : 6개월 데이터
선 색상 : rose-400, stroke-width 2
채움    : rose-50 ~ transparent linear-gradient
```

### 7.6 히트맵 (요일 × 시간대)

```
그리드  : 7열(요일) × 4행(시간대: 아침/점심/저녁/밤)
색상 강도: 5단계 (neutral-100 → rose-400)
셀 크기 : 32px × 32px
```

---

## 8. 컴포넌트 가이드라인

### 버튼

| 종류 | 스타일 | 용도 |
|------|--------|------|
| Primary | `bg-primary-400 text-white rounded-xl` | 주요 액션 |
| Secondary | `bg-primary-50 text-primary-500 rounded-xl` | 보조 액션 |
| Ghost | `text-primary-400 border border-primary-200` | 취소, 닫기 |
| Destructive | `bg-error text-white` | 삭제 |

- 높이: 48px (터치 타겟 최소 44px 준수)
- 모서리: `rounded-xl` (12px)
- **Ripple 효과**: 클릭 위치 기준 원형 파문 (모든 버튼 공통)

### 카드 컨테이너 (라이트)

```
배경    : white
모서리  : rounded-2xl (16px)
그림자  : 0 1px 3px rgba(0,0,0,0.06)
border  : 1.5px solid rose-200 (#fecdd3)
패딩    : p-4 (16px)
hover   : border-color rose-300, shadow 강도 소폭 증가
```

### 카드 컨테이너 (글래스 — 다크 화면 전용)

```
배경    : rgba(255,255,255,0.12)
모서리  : rounded-2xl
border  : 1px solid rgba(255,255,255,0.20)
그림자  : 0 4px 20px rgba(251,113,133,0.12)
backdrop-filter: blur(12px)
```

### 카드 썸네일 (신용카드)

```
비율    : 85.6mm × 53.98mm → aspect-ratio 1.586:1
모서리  : rounded-2xl
높이    : 180px (모바일 기준)
내용    : 카드사명 + 카드명 + 마스킹번호 (•••• •••• •••• XXXX) + 유효기간
그라디언트: 팔레트에서 카드별 자동 배정
hover   : translateY(-8px) + glow 증가 (200ms ease)
```

### 입력 필드

```
높이    : 48px
모서리  : rounded-xl
border  : border-primary-200, focus:border-primary-400
배경    : white
```

### 바텀시트 (Bottom Sheet)

모달 대신 모바일에서는 바텀시트 우선:

```
배경    : white
모서리  : rounded-t-3xl (상단만)
드래그 핸들: 상단 중앙 w-10 h-1 bg-neutral-200
등장    : translateY(100%) → 0 300ms ease-out
백드롭  : rgba(0,0,0,0.4) blur(4px)
```

---

## 9. 인터랙션 패턴 (시안 혼합 확정 목록)

### 9.1 잔액 마스킹 토글 (구 시안 → 전 시안 공통 적용)

눈 아이콘 클릭 시 금액 ↔ `₩•••,•••` 전환.

```
상태 전환: opacity fade 150ms
마스킹 표시: '₩•••,•••' (letter-spacing 4px)
아이콘: lucide Eye / EyeOff
```

### 9.2 바우처 3D 플립 (구 시안 → 바우처 화면 적용)

바우처 카드를 탭하면 앞면(정보) → 뒷면(바코드/사용법)으로 전환.

```css
transform-style: preserve-3d;
transition: transform 0.5s ease;
/* 뒷면 */
transform: rotateY(180deg);
```

### 9.3 실적 달성 모달 (시안 B)

```
트리거  : 결제 후 실적 임계값 초과 시
등장    : scale(0.9) + opacity 0 → 정상 300ms cubic-bezier(0.34,1.56,0.64,1)
내용    : 마스코트 Celebrating + 달성 구간명 + 활성화된 혜택 + 다음 목표
컨페티  : 30개, 랜덤 색상(rose/gold/green), 2초간 fall
```

### 9.4 배경 Blob 애니메이션 (시안 A — 다크 화면 전용)

```css
/* blob 3개, 각 10~18초 주기 */
@keyframes blobMove {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, -20px) scale(1.08); }
}
/* opacity: 0.35, filter: blur(60px) */
```

### 9.5 탭 전환 애니메이션

```
효과    : fade + translateY(8px → 0) 200ms ease-out
방향    : 항상 동일 (좌우 슬라이드 없음 — 탭 순서 비선형 가능)
```

### 9.6 리스트 아이템 Hover

```css
/* 좌측 rose border slide-in */
&::before {
  content: '';
  width: 3px;
  height: 0;
  background: rose-400;
  transition: height 150ms ease;
}
&:hover::before { height: 100%; }
```

---

## 10. 아이콘

**라이브러리**: `lucide-react`

```
크기 기준:
  탭바 아이콘    : 22px
  리스트 아이콘  : 20px
  인라인 아이콘  : 16px
  대형 아이콘    : 32px (empty state 등)

stroke-width: 1.75 (기본값 유지)
```

---

## 11. 애니메이션 기준

```
기본 트랜지션  : transition-all duration-200 ease-out
카드 호버      : translateY(-4px) + shadow 증가
페이지 전환    : fade + slide-up (Next.js View Transitions)
스켈레톤       : animate-pulse (Tailwind 기본)
바텀시트 등장  : slide-up 300ms ease-out
숫자 카운트업  : 탭 진입 시 0 → 실제값, 1s ease-out quad
진행 바        : 탭 진입 시 0% → 실제%, staggered 0.1s
```

---

## 12. 화면별 테마 적용 기준

| 화면 | 테마 | 근거 |
|------|------|------|
| 대시보드 홈 | Rose Blossom (라이트) | 일상적 사용 화면 |
| 카드 목록 | Rose Blossom (라이트) | 정보 탐색 중심 |
| 가계부/결제 내역 | Rose Minimal (클린) | 데이터 밀도 높음 |
| 혜택 검색 | Rose Blossom (라이트) | — |
| 바우처 | Rose Blossom + 3D flip | 구 시안 플립 패턴 |
| 통계/분석 | Rose Blossom (라이트) | — |
| 실적 달성 모달 | Rose Glass (다크) | 특별한 순간 강조 |
| 스플래시 / 온보딩 | Rose Glass (다크) | 브랜드 임팩트 |
| 설정 | Rose Minimal (클린) | 기능 중심 |

---

## 13. 적용 우선순위

1. **shadcn/ui 테마 오버라이드**: `globals.css`의 CSS 변수를 Rose-400 계열로 교체
2. **마스코트 SVG 컴포넌트**: Waving / Celebrating / Thinking 3종
3. **하단 탭바**: 모바일 전용 컴포넌트 우선 구현
4. **실적 구간 트랙**: `PerformanceTierTrack` 컴포넌트
5. **버킷 차트**: `BucketChart` 컴포넌트
6. **도넛 차트**: `DonutChart` 컴포넌트
7. **카드 썸네일**: 그라디언트 팔레트 자동 배정 로직
8. **잔액 마스킹 토글**: `BalanceDisplay` 컴포넌트
9. **달성 모달**: `TierAchievementModal` 컴포넌트 (글래스 다크 테마)
10. **바우처 플립 카드**: `VoucherFlipCard` 컴포넌트

---

## 14. 디자인 레퍼런스 파일

| 파일 | 설명 |
|------|------|
| `design-preview/sample-a-rose-glass.html` | Rose Glass 다크 시안 (글래스모피즘, 버킷/도넛 차트, 달성 모달) |
| `design-preview/sample-b-rose-blossom.html` | Rose Blossom 라이트 시안 (소프트 핑크, 바우처, 가계부) |
| `design-preview/sample-b-rose-minimal.html` | Rose Minimal 구 시안 (마스킹 토글, 3D flip, 실적 게이지) |
