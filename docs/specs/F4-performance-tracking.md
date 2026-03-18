# F4 - 연간/월간 실적 추적

> 최종 갱신: 2026-03-18

---

## 1. 개요

### 목적

사용자가 보유한 카드의 연간/월간 실적을 시각적으로 추적하고, 실적 구간 달성 여부와 다음 구간까지 남은 금액을 확인할 수 있는 기능을 정의한다. 핵심은 카드 발급일(issued_at) 기준 연간 계산이며, 달력 연도(1월~12월)가 아닌 발급 기준 12개월 주기(예: 6월 발급 → 6월~5월)를 사용한다. 결제 입력(PaymentCreatedEvent) 시 자동으로 실적이 갱신되며, 구간 변경 시 알림이 발행된다.

### 대상 사용자

- 카드 실적 달성 현황을 확인하려는 회원
- 다음 실적 구간까지 남은 금액을 확인하여 소비 계획을 세우려는 회원
- 월별 사용 추이를 비교하려는 회원

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

---

## 3. 화면 명세

### 3.1 실적 트래커 화면 (카드 상세 → 실적 탭)

- **진입 경로**: 내 카드 목록 → 카드 선택 → "실적" 탭, `/cards/{userCardId}/performance`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 카드 미니 썸네일 + 카드명 | Header | - | 60px 썸네일, 별칭 우선 표시 |
| 연간 기간 표시 | Text (caption) | - | "2025.06 ~ 2026.05 (발급일 기준)" |
| 연간 실적 게이지 | RadialGauge (반원형) | - | 현재 금액 / 최고 구간 금액, % 표시 |
| 현재 달성 구간 | Badge (success) | - | "50만원 구간 달성" |
| 다음 구간 안내 | Text (body-sm) | - | "100만원 구간까지 ₩180,000 남음" (없으면 "최고 구간 달성!") |
| 실적 구간 트랙 (PerformanceTierTrack) | TierTrack | - | 구간별 노드 + 마스코트 위치 + 달성 뱃지 |
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
- 탭 진입 시 staggered 애니메이션

**사용자 인터랙션**:
1. 게이지 탭 → 상세 금액 정보 바텀시트 (연간 누적, 현재 구간 혜택 목록)
2. 월별 차트 막대 탭 → 해당 월 상세 (금액, 결제 건수, 전월 대비)
3. 구간 노드 탭 → 해당 구간 혜택 상세 목록

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
      "issuedAt": "2025-06-15"
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
| `card_benefit` | 구간별 혜택 (performance_tier_id FK) |
| `payment` | 결제 건 (krw_amount → 실적 합산) |

### 핵심 로직: 연간 기간 계산

```
issued_at = 2025-06-15
현재 날짜 = 2026-03-18

연간 시작: 2025-06 (issued_at의 연-월)
연간 종료: 2026-05 (시작 + 11개월)

경과 월수: 10개월 (6,7,8,9,10,11,12,1,2,3)
남은 월수: 2개월 (4,5)
```

### 실적 갱신 이벤트 흐름

```
PaymentCreatedEvent
  → UserCard Module
    → payment.user_card_id로 user_card 조회
    → issued_at 기준 해당 year_month 산출
    → user_performance UPSERT:
        monthly_spent += payment.krw_amount
        annual_accumulated = SUM(monthly_spent) for 연간 기간 내 모든 월
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
```
