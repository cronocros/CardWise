# CardWise — 디자인 AI 빠른 프롬프트 모음

> `ui-design-prompts.md` 빠른 참조 버전
> 복사해서 바로 던지는 용도. Midjourney / DALL-E / Firefly / v0.dev / Bolt / Lovable / GPT-4o 등에 사용.
> 상세 스펙이 필요하면 `ui-design-prompts.md` 참조.
> 최종 수정: 2026-03-18

---

## ✦ 한국어 프롬프트

---

### [1줄] 이미지 생성 AI용 (Midjourney, Firefly, DALL-E)

```
한국 신용카드 혜택 관리 앱 CardWise의 모바일 UI 디자인. 소프트 로즈 핑크(#fb7185) 톤앤매너, 귀엽고 통통한 허니 배저 마스코트, 실적 구간 트랙(30만/50만/100만원), 버킷 차트와 도넛 차트, 부드러운 화이트 배경. 모바일 앱 스타일, 친근하고 세련된 핀테크 디자인.
```

---

### [단락] UI 생성 AI용 (v0.dev, Bolt, Lovable, Claude)

```
CardWise — 한국 신용카드 혜택 관리 모바일 앱을 디자인해줘.

• 톤앤매너: 소프트 로즈 핑크 계열. 메인 컬러 #fb7185, 배경 #fff1f2. 딱딱하지 않게 부드럽고 따뜻한 느낌.
• 마스코트: 흑백 투톤 허니 배저 캐릭터 (통통하고 귀여운 스타일). 헤더 인사말 옆에 손 흔드는 포즈로 등장.
• 핵심 UI 요소:
  - 실적 구간 트랙: 시작 → 30만원 → 50만원 → 100만원 마일스톤, 달성 구간은 로즈 그라디언트 채움
  - 버킷(실린더) 차트: 물이 차오르는 애니메이션으로 목표 달성률 표시
  - 도넛 차트: 카테고리별 지출 비율
• 레이아웃: 모바일 우선(390px), 하단 탭바 5개 (홈/카드/가계부/혜택/마이)
• 특수 화면: 실적 달성 시 다크 글래스모피즘 스타일 모달 + 컨페티
• 폰트: Pretendard, 아이콘: lucide-react
```

---

### [시스템 컨텍스트] GPT·Claude에 역할 부여용

```
당신은 CardWise 앱의 UI/UX 디자이너입니다.

CardWise는 한국 신용카드/체크카드 혜택을 관리하는 모바일 앱입니다.

디자인 원칙:
- 주 배경은 rose-50(#fff1f2), 포인트 컬러는 rose-400(#fb7185). 부드럽고 친근한 핑크 톤.
- 허니 배저 캐릭터(흑백 투톤, 귀여운 체형)가 마스코트. 상황별 3가지 포즈: 인사(Waving), 축하(Celebrating), 생각(Thinking).
- 실적 구간(30만/50만/100만원) 트랙 UI, 버킷 차트, 도넛 차트를 핵심 비주얼로 사용.
- 일반 화면은 소프트 라이트 스타일, 실적 달성·스플래시 등 특별 화면만 다크 글래스모피즘.
- 모바일 앱 우선(390px 기준). 딱딱하지 않고 따뜻한 핀테크 느낌.

이 원칙을 유지하며 요청된 화면이나 컴포넌트를 디자인하세요.
```

---

### [화면별] 각 화면 1줄 요약 (추가 컨텍스트로 붙여넣기)

| 화면 | 1줄 컨텍스트 |
|------|-------------|
| 대시보드 | 허니 배저 인사, 잔액 마스킹 토글, 실적 구간 트랙, 버킷 차트, 도넛 카테고리 차트 |
| 카드 목록 | 그라디언트 카드 썸네일(1.586:1), 라디얼 실적 게이지, 혜택 뱃지 |
| 가계부 | 날짜별 그룹 거래 내역, 카테고리 아이콘, 월별 면적 그래프, FAB 버튼 |
| 혜택 검색 | AI 검색바(sparkle 아이콘), 카테고리 필터 칩, 허니 배저 AI 추천 말풍선 |
| 바우처 | 3D 플립 카드(앞:정보/뒤:사용법), 잔여 수량 도트, 만료 임박 경고 |
| 실적 달성 모달 | 다크 글래스모피즘, Celebrating 허니 배저 bounce, 컨페티 30개, 다음 목표 안내 |

