# CardWise 실적 추적 상세 명세 (DOC-07-05)

> 최종 갱신: 2026-03-19

---

## 1. 개요

### 목적

사용자가 보유한 카드의 연간/월간 실적을 시각적으로 추적하고, 실적 구간 달성 여부와 다음 구간까지 남은 금액을 확인할 수 있는 기능을 정의한다.

**연간 실적 기산**은 카드 상품별 `card.annual_perf_basis`에 따라 두 가지 방식을 지원한다:
- **ISSUANCE_MONTH**: 발급월 1일 ~ 11개월 후 말일 (예: 6월 발급 → 6/1~5/31)
- **ISSUANCE_DATE**: 발급일 ~ 1년 후 전날 (예: 6/15 발급 → 6/15~다음해 6/14)

**혜택 기준월 lag** (`card_benefit.performance_period_lag`)에 따라 당월/전월/전전월 실적이 혜택 활성화에 사용된다. 가장 일반적인 패턴은 전월(PREV_MONTH) 실적 기준이다.

**그레이스 기간**: 신규 발급 카드는 `card.card_rules.grace_period` 설정에 따라 발급 후 N개월간 무실적으로도 전체 혜택이 활성화될 수 있다.

**실적 제외**: 세금, 상품권, 현금서비스 등 카드사별로 실적에서 제외되는 결제 유형이 있으며, 자동 제외(코드 기반)와 사용자 직접 제외(토글 기반) 이중 구조로 관리된다.

결제 입력(PaymentCreatedEvent) 시 자동으로 실적이 갱신되며, 구간 변경 시 알림이 발행된다.

### 대상 사용자

- 카드 실적 달성 현황을 확인하려는 회원
- 다음 실적 구간까지 남은 금액을 확인하여 소비 계획을 세우려는 회원
- 월별 사용 추이를 비교하려는 회원
- 그레이스 기간 혜택 상태를 확인하려는 신규 카드 발급 회원
- 실적 제외 항목을 직접 관리하려는 회원

---

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| F4-US-01 | 회원 | 내 카드의 현재 연간 실적 달성률을 게이지로 확인하고 싶다 | 실적 구간 인식 |
| F4-US-02 | 회원 | 다음 실적 구간까지 남은 금액을 알고 싶다 | 소비 계획 수립 |
| F4-US-03 | 회원 | 월별 사용 금액 추이를 차트로 보고 싶다 | 소비 패턴 파악 |
| F4-US-04 | 회원 | 실적 구간을 달성하면 축하 알림을 받고 싶다 | 동기 부여, 혜택 활성화 인지 |
| F4-US-05 | 회원 | 카드별로 실적을 비교하여 어떤 카드를 더 사용해야 할지 판단하고 싶다 | 최적 소비 전략 |
| F4-US-06 | 회원 | 연간 기간(발급일 기준)이 언제부터 언제까지인지 명확히 확인하고 싶다 | 혼동 방지 |
| F4-US-07 | 회원 | 신규 발급 카드의 그레이스 기간이 언제까지이고 어떤 혜택을 받는지 확인하고 싶다 | 그레이스 기간 내 혜택 누락 방지 |
| F4-US-08 | 회원 | 세금, 상품권 등 실적에서 제외되는 항목을 확인하고 직접 토글로 관리하고 싶다 | 실적 정확도 향상, 투명성 |
| F4-US-09 | 회원 | 카드사 이벤트로 실적이 배율 인정되는 특별 기간을 확인하고 싶다 | 이벤트 기간 활용 극대화 |

---

## 3. 화면 명세

### 3.1 실적 트래커 화면 (카드 상세 → 실적 탭)

