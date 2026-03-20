# CardWise - 구현 태스크 (TASKS.md)

> 최종 갱신: 2026-03-20  
> 대상: **F2 가계부 수동 입력**, **F4 실적 관리**, **F8 소비 대시보드**  
> 관련 스펙: `docs/specs/F2-ledger-manual.md`, `docs/specs/F4-performance-tracking.md`, `docs/specs/F8-dashboard.md`

---

## 우선순위 요약

| 순위 | 태스크 그룹 | 이유 |
|------|------------|------|
| 🔴 P1 | F8 백엔드 API 신설 | `/dashboard` 프론트가 새로 만들어졌으나 대응 API가 없어 빈 화면 |
| 🔴 P1 | F2 결제 수정/삭제 UI | 입력만 되고 수정 불가 → UX 미완성 |
| 🟡 P2 | F2 결제 입력 폼 고도화 | 품목, FX, 태그, 혜택 연동 UI |
| 🟡 P2 | F4 PerformanceTierChangedEvent | 실적 구간 달성 모달 트리거 미완성 |
| 🟢 P3 | F2 card_benefit 자동 매칭 | 결제 입력 시 혜택 자동 추천 |
| 🟢 P3 | F8 그룹 대시보드 전환 | `?groupId=` 쿼리 기반 전환 |

---

## ─────────────────────────────────────
## F8 - 소비 대시보드 (🔴 P1 최우선)
## ─────────────────────────────────────

> 현재 `/dashboard`가 F8 사용자 대시보드로 교체됐지만,  
> 이를 뒷받침하는 **백엔드 API가 전혀 없는** 상태.  
> 프론트는 `tryFetchBackendJson` fallback으로 빈 화면 표시 중.

---

### [F8-BE-01] 월간 요약 API 구현

- **엔드포인트**: `GET /api/v1/dashboard/monthly-summary?yearMonth=2026-03`
- **모듈**: `analytics` (신설 또는 `dashboard` 패키지)
- **응답 필드**:
  ```json
  {
    "data": {
      "yearMonth": "2026-03",
      "totalSpent": 1234567,
      "totalBenefit": 23400,
      "paymentCount": 42,
      "changeAmount": -50000,
      "changeRate": -3.9
    }
  }
  ```
- **쿼리 대상**: `user_monthly_summary` 테이블 (현재 월 + 전월 비교)
- **체크리스트**:
  - [ ] `AnalyticsController` 또는 `DashboardController` 엔드포인트 추가
  - [ ] `MonthlySummaryService.getMonthlySummary(accountId, yearMonth)` 구현
  - [ ] `user_monthly_summary` 테이블 조회 쿼리 작성
  - [ ] 전월 데이터 함께 조회하여 `changeAmount`, `changeRate` 계산
  - [ ] 데이터 없을 때 0으로 fallback 처리

---

### [F8-BE-02] 카드별 요약 API 구현

- **엔드포인트**: `GET /api/v1/dashboard/card-summary?yearMonth=2026-03`
- **응답 필드**:
  ```json
  {
    "data": [
      {
        "userCardId": 1,
        "cardName": "삼성카드 taptap O",
        "spentAmount": 500000,
        "benefitAmount": 12000,
        "paymentCount": 18,
        "currentTierName": "50만원"
      }
    ]
  }
  ```
- **쿼리 대상**: `user_card_monthly_summary` JOIN `user_card` JOIN `user_performance`
- **체크리스트**:
  - [ ] 엔드포인트 추가
  - [ ] `user_card_monthly_summary` 기반 카드별 지출 합산 쿼리
  - [ ] `user_performance`에서 현재 구간(`currentTierName`) JOIN
  - [ ] 카드 0건 시 빈 배열 반환

---

### [F8-BE-03] 카테고리별 요약 API 구현

- **엔드포인트**: `GET /api/v1/dashboard/category-summary?yearMonth=2026-03`
- **응답 필드**:
  ```json
  {
    "data": [
      {
        "categoryId": 5,
        "categoryName": "식비",
        "spentAmount": 320000,
        "sharePercent": 25.9
      }
    ]
  }
  ```
