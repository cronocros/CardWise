# CardWise UI Design Prompts

> A curated collection of prompts for generating CardWise UI design assets using AI tools
> (Claude, Midjourney, v0.dev, Figma AI, GPT-4o, etc.)
>
> Last updated: 2026-03-18

---

## How to Use

- Copy the desired prompt and paste it into your AI tool of choice.
- For **v0.dev**: Use the "Screen" or "Component" prompts directly.
- For **Midjourney / image generators**: Use the "Visual Style" or "Illustration" prompts.
- For **Claude Code / Cursor**: Prefix with "Create a React component: " or "Write HTML/CSS: ".
- Adjust placeholder values (card names, amounts, etc.) as needed.

---

## 1. Brand Identity Prompt

### 1.1 Full Brand Identity

```
Design a mobile fintech app called "CardWise" — a Korean credit/debit card benefit management platform.

Brand personality: trustworthy, modern, approachable, feminine-leaning but gender-neutral.

Visual identity:
- Primary color: Rose-500 (#f43f5e) — used for CTAs, active states, key highlights
- Background: Pure white (#ffffff) with light gray (#f8fafc) for section separation
- Text: Near-black (#0f172a) for headings, slate-500 (#64748b) for secondary text
- Accent gradient: linear-gradient(135deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)
- Card gradients: Rose (default), Ocean (#0ea5e9→#38bdf8), Forest (#059669→#34d399), Violet (#7c3aed→#a78bfa)
- Border radius: 16px for cards, 12px for buttons, 8px for inputs
- Shadow: subtle (0 2px 8px rgba(0,0,0,0.08)) for cards, stronger (0 8px 24px rgba(244,63,94,0.2)) for primary buttons
- Font: Pretendard (Korean), system-ui fallback
- Icons: Lucide icon set, 20-24px, stroke-width 1.5

Overall feel: Toss app × Monzo × a hint of Pinterest — clean, airy, delightful micro-interactions.
```

### 1.2 Design Tokens Reference

```
Design the following CSS custom properties for CardWise:

Colors:
  --rose-50: #fff1f2
  --rose-100: #ffe4e6
  --rose-200: #fecdd3
  --rose-400: #fb7185
  --rose-500: #f43f5e  (primary brand)
  --rose-600: #e11d48
  --rose-700: #be123c
  --neutral-0: #ffffff
  --neutral-50: #f8fafc
  --neutral-100: #f1f5f9
  --neutral-200: #e2e8f0
  --neutral-400: #94a3b8
  --neutral-500: #64748b
  --neutral-700: #334155
  --neutral-900: #0f172a
  --success: #10b981
  --warning: #f59e0b
  --error: #ef4444
  --info: #3b82f6

Typography scale (Pretendard):
  --text-display: 28px / 700 / -0.5px
  --text-title-lg: 22px / 700 / -0.3px
  --text-title-md: 18px / 600 / -0.2px
  --text-title-sm: 16px / 600 / 0
  --text-body-lg: 16px / 400 / 0
  --text-body-md: 14px / 400 / 0
  --text-body-sm: 13px / 400 / 0
  --text-caption: 12px / 400 / 0.2px

Spacing (8-based):
  4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px
```

---

## 2. Screen Prompts

### 2.1 Dashboard / Home Screen