- **진입 경로**: 내 카드 목록 → 카드 선택 → "실적" 탭, `/cards/{userCardId}/performance`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 카드 미니 썸네일 + 카드명 | Header | - | 60px 썸네일, 별칭 우선 표시 |
| 연간 기간 표시 | Text (caption) | - | "2025.06 ~ 2026.05 (발급월 기준)" 또는 "2025.06.15 ~ 2026.06.14 (발급일 기준)" — annual_perf_basis에 따라 다름 |
| 그레이스 기간 안내 | Banner (info) | - | 그레이스 기간 활성 시: "신규 발급 혜택 기간: ~2025.09 (실적 없이 모든 혜택 활성화)" + 남은 일수. 비활성 시 미표시 |
| 특별 기간 배지 | Badge (event) | - | 특별 실적 기간 진행 중일 때: "이벤트 기간 x1.5" 또는 "이벤트 기간 x2.0" 배지 표시. 없으면 미표시 |
| 연간 실적 게이지 | RadialGauge (반원형) | - | 현재 금액 / 최고 구간 금액, % 표시 |
| 현재 달성 구간 | Badge (success) | - | "50만원 구간 달성" |
| 다음 구간 안내 | Text (body-sm) | - | "100만원 구간까지 ₩180,000 남음" (없으면 "최고 구간 달성!") |
| 실적 구간 트랙 (PerformanceTierTrack) | TierTrack | - | 구간별 노드 + 마스코트 위치 + 달성 뱃지 |
| 실적 제외 토글 | ToggleSection | - | "실적 제외 항목 관리" 섹션. 자동 제외 항목(코드 기반)은 읽기 전용 표시, 사용자 직접 제외 항목은 토글 ON/OFF 가능. 토글 변경 시 실적 즉시 재계산 |
| 혜택 기준월 안내 | Text (caption) | - | "이 카드는 전월 실적 기준으로 혜택이 적용됩니다" — performance_period_lag에 따라 |
| 월별 실적 차트 | BarChart (세로) | - | 연간 기간 내 12개월 막대 |
| 월별 실적 목록 | List | - | 월별 사용 금액 + 전월 대비 증감 (화살표) |
| 전월 대비 변동 | Text (body-md) | - | "+₩120,000 (+15%)" 또는 "-₩50,000 (-8%)" |

**연간 실적 게이지 표시 규칙**:
```
- 현재 누적: ₩820,000 (display, bold)
- 백분율: 82% (최고 구간 100만 기준)
- 게이지 색상: rose-400 gradient
- 게이지 배경: rose-100
```

**실적 구간 트랙 (PerformanceTierTrack) 상세**:
```
[0원]---●---[30만]---●---[50만]---●---[100만]
              ✓           ✓         🦡(현재)
         스타벅스       주유소       마일리지
         30% 할인     5% 캐시백    3,000점
```
- 달성 노드: rose-400 실선 원 + 체크 아이콘
- 미달성 노드: white 원 + rose-200 border
- 마스코트: 현재 진행률 위치에 22px 미니 아바타
- 각 노드 하단: 대표 혜택 1개 표시

**월별 차트 표시 규칙**:
- X축: 연간 기간 시작월 ~ 현재월 (예: 6월, 7월, ..., 3월)
- 미래 월은 빈 막대 (점선 border)
- 현재 월은 rose-400 강조
- 과거 월은 rose-200
- 특별 실적 기간에 해당하는 월은 막대 상단에 "x1.5" 등 배율 라벨 표시
- 탭 진입 시 staggered 애니메이션

**사용자 인터랙션**:
1. 게이지 탭 → 상세 금액 정보 바텀시트 (연간 누적, 현재 구간 혜택 목록)
2. 월별 차트 막대 탭 → 해당 월 상세 (금액, 결제 건수, 전월 대비)
3. 구간 노드 탭 → 해당 구간 혜택 상세 목록
4. 실적 제외 토글 변경 → 확인 다이얼로그 → 실적 재계산 → 게이지/구간 즉시 갱신

---

### 3.2 카드별 실적 비교 화면

- **진입 경로**: 대시보드 실적 섹션 → "전체 보기", `/cards/performance-summary`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 페이지 제목 "실적 현황" | Text (title-lg) | - | - |
| 카드별 실적 카드 목록 | CardList | - | 각 카드의 게이지 + 구간 정보 |
| 카드 항목 | Card | - | 카드명 + 미니 게이지 + 현재 구간 + 남은 금액 |