- **쿼리**: `payment_item` JOIN `category` WHERE `year_month=2026-03` GROUP BY `category_id`
- **체크리스트**:
  - [ ] 엔드포인트 추가
  - [ ] `payment_item` 직접 집계 쿼리 (or `user_category_summary`)
  - [ ] `sharePercent` 계산 (각 카테고리 금액 / 전체 합계 * 100)
  - [ ] 상위 8개 + "기타" 그룹핑 옵션 (프론트에서 처리해도 됨)

---

### [F8-BE-04] 6개월 추이 API 구현

- **엔드포인트**: `GET /api/v1/dashboard/trend?months=6`
- **응답 필드**:
  ```json
  {
    "data": [
      { "yearMonth": "2025-10", "totalSpent": 980000 },
      { "yearMonth": "2025-11", "totalSpent": 1100000 }
    ]
  }
  ```
- **쿼리**: `user_monthly_summary` WHERE `account_id = :id` AND `year_month >= :sixMonthsAgo`
- **체크리스트**:
  - [ ] 엔드포인트 추가
  - [ ] 최근 N개월 집계 쿼리 (기본값 6)
  - [ ] 데이터 없는 월은 `totalSpent: 0`으로 채워서 반환

---

### [F8-FE-05] 프론트 타입 정의 보완

> 현재 `cardwise-api.ts`에 F8 대시보드용 타입이 선언되어 있지 않거나 부분적인 상태.

- **체크리스트**:
  - [ ] `DashboardMonthlySummaryResponse` 타입 추가/확인
  - [ ] `DashboardCardSummaryResponse` 타입 추가/확인
  - [ ] `DashboardCategorySummaryResponse` 타입 추가/확인
  - [ ] `DashboardTrendResponse` 타입 추가/확인
  - [ ] `formatSignedCurrency`, `formatPercent` 유틸 함수 추가/확인

---

### [F8-FE-06] 그룹 대시보드 전환 (🟢 P3)

- **진입**: `/dashboard?groupId=123`
- **체크리스트**:
  - [ ] URL `searchParams.groupId` 파라미터 수신
  - [ ] 그룹 선택 시 `/api/v1/groups/{groupId}/stats` 호출로 전환
  - [ ] 그룹 모드에서 멤버별 지출 비교 섹션 표시
  - [ ] 그룹 전환 Select UI 추가 (개인 / 그룹1 / 그룹2)

---

## ─────────────────────────────────────
## F2 - 가계부 수동 입력
## ─────────────────────────────────────

---

### [F2-FE-01] 결제 수정/삭제 UI 완성 (🔴 P1)

> 현재 결제 목록은 있으나 수정/삭제 UI가 없거나 미연결 상태.

- **관련 파일**: `frontend/src/app/ledger/`, `frontend/src/components/ledger-item-actions.tsx`
- **체크리스트**:
  - [ ] 결제 카드에 더보기 메뉴 (수정 / 삭제) 버튼 추가
  - [ ] 삭제: 확인 다이얼로그 → `DELETE /api/v1/payments/{paymentId}` 호출
  - [ ] 수정: 수정 폼 모달 또는 페이지 → `PATCH /api/v1/payments/{paymentId}` 호출
  - [ ] 삭제 후 목록 자동 갱신 (revalidatePath 또는 router.refresh)
  - [ ] 수정 성공 후 목록 자동 갱신

---

### [F2-FE-02] 결제 입력 폼 고도화 (🟡 P2)

> 현재 기본 결제 저장은 되지만 품목 단위 입력, 태그, 혜택 연동이 미완.

- **체크리스트**:
  - [ ] **품목(PaymentItem) 다중 입력 UI**
    - 품목명, 금액, 카테고리, 태그, 적용혜택 필드
    - "+ 품목 추가" 버튼, 최소 1개 유지
    - 품목 합계 ≠ 총 금액 시 경고 표시
  - [ ] **카테고리 선택 드롭다운**
    - `GET /api/v1/categories` 호출하여 목록 로드
    - 카테고리 선택 필수 처리
  - [ ] **태그 Combobox (멀티)**
    - 자동완성 + 신규 태그 생성 지원
    - 최대 10개 제한
  - [ ] **그룹 선택**
    - "개인" (기본) + 내 소속 그룹 목록 드롭다운
    - 선택 시 `groupId` 포함하여 저장

