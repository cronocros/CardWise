# cardwise-component: UI 컴포넌트 생성

shadcn/ui + Tailwind CSS 기반으로 프로젝트 컨벤션에 맞는 컴포넌트를 생성한다.

## 사용 시점

- 새 UI 컴포넌트 생성 시
- 기존 컴포넌트 패턴을 따라 확장 시
- 사용자가 "컴포넌트", "UI", "화면", "페이지" 등을 언급할 때

## 프로세스

### 1. Context7으로 최신 문서 확인

컴포넌트 생성 전 반드시 확인:
- Next.js 15 App Router 최신 패턴
- shadcn/ui 컴포넌트 API
- Tailwind CSS 유틸리티

### 2. 프로젝트 컨벤션

#### 디렉토리 구조

```
src/
+-- app/                    App Router 페이지
|   +-- (auth)/             인증 필요 라우트 그룹
|   +-- (public)/           공개 라우트 그룹
|   +-- layout.tsx
|   +-- page.tsx
+-- components/
|   +-- ui/                 shadcn/ui 기본 컴포넌트 (수정 금지)
|   +-- common/             공통 컴포넌트 (Header, Footer, etc.)
|   +-- card/               카드 도메인 컴포넌트
|   +-- ledger/             가계부 도메인 컴포넌트
|   +-- benefit/            혜택 도메인 컴포넌트
|   +-- dashboard/          대시보드 컴포넌트
|   +-- voucher/            바우처 도메인 컴포넌트
+-- hooks/                  커스텀 훅
+-- lib/                    유틸리티
+-- types/                  TypeScript 타입 정의
```

#### 컴포넌트 작성 규칙

- **Server Component 우선**: 데이터 fetching이 필요하면 Server Component
- **Client Component 최소화**: 상호작용 필요한 부분만 `"use client"`
- **파일명**: kebab-case (`card-benefit-list.tsx`)
- **컴포넌트명**: PascalCase (`CardBenefitList`)
- **Props 타입**: 컴포넌트 파일 내 정의 (별도 파일 불필요)

#### 스타일링 규칙

- Tailwind CSS 유틸리티 클래스 사용
- `cn()` 함수로 조건부 클래스 병합 (shadcn/ui 패턴)
- 인라인 style 금지
- CSS 모듈 사용 금지 (Tailwind로 통일)

### 3. 컴포넌트 템플릿

```tsx
// Server Component (기본)
import { cn } from "@/lib/utils"

interface CardBenefitListProps {
  cardId: number
  className?: string
}

export function CardBenefitList({ cardId, className }: CardBenefitListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 구현 */}
    </div>
  )
}
```

```tsx
// Client Component (상호작용 필요 시)
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface VoucherUseButtonProps {
  voucherId: number
  onUse: () => void
}

export function VoucherUseButton({ voucherId, onUse }: VoucherUseButtonProps) {
  const [loading, setLoading] = useState(false)
  // 구현
}
```

### 4. 도메인별 주요 컴포넌트

| 도메인 | 컴포넌트 | 타입 |
|--------|---------|------|
| Card | CardList, CardDetail, CardRegisterForm | Server/Client |
| Benefit | BenefitSearchInput, BenefitResultList, RecommendCard | Client/Server |
| Ledger | PaymentForm, PaymentItemRow, PaymentList | Client/Server |
| Dashboard | MonthlySummary, CategoryChart, PerformanceGauge | Server |
| Voucher | VoucherList, VoucherUseButton, VoucherExpireBadge | Server/Client |

### 5. 접근성

- 모든 interactive 요소에 적절한 aria 속성
- 키보드 네비게이션 지원
- 색상 대비 WCAG AA 준수
- shadcn/ui 기본 접근성 활용