**카드 항목 구성**:
```
┌──────────────────────────────┐
│ 🃏 삼성 taptap O              │
│ ┌──────┐  연간: ₩820,000     │
│ │ 82%  │  현재: 50만 구간     │
│ │(게이지)│ 남은: ₩180,000     │
│ └──────┘  기간: 25.06~26.05  │
└──────────────────────────────┘
```

**사용자 인터랙션**:
1. 카드 항목 탭 → 해당 카드 실적 트래커 화면으로 이동

---

### 3.3 실적 구간 달성 모달

- **진입 경로**: 결제 입력 후 실적 구간 변경 시 자동 표시
- **테마**: Rose Glass (다크 글래스모피즘)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 다크 배경 + Blob 애니메이션 | Background | - | 3개 blob, opacity 0.35 |
| 마스코트 (Celebrating 포즈) | 이미지 | - | 80px + bounce 애니메이션 |
| 컨페티 효과 | Animation | - | 30개 랜덤 색상, 2초 fall |
| "구간 달성!" 텍스트 | Text (display) | - | 글래스 카드 내 |
| 달성 구간명 | Text (title-lg) | - | "50만원 구간 달성" |
| 활성화된 혜택 목록 | List | - | 새로 활성화된 혜택 2~3개 |
| 다음 구간 안내 | Text (body-md) | - | "다음 목표: ₩1,000,000" |
| "확인" 버튼 | Button (Primary) | - | 글래스 스타일 |

**트리거 조건**:
```
PaymentCreatedEvent 처리 후
  → user_performance.annual_accumulated 재계산
  → 이전 performance_tier_id != 새 performance_tier_id
  → PerformanceTierChangedEvent 발행
  → 프론트엔드에서 모달 표시
```

---

## 4. Acceptance Criteria

### AC-01: 연간 실적 조회 (발급일 기준)

```
Given 발급일이 2025-06-15인 카드를 등록한 회원
When  2026-03-18에 실적 트래커를 조회하면
Then  연간 기간이 "2025.06 ~ 2026.05"로 표시되고
      2025년 6월부터 2026년 3월까지의 월별 실적이 합산된 연간 누적이 표시되고
      현재 달성 구간이 정확히 판별된다
```

### AC-02: 다음 구간까지 남은 금액

```
Given 연간 누적 실적이 ₩820,000이고 다음 구간이 100만원인 상태
When  실적 트래커를 조회하면
Then  "100만원 구간까지 ₩180,000 남음"이 표시된다
```

### AC-03: 최고 구간 달성 시

```
Given 연간 누적 실적이 ₩1,200,000이고 최고 구간이 100만원인 상태
When  실적 트래커를 조회하면
Then  "최고 구간 달성!"이 표시되고
      게이지가 100%로 채워지고
      다음 구간 안내 대신 "모든 혜택이 활성화되었습니다" 메시지가 표시된다
```

### AC-04: 결제 후 실적 자동 갱신

```
Given 현재 월간 실적이 ₩450,000인 상태
When  ₩60,000 결제를 입력하면
Then  user_performance.monthly_spent가 ₩510,000으로 갱신되고
      user_performance.annual_accumulated가 재계산되고
      실적 트래커 화면에 갱신된 수치가 반영된다
```

### AC-05: 실적 구간 변경 시 알림

```
Given 연간 누적이 ₩490,000이고 현재 구간이 30만원인 상태
When  ₩20,000 결제를 입력하여 누적이 ₩510,000이 되면
Then  performance_tier_id가 50만원 구간으로 변경되고
      PerformanceTierChangedEvent가 발행되고
      실적 달성 모달이 표시되고 (다크 글래스 테마)
      "50만원 구간 달성" + 활성화된 혜택 목록이 표시된다
```

### AC-06: 월별 차트 표시

```
Given 발급일 기준 연간 기간이 2025.06~2026.05이고 현재 2026.03인 상태
When  월별 차트를 조회하면
Then  6월부터 3월까지 10개 월의 실적 막대가 표시되고
      4월, 5월은 빈 점선 막대로 표시되고
      3월(현재)이 rose-400으로 강조된다
```