---

### [F2-FE-03] 해외결제(FX) UI (🟡 P2)

- **체크리스트**:
  - [ ] 통화 선택 드롭다운 (KRW, USD, EUR, JPY, CNY 등 10개)
  - [ ] 외화 선택 시 환율 자동 조회 `GET /api/v1/exchange-rates?currency=USD`
  - [ ] 원화 환산 금액 자동 계산 및 수동 수정 가능
  - [ ] `currency != KRW`일 때 `originalAmount` + `exchangeRateId` 포함하여 저장

---

### [F2-FE-04] 결제 보정(Adjustment) UI 연결 확인 (🟡 P2)

- **현황**: `/adjustments` 페이지 존재하지만 실제 보정 확인 액션 연결 검증 필요
- **체크리스트**:
  - [ ] `PATCH /api/v1/payments/adjustments/{id}/confirm` 호출 확인
  - [ ] 보정 확인 후 목록에서 제거 처리
  - [ ] 보정 유형 배지 (`FX_CORRECTION`, `BILLING_DISCOUNT` 등) 색상 구분

---

### [F2-FE-05] 실적 제외 토글 UI (🟢 P3)

- **진입**: 결제 상세 → 품목 상세
- **체크리스트**:
  - [ ] 품목별 `excluded_from_performance` 토글 스위치
  - [ ] 토글 변경 전 확인 다이얼로그 ("실적 구간이 변경될 수 있습니다")
  - [ ] `PATCH /api/v1/payment-items/{id}/exclude` 호출
  - [ ] 변경 후 실적 게이지 즉시 갱신

---

### [F2-BE-06] card_benefit 자동 매칭 (🟢 P3)

> 결제 입력 시 선택된 카드 + 카테고리 기반으로 적용 가능한 혜택 자동 추천.

- **체크리스트**:
  - [ ] `GET /api/v1/cards/{userCardId}/benefits?categoryId={id}` API 추가
  - [ ] 결제 입력 폼에서 카드 + 카테고리 선택 시 혜택 옵션 자동 로드
  - [ ] `PaymentItem.benefitId` 선택 후 저장 시 `card_benefit_usage` 기록
  - [ ] 혜택 적용 시 `benefit_amount` 자동 계산 (discount_value 기반)

---

## ─────────────────────────────────────
## F4 - 실적 관리
## ─────────────────────────────────────

---

### [F4-BE-01] PerformanceTierChangedEvent 발행 로직 완성 (🟡 P2)

> `PaymentCreatedEvent` 처리 후 구간 변경 시 이벤트 발행이 설계만 있고 실제 발행 미구현.

- **관련 파일**: `backend/src/main/kotlin/com/cardwise/performance/`
- **체크리스트**:
  - [ ] `PerformanceService`에서 `PaymentCreatedEvent` 수신 후 실적 재계산 로직 확인
  - [ ] 구간 변경 감지: `이전 tierId != 새 tierId` 비교 로직 추가
  - [ ] `PerformanceTierChangedEvent(accountId, userCardId, prevTierId, newTierId)` 발행
  - [ ] `NotificationEventHandler`에서 `PerformanceTierChangedEvent` 수신 → 알림 생성
  - [ ] 구간 달성 알림 메시지: "OO카드 50만원 구간 달성! 새 혜택이 활성화되었습니다."

---

### [F4-FE-02] 실적 구간 달성 모달 (🟡 P2)

> 프론트 측에서 구간 달성 알림을 받아 모달을 표시하는 로직 미구현.