---

## ✦ English Prompts

---

### [1-Line] Image Generation AI (Midjourney, Firefly, DALL-E)

```
Mobile UI design for CardWise, a Korean credit card benefits management app. Soft rose-pink tone (#fb7185), cute chubby honey badger mascot (black-and-white), performance tier track (300K/500K/1M KRW milestones), bucket chart and donut chart, white background. Friendly modern fintech aesthetic, mobile app style.
```

---

### [Paragraph] UI Generation AI (v0.dev, Bolt, Lovable, Claude)

```
Design CardWise — a Korean credit card benefits management mobile app.

• Tone: Soft rose-pink palette. Main color #fb7185, background #fff1f2. Warm, friendly, not corporate.
• Mascot: Black-and-white honey badger character (chubby, cute). Appears in the header greeting area in a waving pose.
• Key UI elements:
  - Performance tier track: Start → ₩300K → ₩500K → ₩1M milestones with rose gradient fill on achieved tiers
  - Bucket (cylinder) chart: Water-filling animation to show goal achievement rate
  - Donut chart: Spending breakdown by category
• Layout: Mobile-first (390px), bottom tab bar with 5 tabs (Home / Cards / Ledger / Benefits / My)
• Special screen: Dark glassmorphism modal with confetti when a performance tier is achieved
• Font: Pretendard, Icons: lucide-react
```

---

### [System Context] Role prompt for GPT / Claude

```
You are the UI/UX designer for CardWise, a Korean mobile app for managing credit and debit card benefits.

Design principles:
- Base background rose-50 (#fff1f2), primary accent rose-400 (#fb7185). Soft, warm, approachable pink tone.
- Honey badger mascot (black-and-white, chubby, cute) with 3 contextual poses: Waving (header greeting), Celebrating (tier achievement modal), Thinking (AI loading / empty state).
- Performance tier track (₩300K / ₩500K / ₩1M), bucket chart, and donut chart are the primary visual components.
- Standard screens use soft light style. Only special moments (tier achievement, splash, onboarding) use dark glassmorphism.
- Mobile-first (390px base). Warm fintech feel — think Toss meets Monzo with a mascot.

Apply these principles consistently when designing any screen or component requested.
```

---

### [Per-Screen] One-liner context tags

| Screen | Context |
|--------|---------|
| Dashboard | Honey badger greeting, balance mask toggle, tier track, bucket chart, donut category chart |
| Card List | Gradient card thumbnails (1.586:1), radial performance gauge, benefit badges |
| Ledger | Date-grouped transactions, category icons, monthly area graph, FAB button |
| Benefit Search | AI search bar (sparkle icon), category filter chips, honey badger AI tip bubble |
| Vouchers | 3D flip cards (front: info / back: usage steps), quantity dots, expiry warning |
| Tier Achievement Modal | Dark glassmorphism, Celebrating honey badger bounce, 30 confetti pieces, next goal callout |

---

## ✦ 도구별 추천 프롬프트 조합

| 도구 | 추천 조합 |
|------|----------|
| Midjourney / Firefly | 1줄 프롬프트 → 화면별 컨텍스트 추가 |
| v0.dev / Bolt / Lovable | 단락 프롬프트 전체 붙여넣기 → 화면별 1줄 추가 |
| GPT-4o / Claude | 시스템 컨텍스트를 system prompt로 → 화면별 요청 |
| Figma AI (Make Designs) | 단락 프롬프트 → 컴포넌트명 지정 ("Generate: PerformanceTierTrack component") |
| Cursor / Claude Code | `ui-design-prompts.md`의 섹션 3 (Component-Level Prompts) 사용 |