### AC-07: 그레이스 기간 혜택 활성화

```
Given 카드의 card_rules.grace_period = { enabled: true, months: 3, min_spend_per_month: 0 }이고
      발급일이 2026-01-15이며 현재 2026-03-18인 상태 (발급 후 3개월 이내)
When  실적 트래커를 조회하면
Then  "신규 발급 혜택 기간: ~2026.04 (실적 없이 모든 혜택 활성화)" 배너가 표시되고
      연간 누적 실적이 0원이더라도 모든 실적 구간 혜택이 활성화 상태로 표시되고
      그레이스 기간 남은 일수가 표시된다
```

### AC-08: 실적 제외 항목 토글

```
Given 카드에 "TAX(세금)" 실적 제외 코드가 자동 적용되어 있고
      사용자가 ₩50,000 세금 결제를 입력한 상태
When  실적 제외 토글 섹션을 확인하면
Then  "세금" 항목이 자동 제외로 표시되고 (읽기 전용)
      해당 ₩50,000은 실적 합산에서 제외되어 있다
---
Given 사용자가 특정 결제 건의 payment_item.excluded_from_performance를 ON으로 토글하면
When  실적이 재계산되면
Then  해당 금액이 monthly_spent 및 annual_accumulated에서 차감되고
      구간 변경 여부가 재판별된다
```

### AC-09: 특별 실적 기간 배율 적용

```
Given 카드에 2026-03-01 ~ 2026-03-31 기간 credit_multiplier=1.5인 특별 기간이 설정되어 있고
      2026-03-18에 ₩100,000 결제를 입력하면
When  실적이 계산될 때
Then  해당 결제의 실적 인정 금액은 ₩150,000 (100,000 x 1.5)으로 반영되고
      실적 트래커에 "이벤트 기간 x1.5" 배지가 표시되고
      월별 차트에서 해당 월 막대 상단에 배율 라벨이 표시된다
```

### AC-10: 혜택 기준월 lag 적용

```
Given 카드의 혜택 performance_period_lag = 'PREV_MONTH'이고
      2026-02 월간 실적이 ₩600,000 (50만 구간 달성)이며
      2026-03 월간 실적이 ₩200,000 (30만 이하)인 상태
When  2026-03에 혜택 활성화를 판별하면
Then  전월(2026-02) 실적 ₩600,000 기준으로 50만 구간 혜택이 적용되고
      "이 카드는 전월 실적 기준으로 혜택이 적용됩니다" 안내가 표시된다
```

---

## 5. Edge Cases & 에러 시나리오