```
Design a mobile app dashboard screen for "CardWise" (Korean card benefit manager).

Layout (390px × 844px, iOS safe area):
- Status bar (20px)
- Header: "안녕하세요, 김민지님 👋" + notification bell icon (right)
- Balance card section:
  - White card with subtle rose shadow
  - Label: "이번달 지출" / Amount: "₩1,234,800" in large bold text
  - Sub-label: "전월 대비 -₩45,000 (↓3.5%)" in green
  - Eye icon button to mask/unmask the amount
- Monthly performance gauge:
  - Label: "실적 달성 현황"
  - Progress bar: rose gradient, 62% filled
  - Text: "₩1,234,800 / ₩2,000,000"
- My cards (horizontal scroll):
  - Credit card thumbnail (1.586:1 ratio, 160px height)
  - Rose gradient card: "신한 딥드림"
  - Blue gradient card: "KB 탄탄대로"
  - Violet gradient card: "삼성 iD"
  - Card shows: card name, last 4 digits (•••• 1234), network logo area
- Recent transactions section:
  - List of 3 items with merchant icon, name, category, amount
  - Items: 스타벅스 (coffee icon) -₩5,500, 쿠팡 (shopping icon) -₩32,000, GS25 (store icon) -₩2,800
- Bottom navigation: 홈 | 카드 | 가계부 | 혜택 | 마이 (rose active state on 홈)

Style: Clean white background, rose (#f43f5e) as accent, Lucide icons, Pretendard font.
Interaction hints: cards have subtle hover shadow, eye icon for privacy, swipeable card row.
```

### 2.2 Card List Screen

```
Design a mobile "My Cards" screen for CardWise app.

Layout:
- Header: "내 카드" + "+ 카드 추가" button (rose outline style)
- Card count badge: "3장 등록됨"
- Card list (vertical, full-width):
  Each card item shows:
  - Large card thumbnail (full width, 180px height, rounded-2xl)
  - Gradient: Rose (#f43f5e→#fda4af), Ocean (#0ea5e9→#38bdf8), Violet (#7c3aed→#a78bfa)
  - Card info overlay (bottom of thumbnail):
    - Card name: "신한 딥드림 카드"
    - Card number: "•••• •••• •••• 1234"
    - Network: VISA logo (right)
  - Below thumbnail: quick stats row
    - 이번달 실적: ₩820,000
    - 연간 실적: ₩6,400,000
    - 혜택 수: 12개
  - "혜택 보기" chevron button
- Empty state (if no cards): rose-50 background, credit-card icon, "카드를 추가해보세요" CTA button

Style: White background, card thumbnails with gradient overlay, subtle row separators.
Interaction: Card tap → detail view, long press → reorder, swipe → quick actions.
```

### 2.3 Benefit Search Screen

```
Design a mobile "혜택 검색" (Benefit Search) screen for CardWise.

Layout:
- Header: "혜택 검색"
- AI search bar (prominent, full-width):
  - Placeholder: "스타벅스 갈 건데 어떤 카드?"
  - Rose gradient border when focused
  - Sparkle/magic icon on left (AI indicator)
  - Voice input icon on right
- Quick tags row (horizontal scroll):
  - 태그: 카페 ☕ | 편의점 🏪 | 주유 ⛽ | 마트 🛒 | 외식 🍽️ | 온라인쇼핑 💻
  - Active tag: rose-500 background, white text
- Search result card (AI recommendation):
  - "AI 추천" badge (rose gradient, sparkle icon)
  - Recommended card thumbnail (small, left)
  - Card name: "신한 딥드림"
  - Benefit: "스타벅스 30% 할인"
  - Estimated saving: "예상 절감 ₩1,650"
  - Reason text: "귀하의 카드 중 스타벅스 혜택이 가장 높습니다"
  - "이 카드 사용하기" CTA button
- Alternative cards section: "다른 카드 옵션" with 2 smaller result cards
- Recent searches: chip tags of previous queries

Style: White background, AI elements use rose gradient, icons from Lucide set.
```

### 2.4 Voucher Management Screen

```
Design a mobile "바우처 관리" (Voucher/Perk Management) screen for CardWise.

Layout:
- Header: "바우처" + filter icon
- Status tabs: 전체 | 사용가능 | 만료임박 | 소진 (rose underline on active tab)
- Voucher card list (each item is a card with front/back flip):

  Front face:
  - Merchant logo area (placeholder circle)
  - Voucher name: "스타벅스 무료음료"
  - Card source: "신한 딥드림 제공"
  - Remaining: "2 / 3 남음" with mini progress dots
  - Expiry: "~2026.12.31"
  - "사용하기" button (rose)

  Back face (on tap/flip):
  - "사용 방법" title
  - Step list: 1. 스타벅스 앱 실행 → 2. 혜택 쿠폰 탭 → 3. 제시 후 결제
  - Barcode placeholder (gray rectangle)
  - "확인" button to flip back

- Expired voucher: desaturated gray, "소진" red badge overlay, opacity 0.6
- Summary footer: "사용가능 4개 | 만료임박 1개 (D-7)"

Style: Card-based layout, flip animation on tap, rose active elements, rose-50 background for cards.
```