- **트리거**: `PerformanceTierChangedEvent` → 알림 → 프론트 폴링 또는 실시간 감지
- **체크리스트**:
  - [ ] 결제 저장 응답에 `tierChanged: true, newTierName: "50만원"` 필드 추가 (단기)
  - [ ] 저장 성공 응답에 구간 변경 여부 포함 → 모달 표시 조건 처리
  - [ ] `PerformanceTierModal` 컴포넌트 구현 (다크 글래스 테마)
    - 마스코트 Celebrating 포즈
    - 달성 구간명 + 활성화된 혜택 목록
    - 다음 구간 안내
    - "확인" 버튼
  - [ ] 모달 진입/퇴장 애니메이션 (컨페티 + bounce)

---

### [F4-FE-03] 실적 제외 섹션 UI 보완 (🟢 P3)

- **현황**: `/performance/[userCardId]` 페이지 존재하나 실적 제외 토글 섹션 미완성 추정
- **체크리스트**:
  - [ ] "실적 제외 항목 관리" 섹션 추가
  - [ ] 자동 제외 항목 (코드 기반): 읽기 전용으로 표시
  - [ ] 사용자 직접 제외 (`excluded_from_performance`): 토글 ON/OFF 가능
  - [ ] 토글 변경 후 게이지 즉시 갱신

---

### [F4-FE-04] 그레이스 기간 배너 (🟢 P3)

- **현황**: `performance` API 응답에 `gracePeriod` 포함되나 UI 표시 미확인
- **체크리스트**:
  - [ ] `gracePeriod.active === true`일 때 배너 표시
  - [ ] "신규 발급 혜택 기간: ~2026.04 (실적 없이 모든 혜택 활성화)" 문구
  - [ ] 남은 일수 표시

---

## 태스크 상태 추적

| 태스크 ID | 제목 | 우선순위 | 상태 |
|-----------|------|----------|------|
| F8-BE-01 | 월간 요약 API | 🔴 P1 | ❌ 미착수 |
| F8-BE-02 | 카드별 요약 API | 🔴 P1 | ❌ 미착수 |
| F8-BE-03 | 카테고리별 API | 🔴 P1 | ❌ 미착수 |
| F8-BE-04 | 6개월 추이 API | 🔴 P1 | ❌ 미착수 |
| F8-FE-05 | 프론트 타입 정의 | 🔴 P1 | 🔶 부분 |
| F8-FE-06 | 그룹 대시보드 전환 | 🟢 P3 | ❌ 미착수 |
| F2-FE-01 | 결제 수정/삭제 UI | 🔴 P1 | 🔶 부분 |
| F2-FE-02 | 결제 입력 폼 고도화 | 🟡 P2 | 🔶 부분 |
| F2-FE-03 | 해외결제(FX) UI | 🟡 P2 | ❌ 미착수 |
| F2-FE-04 | 결제 보정 UI 확인 | 🟡 P2 | 🔶 확인 필요 |
| F2-FE-05 | 실적 제외 토글 UI | 🟢 P3 | ❌ 미착수 |
| F2-BE-06 | card_benefit 자동 매칭 | 🟢 P3 | ❌ 미착수 |
| F4-BE-01 | TierChangedEvent 발행 | 🟡 P2 | 🔶 부분 |
| F4-FE-02 | 구간 달성 모달 | 🟡 P2 | ❌ 미착수 |
| F4-FE-03 | 실적 제외 섹션 UI | 🟢 P3 | ❌ 미착수 |
| F4-FE-04 | 그레이스 기간 배너 | 🟢 P3 | 🔶 확인 필요 |

---

## 작업 순서 권장

```
1단계 (P1 - 즉시)
  → F8-BE-01~04: 대시보드 API 4개 신설 (백엔드)
  → F8-FE-05: 프론트 타입/유틸 정의 완성
  → F2-FE-01: 결제 수정/삭제 UI 완성

2단계 (P2)
  → F2-FE-02: 결제 입력 폼 고도화 (품목, 카테고리, 태그)
  → F4-BE-01: PerformanceTierChangedEvent 발행 로직
  → F4-FE-02: 구간 달성 모달 컴포넌트

3단계 (P3)
  → F2-FE-03: 해외결제 FX UI
  → F2-BE-06: card_benefit 자동 매칭
  → F8-FE-06: 그룹 대시보드 전환
  → F4-FE-03~04: 실적 제외/그레이스 기간 UI
```