| # | 시나리오 | 예상 동작 |
|---|---------|----------|
| E-01 | **카드 발급 첫 달 (부분 월)** | 발급일이 6월 15일이면 6월은 15일~30일만 실적 산정. 월간 실적은 해당 기간의 결제만 합산. 연간 게이지에 정상 반영 |
| E-02 | **연간 기간 경과 후 (갱신)** | 연간 기간 만료 시(예: 2026.06 도래) user_performance 새 연간 기간 자동 시작. 이전 연간 데이터는 이력으로 보존 |
| E-03 | **다중 카드 실적 병합 표시 (대시보드)** | 대시보드의 실적 섹션에서는 각 카드별 독립 게이지로 표시. 카드 간 실적 합산은 하지 않음 (카드사별 독립 산정) |
| E-04 | **해외 결제 실적 합산** | payment.krw_amount 기준으로 합산. 통화와 무관하게 KRW 환산 금액이 실적에 포함 |
| E-05 | **결제 삭제(soft delete) 시 실적 재계산** | payment.deleted_at이 설정되면 해당 금액을 실적에서 차감. user_performance 재계산 |
| E-06 | **결제 금액 수정 시 실적 재계산** | 수정 전 금액 차감 + 수정 후 금액 가산. 구간 변경 여부 재판별 |
| E-07 | **카드 등록 시 과거 실적 없는 상태** | user_performance.monthly_spent = 0, annual_accumulated = 선택한 구간의 min_amount로 초기화 |
| E-08 | **performance_tier가 없는 카드** | 실적 구간 트랙 미표시. "이 카드는 실적 구간이 없습니다" 안내 |
| E-09 | **동시 결제 입력 시 실적 충돌** | DB 레벨에서 user_performance UPDATE 시 낙관적 잠금(updated_at 비교) 또는 직렬화. 동시성 이슈 방지 |
| E-10 | **환불 처리 시 실적 차감** | 환불 결제(음수 금액)가 입력되면 실적에서 차감. 구간이 하락할 수 있음 (하락 시 별도 알림 없음) |
| E-11 | **그레이스 기간 만료 후 전환** | 그레이스 기간 종료 시점에 실제 실적 기반으로 구간 재판별. 실적 미달 시 구간 하락 발생 가능. 만료 7일 전 "그레이스 기간 종료 예정" 알림 발송. 만료 후 첫 조회 시 변경된 구간/혜택 상태를 안내 |
| E-12 | **실적 제외 항목 토글 시 재계산** | 사용자가 payment_item.excluded_from_performance를 ON→OFF 또는 OFF→ON 변경 시, 해당 금액을 포함/제외하여 monthly_spent 및 annual_accumulated 즉시 재계산. 구간 상승/하락 모두 발생 가능. 토글 변경 전 확인 다이얼로그 표시 ("이 변경으로 실적 구간이 변경될 수 있습니다") |
| E-13 | **특별 기간 종료 후 배율 원복** | 특별 실적 기간(special_performance_period) 종료 후 신규 결제는 기본 배율(x1.0) 적용. 이미 배율 적용된 기존 실적은 변경하지 않음. 기간 종료일 다음 날부터 "이벤트 기간" 배지 자동 제거 |

---

## 6. API 연동

### 6.1 카드별 실적 현황

```
GET /api/v1/cards/{userCardId}/performance
```

**응답**:
```json
{
  "data": {
    "userCardId": 1,
    "cardName": "삼성카드 taptap O",
    "annualPeriod": {
      "from": "2025-06",
      "to": "2026-05",
      "issuedAt": "2025-06-15",
      "basis": "ISSUANCE_MONTH"
    },
    "currentMonth": {
      "yearMonth": "2026-03",
      "monthlySpent": 210000,
      "previousMonthSpent": 180000,
      "changeRate": 16.7
    },
    "annual": {
      "accumulated": 820000,
      "currentTier": {
        "tierName": "50만원",
        "minAmount": 500000,
        "achievedAt": "2026-02-20"
      },
      "nextTier": {
        "tierName": "100만원",
        "minAmount": 1000000,
        "remainingAmount": 180000
      }
    },
    "benefitQualification": {
      "periodLag": "PREV_MONTH",
      "periodLagLabel": "전월 실적 기준",
      "referenceMonth": "2026-02",
      "referenceMonthSpent": 180000,
      "qualifiedTierName": "30만원",
      "gracePeriod": {
        "active": false,
        "expiresAt": null,
        "remainingDays": null
      }
    },
    "specialPeriod": {
      "active": true,
      "name": "봄맞이 실적 2배 이벤트",
      "from": "2026-03-01",
      "to": "2026-03-31",
      "creditMultiplier": 1.5
    },
    "monthlyBreakdown": [
      { "yearMonth": "2025-06", "spent": 45000 },
      { "yearMonth": "2025-07", "spent": 92000 },
      { "yearMonth": "2025-08", "spent": 78000 },
      { "yearMonth": "2025-09", "spent": 110000 },
      { "yearMonth": "2025-10", "spent": 65000 },
      { "yearMonth": "2025-11", "spent": 88000 },
      { "yearMonth": "2025-12", "spent": 72000 },
      { "yearMonth": "2026-01", "spent": 95000 },
      { "yearMonth": "2026-02", "spent": 120000 },
      { "yearMonth": "2026-03", "spent": 210000 }
    ]
  }
}
```

### 6.2 카드별 실적 구간 (혜택 포함)