### 2.5 Ledger / Transaction List Screen

```
Design a mobile "가계부" (Transaction Ledger) screen for CardWise.

Layout:
- Header: "가계부" + calendar icon + filter icon
- Month navigator: "< 2026년 3월 >" with swipe gesture hint
- Monthly summary bar:
  - 총 지출: ₩1,234,800 (rose)
  - 총 혜택: ₩45,200 (green)
  - 순 비용: ₩1,189,600 (neutral)
- Transaction list grouped by date:
  Group header: "3월 18일 화요일" (sticky, neutral-50 bg)
  Transaction item:
  - Left: category icon circle (rose-100 bg, rose icon)
  - Center: merchant name + category tag
  - Right: amount (negative = rose, benefit applied = green stripe)
  - Tap to expand: shows card used, benefit applied, memo field
- FAB button: rose gradient, + icon, "직접 입력" label
- Empty date group: subtle "거래 없음" text

Category icons (Lucide): coffee, shopping-bag, car, utensils, home, smartphone, heart
Style: Clean white, rose accents, expandable transaction rows, category color coding.
```

---

## 3. Component-Level Prompts

### 3.1 Credit Card Thumbnail

```
Design a credit card thumbnail component for a mobile app.

Specifications:
- Aspect ratio: 1.586:1 (standard card ratio)
- Width: flexible (fill container), height: 180px
- Border radius: 16px
- Background: linear gradient (multiple options below)
- Layout:
  - Top-left: bank/card network logo area (32×32px white circle placeholder)
  - Top-right: card type chip (VISA / Mastercard text, white, 12px)
  - Center: decorative element (subtle geometric pattern or wave SVG)
  - Bottom-left: card number (•••• •••• •••• 1234), white, 14px monospace
  - Bottom-right: card name ("딥드림"), white bold 16px

Gradient presets:
  Rose:    #f43f5e → #fda4af (135deg)
  Ocean:   #0ea5e9 → #38bdf8 (135deg)
  Forest:  #059669 → #34d399 (135deg)
  Violet:  #7c3aed → #a78bfa (135deg)
  Gold:    #d97706 → #fbbf24 (135deg)
  Slate:   #334155 → #64748b (135deg)

Shadow: 0 8px 24px rgba(color-based, 0.3)
Hover: translateY(-4px) + shadow increase, transition 200ms ease
```

### 3.2 Primary Button

```
Design a primary CTA button component for CardWise.

Variants:
1. Primary: background rose-500 (#f43f5e), white text, rose glow shadow
2. Secondary: white background, rose-500 border (1.5px), rose text
3. Ghost: transparent, rose text only
4. Destructive: rose-700 background, white text

Specs:
- Height: 48px (standard), 40px (compact), 56px (large CTA)
- Border radius: 12px
- Font: Pretendard 600, 16px
- Padding: 16px horizontal
- Ripple effect on click: white circle expands from click point, fades out
- Disabled state: opacity 0.4, cursor not-allowed
- Loading state: spinner replaces text, width fixed to prevent layout shift

Icon support: optional left icon (20px Lucide) with 8px gap
```

### 3.3 Benefit Badge / Tag

```
Design benefit type badge components for CardWise.

Badge types:
- 할인 (Discount): rose-100 bg, rose-600 text
- 적립 (Points): amber-100 bg, amber-700 text
- 캐시백 (Cashback): green-100 bg, green-700 text
- 마일리지 (Mileage): blue-100 bg, blue-700 text
- 무료 (Free): violet-100 bg, violet-700 text
- 신규 (New): rose gradient bg, white text, "NEW" label, subtle pulse glow animation

Specs:
- Height: 24px
- Padding: 4px 8px
- Border radius: 6px
- Font: Pretendard 600, 12px
- "NEW" badge: add @keyframes pulse-glow (0%→50%→100% box-shadow opacity)

Usage: appears on card thumbnails, benefit list items, search results.
```