```
GET /api/v1/cards/{userCardId}/tiers
```

**응답**:
```json
{
  "data": {
    "currentAmount": 820000,
    "currency": "KRW",
    "tiers": [
      {
        "tierId": 1,
        "tierName": "30만원",
        "tierAmount": 300000,
        "achieved": true,
        "achievedAt": "2025-10-12",
        "benefits": ["스타벅스 30% 할인", "편의점 5% 캐시백"]
      },
      {
        "tierId": 2,
        "tierName": "50만원",
        "tierAmount": 500000,
        "achieved": true,
        "achievedAt": "2026-02-20",
        "benefits": ["주유 5% 캐시백", "외식 3% 적립"]
      },
      {
        "tierId": 3,
        "tierName": "100만원",
        "tierAmount": 1000000,
        "achieved": false,
        "achievedAt": null,
        "remainingAmount": 180000,
        "benefits": ["항공 마일리지 3,000점", "해외 결제 수수료 면제"]
      }
    ]
  }
}
```

---

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 |
|--------|------|
| `user_card` | 사용자 카드 (issued_at으로 연간 기간 산출) |
| `user_performance` | 월별 실적 (monthly_spent, annual_accumulated) |
| `performance_tier` | 실적 구간 정의 (min_amount, max_amount) |
| `card_benefit` | 구간별 혜택 (performance_tier_id FK, performance_period_lag) |
| `payment` | 결제 건 (krw_amount → 실적 합산, paid_at 기준) |
| `payment_item` | 결제 품목 (excluded_from_performance 사용자 직접 토글) |
| `card` | 카드 상품 (annual_perf_basis, card_rules JSONB — 그레이스 기간 등) |
| `special_performance_period` | 특별 실적 인정 기간 (배율 적용, credit_multiplier) |
| `performance_exclusion_code` | 실적 제외 유형 마스터 코드 (TAX, GIFT_CARD, CASH_ADVANCE 등) |
| `card_performance_exclusion` | 카드별 실적 제외 규칙 (코드 참조, effective_scope) |
| `payment_adjustment` | 결제 보정 (FX 환율 확정, 청구할인 등 — 실적 재계산 트리거) |

### 핵심 로직: 연간 기간 계산

```
# ISSUANCE_MONTH 방식 (발급월 기준)
issued_at = 2025-06-15
연간 시작: 2025-06-01 (발급월 1일)
연간 종료: 2026-05-31 (11개월 후 말일)

# ISSUANCE_DATE 방식 (발급일 기준)
issued_at = 2025-06-15
연간 시작: 2025-06-15
연간 종료: 2026-06-14 (1년 후 전날)

현재 날짜 = 2026-03-18 (ISSUANCE_MONTH 예시)
경과 월수: 10개월 (6,7,8,9,10,11,12,1,2,3)
남은 월수: 2개월 (4,5)
```

### 실적 갱신 이벤트 흐름

```
PaymentCreatedEvent
  → UserCard Module
    → payment.user_card_id로 user_card 조회
    → card.annual_perf_basis 확인 (ISSUANCE_MONTH / ISSUANCE_DATE)
    → issued_at + annual_perf_basis 기준 해당 year_month 산출
    → 실적 제외 판별:
        1) card_performance_exclusion 자동 제외 코드 매칭
        2) payment_item.excluded_from_performance 사용자 제외 확인
        3) 제외 대상이면 실적 합산에서 skip
    → 특별 실적 기간 확인:
        special_performance_period에서 payment.paid_at 포함 기간 조회
        → 해당 시 credit_multiplier 배율 적용
    → user_performance UPSERT:
        monthly_spent += payment.krw_amount * credit_multiplier (제외 항목 제외)
        annual_accumulated = SUM(monthly_spent) for 연간 기간 내 모든 월
    → 그레이스 기간 확인:
        card.card_rules.grace_period 조회
        → 활성 시 구간 판별 skip, 최고 구간으로 강제 설정
    → performance_tier 재판별:
        SELECT * FROM performance_tier
        WHERE card_id = $cardId AND min_amount <= $annual
        ORDER BY min_amount DESC LIMIT 1
    → 구간 변경됨?
        → Yes: PerformanceTierChangedEvent 발행
        → No: 종료
```

### 주요 쿼리 패턴

```sql
-- 연간 누적 실적 계산
SELECT SUM(up.monthly_spent) AS annual_accumulated
FROM user_performance up
WHERE up.user_card_id = $userCardId
  AND up.year_month BETWEEN $annualStartMonth AND $annualEndMonth;

-- 현재 구간 판별
SELECT pt.*
FROM performance_tier pt
WHERE pt.card_id = $cardId
  AND pt.min_amount <= $annualAccumulated
ORDER BY pt.min_amount DESC
LIMIT 1;

-- 다음 구간 조회
SELECT pt.*
FROM performance_tier pt
WHERE pt.card_id = $cardId
  AND pt.min_amount > $annualAccumulated
ORDER BY pt.min_amount ASC
LIMIT 1;

-- 월별 실적 목록 (연간 기간 내)
SELECT up.year_month, up.monthly_spent
FROM user_performance up
WHERE up.user_card_id = $userCardId
  AND up.year_month BETWEEN $annualStart AND $annualEnd
ORDER BY up.year_month;

-- 특별 실적 기간 조회
SELECT spp.*
FROM special_performance_period spp
WHERE spp.card_id = $cardId
  AND spp.start_date <= $paymentDate
  AND spp.end_date >= $paymentDate;

-- 실적 제외 코드 조회 (카드별)
SELECT pec.code, pec.display_name, cpe.effective_scope
FROM card_performance_exclusion cpe
JOIN performance_exclusion_code pec ON pec.id = cpe.exclusion_code_id
WHERE cpe.card_id = $cardId;

-- 혜택 기준월 lag 반영 실적 조회
SELECT up.monthly_spent
FROM user_performance up
WHERE up.user_card_id = $userCardId
  AND up.year_month = $referenceMonth;  -- lag 적용된 기준월
```

---

## 8. 비즈니스 규칙 상세

### 8.1 연간 실적 기산 방식 (annual_perf_basis_enum)

카드 상품별로 `card.annual_perf_basis` 컬럼에 설정된다.

| 값 | 기산 규칙 | 예시 (발급일 2025-06-15) |
|---|---------|----------------------|
| `ISSUANCE_MONTH` | 발급월 1일 ~ 11개월 후 말일 | 2025-06-01 ~ 2026-05-31 |
| `ISSUANCE_DATE` | 발급일 ~ 1년 후 전날 | 2025-06-15 ~ 2026-06-14 |

- 대부분의 카드사는 `ISSUANCE_MONTH` 방식 사용
- `ISSUANCE_DATE` 방식은 일부 프리미엄 카드에서 사용
- 연간 기간 만료 후 자동으로 다음 연간 기간 시작 (이전 기간 이력 보존)

### 8.2 월간 실적 기간

- 매월 1일 00:00:00 ~ 말일 23:59:59 (KST) 기준
- `payment.paid_at` 타임스탬프 기준으로 해당 월 판별
- 해외 결제의 경우 `payment.paid_at`은 현지 결제 시점이 아닌 카드사 매입 처리 시점
- 윤년 2월은 29일까지 포함

### 8.3 혜택 기준월 lag (benefit_period_lag_enum)

`card_benefit.performance_period_lag` 컬럼으로 혜택별 설정된다.

| 값 | 의미 | 설명 |
|---|------|------|
| `CURRENT_MONTH` | 당월 실적 → 당월 혜택 | 실시간 반영. 일부 체크카드에서 사용 |
| `PREV_MONTH` | 전월 실적 → 당월 혜택 | 가장 일반적. 대부분의 신용카드 |
| `PREV_PREV_MONTH` | 전전월 실적 → 당월 혜택 | 일부 은행계 카드 |

- 동일 카드 내에서도 혜택별로 lag가 다를 수 있음
- lag 기준월의 실적으로 해당 혜택의 활성화 구간을 판별
- 예: PREV_MONTH이고 현재 3월이면 → 2월 실적으로 3월 혜택 결정