### 3.4 Performance / Progress Gauge

```
Design a monthly performance gauge component for CardWise.

Layout:
- Label row: "이번달 실적" (left, title-sm) + "₩1,234,800 / ₩2,000,000" (right, body-sm, rose for current amount)
- Progress bar:
  - Height: 8px
  - Background: neutral-100
  - Fill: rose gradient (#f43f5e → #fb7185), border-radius matches bar
  - Animated: on mount, width transitions from 0% to actual% over 800ms (ease-out)
- Percentage text: "62%" centered above the fill end point (rose-600 color, bold)
- Below bar: status text
  - < 50%: "⚠️ 실적 달성이 필요합니다" (warning orange)
  - 50-80%: "👍 순조롭게 진행 중" (neutral)
  - ≥ 80%: "🎉 실적 달성 임박!" (rose, celebratory)

State: if goal reached → bar turns solid rose, checkmark icon appears, confetti micro-animation.
```

### 3.5 Bottom Navigation Bar

```
Design a bottom navigation bar for CardWise mobile app.

Specs:
- Height: 64px + safe area (iOS: +34px, Android: +variable)
- Background: white with top border (1px neutral-100)
- Blur: backdrop-filter: blur(20px) with 95% white (glassmorphism option)
- 5 tabs: 홈 (home icon) | 카드 (credit-card) | 가계부 (book-open) | 혜택 (star) | 마이 (user)
- Each tab:
  - Icon: 24px Lucide, stroke-width 1.5 (inactive: neutral-400, active: rose-500)
  - Label: 11px Pretendard (inactive: neutral-400, active: rose-500)
  - Active indicator: rose-500 pill (28px × 4px) above icon, slides between tabs on change
- Active tab icon: filled variant (if available) or bold stroke
- Transition: indicator slides with cubic-bezier(0.34, 1.56, 0.64, 1) spring effect
- Notification dot: 6px rose circle, top-right of icon (for 혜택 tab with new benefits)
```

---

## 4. Icon Style Prompt

```
Icon style guide for CardWise app:

Use Lucide icons exclusively. Configuration:
- Size: 20px (list items), 24px (navigation, headers), 16px (badges, chips)
- Stroke width: 1.5 (default), 2.0 (emphasis/active state)
- Color: inherit from parent (use currentColor)
- Active/selected: filled variant or rose-500 color
- Decorative pairs (icon + label):
  - 홈 / Dashboard: home
  - 카드: credit-card
  - 가계부: book-open
  - 혜택: star
  - 마이페이지: user
  - 검색: search
  - 알림: bell
  - 설정: settings
  - 바우처: gift
  - AI 추천: sparkles
  - 숨김/보이기: eye / eye-off
  - 달성/완료: check-circle
  - 경고: alert-circle
  - 카페: coffee
  - 쇼핑: shopping-bag
  - 교통: car
  - 식당: utensils
  - 여행: plane
  - 주유: fuel
  - 편의점: store
  - 통신: smartphone

Do NOT use: emoji as icons, custom SVG paths inconsistent with Lucide style, filled solid icons mixed with outline (pick one style per context).
```

---

## 5. Animation / Interaction Prompt