### 8.4 특별 실적 기간 (special_performance_period 테이블)

카드사 이벤트 등으로 특정 기간 동안 실적 배율을 적용하는 기능.

| 필드 | 설명 |
|------|------|
| `card_id` | 대상 카드 상품 FK |
| `start_date` / `end_date` | 이벤트 기간 |
| `credit_multiplier` | 실적 배율 (예: 1.5, 2.0) |
| `description` | 이벤트 설명 ("봄맞이 실적 2배 이벤트") |

- 배율은 실적 합산 시 곱셈 적용: `실제 결제 금액 x credit_multiplier`
- 기간 중복 시 가장 높은 배율 적용 (MAX)
- UI에 "이벤트 기간 x1.5" 형태의 배지 표시
- 이벤트 기간 종료 후 신규 결제는 기본 배율(x1.0) 적용, 기존 배율 적용 실적은 유지

### 8.5 그레이스 기간 (card.card_rules JSONB)

신규 발급 카드에 대해 일정 기간 무실적으로도 전체 혜택을 제공하는 정책.

**card_rules JSONB 구조**:
```json
{
  "grace_period": {
    "enabled": true,
    "months": 3,
    "min_spend_per_month": 0
  }
}
```

| 필드 | 설명 |
|------|------|
| `enabled` | 그레이스 기간 활성 여부 |
| `months` | 발급 후 적용 개월 수 |
| `min_spend_per_month` | 월 최소 사용 금액 (0이면 무조건 적용) |

- 그레이스 기간 내에는 실적 구간 0원이어도 모든 혜택이 활성화됨
- `min_spend_per_month > 0`인 경우, 해당 월 최소 사용 조건 충족 필요
- 그레이스 기간 만료 7일 전 알림 발송
- 만료 후 실제 실적 기반으로 구간 재판별 (구간 하락 가능)

### 8.6 실적 제외 규칙

이중 구조로 실적 제외를 관리한다.

**자동 제외 (코드 기반)**:

`performance_exclusion_code` 마스터 테이블:

| 코드 | 설명 |
|------|------|
| `TAX` | 세금 (국세, 지방세) |
| `GIFT_CARD` | 상품권 구매 |
| `CASH_ADVANCE` | 현금서비스 |
| `INSURANCE_PREMIUM` | 보험료 |
| `PREPAID_CARD` | 선불카드 충전 |

`card_performance_exclusion` 테이블로 카드별 적용:

| effective_scope | 의미 |
|----------------|------|
| `MONTHLY_ONLY` | 월간 실적에서만 제외 |
| `ANNUAL_ONLY` | 연간 실적에서만 제외 |
| `ALL_PERFORMANCE` | 월간 + 연간 모두 제외 |
| `NONE` | 제외하지 않음 (오버라이드) |

**사용자 직접 제외 (토글 기반)**:

- `payment_item.excluded_from_performance`: 사용자가 UI에서 직접 ON/OFF 토글
- 토글 변경 시 해당 금액 포함/제외하여 실적 즉시 재계산
- 자동 제외와 독립적으로 동작 (자동 제외 + 사용자 제외 모두 적용)

### 8.7 자동 vs 셀프서비스 구분

| 구분 | 동작 | 사용자 개입 |
|------|------|-----------|
| **자동** | 실적 구간 판별, 혜택 활성화/비활성화, 실적 제외 코드 자동 매칭 | 없음 |
| **사용자 (셀프서비스)** | 실적 제외 토글 (payment_item), 결제 보정 확인 (payment_adjustment) | 직접 조작 |
| **반자동** | 바우처 잠금해제 (조건 충족 시 알림 → 사용자 확인 후 활성화) | 확인만 |

- 자동 처리 결과는 항상 사용자에게 투명하게 표시
- 셀프서비스 변경은 확인 다이얼로그를 거쳐 실행
- 반자동은 조건 충족 시 푸시 알림/인앱 알림으로 안내, 사용자가 명시적으로 확인해야 완료