```
Define micro-interaction and animation specifications for CardWise:

1. Page / Tab Transitions:
   - Type: Slide horizontal (like native iOS)
   - Duration: 300ms
   - Easing: cubic-bezier(0.4, 0, 0.2, 1) (Material standard)
   - New page slides in from right, old slides out to left

2. Card Hover (web desktop):
   - translateY: -6px
   - box-shadow: increase to 0 16px 40px rgba(244,63,94,0.2)
   - transition: all 200ms ease
   - Scale: 1.0 → 1.02 (subtle)

3. Button Press:
   - Scale: 1.0 → 0.96
   - Ripple: white circle from click point, radius 0 → 100px, opacity 0.3 → 0
   - Duration: 400ms

4. Number Count-up:
   - Trigger: on element enter viewport or tab switch
   - Duration: 800ms, easing: ease-out
   - Format: Korean currency (₩X,XXX,XXX) with comma formatting during animation

5. Loading Skeleton:
   - Color: neutral-100 with shimmer (neutral-200 highlight sweeps left→right)
   - Duration: 1.5s loop
   - Shapes match the actual content layout (card thumbnail, text lines)

6. Success / Completion:
   - Checkmark draws itself (SVG stroke-dashoffset animation)
   - Background: rose-50 → white fade
   - Optional: 3 rose confetti dots scatter upward

7. Voucher Flip:
   - Type: 3D Y-axis rotation
   - Front → Back: rotateY(0deg) → rotateY(180deg)
   - Duration: 500ms, easing: ease-in-out
   - Preserve-3d on container, backface-visibility: hidden on faces

8. Background Blob (glassmorphism screens):
   - 3 blobs: 300–400px diameter, rose-300/rose-200/pink-200 at 60% opacity, filter: blur(60px)
   - Each moves on separate @keyframes (translate X/Y sinusoidal), 8–14s duration, infinite alternate
   - Performance: will-change: transform, reduced-motion: prefers-reduced-motion disables animation

9. Pull-to-Refresh (mobile):
   - Rose spinner (circular, stroke-dashoffset animation)
   - Appears after 60px pull distance
   - Bounces back with spring easing on release

10. Empty State:
    - Icon fades in (opacity 0→1, translateY 10px→0), 400ms delay
    - CTA button slides up after 200ms additional delay
    - Illustration: rose-100 tinted Lucide icon (large, 64px)
```

---

## 6. Illustration / Visual Prompt (for Midjourney / image generators)

```
Flat vector illustration for a Korean fintech app, depicting a person managing their credit card benefits on a smartphone.

Style: minimal flat design, rounded shapes, no outlines
Color palette: rose (#f43f5e) as primary, white (#ffffff), light gray (#f8fafc), with small accents of emerald green (#10b981) for "savings" elements
Characters: friendly, gender-neutral, simplified facial features (pixel-art minimal)
Elements: smartphone showing a dashboard, floating credit cards (colorful gradients), coins/stars representing benefits, upward trend arrow in green
Mood: organized, delightful, trustworthy, modern Korean fintech aesthetics
Background: pure white or rose-50 (#fff1f2) gradient
Format: 1:1 square, suitable for app onboarding screen or marketing banner
```

---

## 7. v0.dev Specific Prompts

### 7.1 Dashboard Component (React + Tailwind)

```
Create a React component for a Korean fintech app dashboard called CardWise.

Requirements:
- Use Tailwind CSS classes only (no inline styles)
- Use lucide-react for all icons
- Font: assume Pretendard is loaded globally
- Mobile-first (max-w-[390px] centered)

Components to include:
1. Header with greeting and bell icon
2. Balance card (white rounded-2xl shadow, rose text for amount, eye toggle)
3. Horizontal scrollable credit card row (3 cards with gradients: rose, blue, violet)
4. Performance progress bar (rose gradient fill, animated on mount)
5. Recent transactions list (3 items with icons, names, amounts)
6. Bottom navigation bar (5 tabs, rose active state)

Use shadcn/ui components where appropriate (Card, Badge, Button, Progress).
TypeScript. Export as default.
```

### 7.2 Voucher Flip Card Component

```
Create a React flip card component for CardWise voucher management.

Props:
  voucherName: string
  cardSource: string
  remaining: number
  total: number
  expiry: string
  usageSteps: string[]

Behavior:
- Click to flip (rotateY 180deg, CSS 3D transform)
- Front: voucher info, rose "사용하기" button
- Back: usage steps list, gray "확인" button to flip back

Styling: Tailwind CSS, rounded-2xl, shadow-md, rose accent colors
Animation: transition-transform duration-500 preserve-3d
TypeScript. Export as default.
```
