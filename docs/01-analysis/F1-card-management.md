# F1 - 카드 등록 / 관리

> 최종 갱신: 2026-03-19

---

## 1. 개요

### 목적

사용자가 보유한 신용카드/체크카드를 CardWise에 등록하고 관리하는 기능을 정의한다. 카드 등록 시 발급일을 입력하여 연간 실적 기준을 설정하며, 등록과 동시에 해당 카드의 실적(user_performance), 바우처(user_voucher), 혜택 사용 현황(user_benefit_usage)이 자동 초기화된다. 이는 CardWise의 핵심 기능(실적 추적, 혜택 검색, 바우처 관리)의 전제 조건이 되는 기반 기능이다.

카드 네트워크(Visa, Mastercard, AMEX 등)와 카드 등급(Gold, Platinum 등) 정보를 표시하며, 신용카드뿐 아니라 체크카드도 동일하게 등록/관리할 수 있다. 체크카드의 경우 실적 구간이 없는 카드(`has_performance_tier = false`)는 실적 트래커를 표시하지 않는다.

### 대상 사용자

- 카드를 처음 등록하는 신규 회원
- 추가 카드를 등록하려는 기존 회원
- 등록된 카드를 관리(별칭 설정, 삭제)하려는 회원
- FREE 플랜 (카드 3장 제한) 및 PREMIUM 플랜 (무제한) 사용자

---

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| F1-US-01 | 회원 | 내가 보유한 카드를 검색하여 등록하고 싶다 | 혜택/실적 추적의 전제 조건 |
| F1-US-02 | 회원 | 카드 등록 시 발급일을 입력하여 정확한 연간 실적 기준을 설정하고 싶다 | 실적 정확도 |
| F1-US-03 | 회원 | 카드에 별칭(예: "생활비 카드")을 설정하여 구분하기 쉽게 하고 싶다 | UX 편의성 |
| F1-US-04 | 회원 | 더 이상 사용하지 않는 카드를 삭제하고 싶다 | 데이터 정리 |
| F1-US-05 | 회원 | 등록된 카드 목록에서 각 카드의 혜택 요약을 확인하고 싶다 | 혜택 파악 |
| F1-US-06 | 회원 | 카드 등록 시 현재 실적 구간을 선택하여 기존 실적을 반영하고 싶다 | 신규 사용자 편의 (중간 유입) |
| F1-US-07 | 회원 | 주 사용 카드를 설정하여 결제 입력 시 기본 카드로 선택되게 하고 싶다 | UX 편의성 |
| F1-US-08 | 회원 | 카드의 결제 네트워크(Visa, Mastercard 등)를 확인하고 싶다 | 카드 정보 파악 |
| F1-US-09 | 회원 | 신용카드뿐 아니라 체크카드도 등록하여 관리하고 싶다 | 체크카드 지원 |

---

## 3. 화면 명세

### 3.1 카드 검색 화면

- **진입 경로**: 카드 탭 → "카드 추가" 버튼, `/cards/search`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 검색 입력 필드 | Input (search) | - | 2자 이상 입력 시 검색 시작 (debounce 300ms) |
| 카드사 필터 칩 | ChipGroup (horizontal scroll) | - | "전체", "신한", "삼성", "현대", "KB" 등 |
| 카드 유형 필터 | SegmentedControl | - | "전체 / 신용 / 체크" |
| 검색 결과 목록 | VirtualList | - | 카드 이미지 썸네일 (48px) + 카드명 + 카드사 + 연회비 |
| 빈 상태 (검색 결과 없음) | EmptyState | - | 마스코트 Thinking + "검색 결과가 없습니다" |

**데이터 표시 규칙**:
- 검색 결과는 카드사명 → 카드명 순으로 정렬
- 이미 등록된 카드는 "등록됨" 배지 표시 + 선택 불가
- 카드 이미지가 없는 경우 카드사 로고로 대체

**사용자 인터랙션**:
1. 검색어 입력 → 300ms debounce 후 API 호출 → 결과 표시
2. 카드사 칩 선택 → 필터 적용 (복수 선택 불가)
3. 카드 항목 탭 → 카드 상세 확인 화면으로 이동

---

### 3.2 카드 상세 확인 화면

- **진입 경로**: 카드 검색 결과에서 카드 선택, `/cards/search/{cardId}/detail`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 카드 썸네일 (180px) | CardThumbnail | - | 그라디언트 팔레트 자동 배정 |
| 카드명 | Text (title-lg) | - | - |
| 카드사 | Text (body-md, neutral-500) | - | 카드사 로고 + 이름 |
| 카드 유형 | Badge | - | "신용" 또는 "체크" (체크카드 명시 지원) |
| 네트워크 배지 | Badge (icon) | - | Visa / Mastercard / AMEX / JCB / UnionPay 로고 배지 |
| 카드 등급 | Badge (outline) | - | "Gold", "Platinum", "Titanium" 등 (card.card_grade) |
| 연회비 | Text (body-md) | - | "연회비 ₩15,000" (0원 시 "연회비 없음") |
| 카드 설명 | Text (body-sm) | - | 접기/펼치기 (3줄 초과 시) |
| 주요 혜택 목록 | List | - | benefit_type 아이콘 + 설명 (최대 5개 표시) |
| 실적 구간 정보 | TierList | - | 구간별 금액 + 혜택 요약 (체크카드: `has_performance_tier=false`인 경우 미표시) |
| "이 카드 등록하기" 버튼 | Button (Primary) | - | 하단 고정 (sticky) |

**데이터 표시 규칙**:
- 혜택 목록은 할인율/적립율 높은 순으로 정렬
- 실적 구간은 performance_tier.sort_order 순으로 표시
- 체크카드(`has_performance_tier = false`)인 경우 실적 구간 영역에 "이 카드는 실적 구간이 없습니다" 안내 표시
- 카드 설명이 없으면 해당 영역 숨김

**사용자 인터랙션**:
1. 혜택 항목 탭 → 혜택 상세 바텀시트 표시
2. "이 카드 등록하기" 버튼 클릭 → 발급일 + 실적 구간 선택 바텀시트 표시

---

### 3.3 카드 등록 바텀시트 (발급일 + 실적 구간)

- **진입 경로**: 카드 상세 화면에서 "이 카드 등록하기" 버튼 클릭
- **표시 방식**: BottomSheet (드래그 핸들 포함)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 카드명 요약 | Text (title-sm) | - | - |
| 발급일 선택 | DatePicker | O | 미래 날짜 불가, 최대 10년 전까지 |
| 현재 실적 구간 선택 | RadioGroup | O | 해당 카드의 performance_tier 목록 표시 |
| 카드 별칭 입력 | Input (text) | - | 최대 50자 |
| 주카드 설정 토글 | Switch | - | 기본: OFF |
| "등록하기" 버튼 | Button (Primary) | - | 발급일 선택 시 활성화 |

**실적 구간 선택 UI**:
```
○ 아직 실적 없음 (0원)
○ 30만원 이상 달성
○ 50만원 이상 달성
○ 100만원 이상 달성
```

**사용자 인터랙션**:
1. 발급일 선택 → 연간 실적 기간 자동 계산 표시 (예: "연간 기간: 2025.06 ~ 2026.05")
2. 실적 구간 선택 → 해당 구간 혜택 요약 표시
3. "등록하기" 클릭 → 로딩 → 성공 시 "카드가 등록되었습니다" 토스트 + 카드 목록으로 이동

---

### 3.4 내 카드 목록 화면

- **진입 경로**: 하단 탭바 "카드" 탭, `/cards`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 페이지 제목 "내 카드" | Text (title-lg) | - | - |
| 카드 추가 버튼 | IconButton (+) | - | 카드 검색 화면으로 이동 |
| 등록 카드 수 / 한도 | Text (caption) | - | "2 / 3장" (FREE) 또는 "5장" (PREMIUM) |
| 카드 목록 | CardList (vertical) | - | 카드 썸네일 (120px) + 별칭 + 실적 미니 게이지 |
| 빈 상태 | EmptyState | - | 마스코트 Thinking + "등록된 카드가 없습니다" + "카드 추가하기" 버튼 |

**카드 항목 표시 규칙**:
- 주카드에 별 아이콘 표시
- 각 카드 하단에 월간 실적 미니 게이지 (PerformanceTierTrack 축소판)
- 실적 달성률 % 텍스트

**사용자 인터랙션**:
1. 카드 항목 탭 → 카드 관리 상세 화면으로 이동
2. 카드 항목 좌측 스와이프 → "삭제" 버튼 노출
3. "카드 추가" 버튼 → 카드 검색 화면으로 이동
4. FREE 플랜에서 3장 등록된 상태로 추가 시도 → "PREMIUM 업그레이드" 유도 모달

---

## 4. Acceptance Criteria

### AC-01: 카드 검색

```
Given 회원이 카드 검색 화면에 접근한 상태
When  "삼성"을 검색어로 입력하면
Then  카드사가 "삼성"인 카드 목록 또는 카드명에 "삼성"이 포함된 카드 목록이 표시된다
```

### AC-02: 카드 등록 성공

```
Given 회원이 카드 상세 화면에서 "이 카드 등록하기"를 클릭한 상태
When  발급일 "2025-06-15"를 선택하고 실적 구간 "50만원 이상"을 선택한 후 "등록하기"를 클릭하면
Then  user_card 레코드가 생성되고 (issued_at = 2025-06-15)
      user_performance 레코드가 현재 월 기준으로 초기화되고 (performance_tier_id = 50만 구간)
      user_voucher 레코드가 해당 카드의 모든 card_voucher 기반으로 생성되고
      user_benefit_usage 레코드가 해당 카드의 모든 card_benefit 기반으로 초기화되고
      UserCardRegisteredEvent가 발행되고
      "카드가 등록되었습니다" 토스트가 표시된다
```

### AC-03: FREE 플랜 카드 제한

```
Given FREE 플랜 회원이 이미 3장의 카드를 등록한 상태
When  새 카드를 등록하려고 시도하면
Then  "무료 플랜은 최대 3장까지 등록할 수 있습니다" 안내와 함께
      PREMIUM 업그레이드 유도 모달이 표시되고
      카드 등록이 진행되지 않는다
```

### AC-04: 중복 카드 등록 방지

```
Given 회원이 "삼성카드 taptap O"를 이미 등록한 상태
When  동일한 카드를 다시 등록하려고 시도하면
Then  검색 결과에서 해당 카드에 "등록됨" 배지가 표시되고 선택이 불가능하다
```

### AC-05: 카드 삭제

```
Given 회원이 내 카드 목록에서 카드를 삭제하려는 상태
When  카드 항목을 좌측 스와이프하여 "삭제" 버튼을 클릭하면
Then  확인 다이얼로그("정말 삭제하시겠습니까? 연관된 결제 내역은 유지되지만 실적/혜택 추적이 중단됩니다")가 표시되고
      확인 시 user_card.is_active = false 처리되고 (soft deactivate)
      관련 user_performance, user_voucher, user_benefit_usage는 보존되고
      카드 목록에서 해당 카드가 제거된다
```

### AC-06: 카드 별칭 수정

```
Given 회원이 등록된 카드의 상세 화면에 접근한 상태
When  별칭을 "생활비 카드"로 수정하고 저장하면
Then  user_card.card_nickname이 "생활비 카드"로 업데이트되고
      카드 목록에서 변경된 별칭이 표시된다
```

### AC-07: 발급일 미래 날짜 방지

```
Given 회원이 카드 등록 바텀시트에서 발급일을 선택하는 상태
When  미래 날짜(오늘 이후)를 선택하려고 하면
Then  DatePicker에서 미래 날짜가 비활성화되어 선택할 수 없다
```

---

## 5. Edge Cases & 에러 시나리오

| # | 시나리오 | 예상 동작 |
|---|---------|----------|
| E-01 | **카드 삭제 시 연관 결제 데이터 처리** | payment 레코드는 유지 (user_card_id FK 보존). 삭제된 카드의 결제 내역은 가계부에서 "(삭제된 카드)" 라벨로 표시 |
| E-02 | **카드 삭제 시 실적 데이터 처리** | user_performance 레코드는 보존 (이력). 실적 트래커에서는 비활성 카드 제외 |
| E-03 | **FREE 플랜 → 3장 등록 → PREMIUM 업그레이드 → 추가 등록 → 다시 FREE 다운그레이드** | 기존 등록 카드 유지 (삭제 강제 안 함). 새 카드 등록만 제한 |
| E-04 | **카드사에서 카드 상품 비활성화 (card.is_active = false)** | 이미 등록된 사용자 카드는 영향 없음. 신규 등록만 불가. 기존 혜택 정보는 "종료된 혜택" 표시 |
| E-05 | **동일 카드를 삭제 후 재등록** | user_card.is_active = false인 기존 레코드와 별개로 새 user_card 생성. 발급일/실적 구간을 새로 입력 |
| E-06 | **주카드 중복 설정** | 새 카드를 주카드로 설정하면 기존 주카드의 is_primary가 자동으로 false로 변경 |
| E-07 | **카드 등록 중 네트워크 오류** | 트랜잭션 롤백. user_card + user_performance + user_voucher + user_benefit_usage 모두 생성되지 않음. "등록에 실패했습니다. 다시 시도해주세요" 에러 메시지 |
| E-08 | **카드 등록 시 card_voucher / card_benefit이 없는 카드** | 바우처/혜택 초기화 단계 건너뜀. user_card + user_performance만 생성 |
| E-09 | **발급일이 매우 오래된 경우 (10년 전)** | DatePicker에서 10년 전까지만 선택 가능. 그 이전은 비활성화 |

---

## 6. API 연동

### 6.1 카드 검색 (Master Data)

```
GET /api/v1/cards/search?q=삼성&companyId=1&cardType=CREDIT&limit=20
```

**응답**:
```json
{
  "data": [
    {
      "cardId": 1,
      "cardCompanyId": 1,
      "companyName": "삼성카드",
      "cardName": "taptap O",
      "cardType": "CREDIT",
      "annualFee": 15000,
      "imageUrl": "https://...",
      "isRegistered": false
    }
  ]
}
```

### 6.2 내 카드 목록

```
GET /api/v1/cards
```

### 6.3 카드 등록

```
POST /api/v1/cards
```

**요청**:
```json
{
  "cardId": 1,
  "issuedAt": "2025-06-15",
  "performanceTierId": 3,
  "cardNickname": "생활비 카드",
  "isPrimary": false
}
```

**성공 응답** (201):
```json
{
  "data": {
    "userCardId": 1,
    "cardId": 1,
    "cardName": "삼성카드 taptap O",
    "issuedAt": "2025-06-15",
    "annualPeriod": {
      "from": "2025-06",
      "to": "2026-05"
    },
    "initializedResources": {
      "performanceMonths": 1,
      "vouchers": 3,
      "benefitUsages": 12
    }
  }
}
```

### 6.4 카드 삭제

```
DELETE /api/v1/cards/{userCardId}
```

### 6.5 카드 수정 (별칭, 주카드)

```
PATCH /api/v1/cards/{userCardId}
```

**요청**:
```json
{
  "cardNickname": "생활비 카드",
  "isPrimary": true
}
```

### 6.6 카드별 혜택 목록

```
GET /api/v1/cards/{userCardId}/benefits
```

### 6.7 카드별 실적 구간

```
GET /api/v1/cards/{userCardId}/tiers
```

### 6.8 카드별 실적 현황

```
GET /api/v1/cards/{userCardId}/performance
```

---

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 | 연관 시점 |
|--------|------|----------|
| `card` | 카드 마스터 데이터 (검색 대상) | 검색 시 |
| `card_company` | 카드사 마스터 (필터) | 검색 시 |
| `performance_tier` | 실적 구간 정의 | 등록 시 구간 선택 |
| `card_benefit` | 카드 혜택 마스터 | 등록 시 usage 초기화 |
| `card_voucher` | 카드 바우처 마스터 | 등록 시 voucher 초기화 |
| `user_card` | 사용자 등록 카드 | 등록/관리 |
| `user_performance` | 월별 실적 | 등록 시 초기화 |
| `user_voucher` | 바우처 인스턴스 | 등록 시 초기화 |
| `user_benefit_usage` | 혜택 사용 현황 | 등록 시 초기화 |

### 카드 등록 트랜잭션

```sql
BEGIN;

-- 1. FREE 플랜 카드 수 검증
SELECT COUNT(*) FROM user_card
WHERE account_id = $accountId AND is_active = true;
-- FREE: count >= 3 이면 에러

-- 2. 중복 등록 검증
SELECT EXISTS(
  SELECT 1 FROM user_card
  WHERE account_id = $accountId AND card_id = $cardId AND is_active = true
);

-- 3. user_card 생성
INSERT INTO user_card (account_id, card_id, card_nickname, issued_at, is_primary, is_active)
VALUES ($accountId, $cardId, $nickname, $issuedAt, $isPrimary, true);

-- 4. 주카드 설정 시 기존 주카드 해제
UPDATE user_card SET is_primary = false
WHERE account_id = $accountId AND is_primary = true AND user_card_id != $newUserCardId;

-- 5. user_performance 초기화 (현재 월)
INSERT INTO user_performance (user_card_id, performance_tier_id, year_month, monthly_spent, annual_accumulated)
VALUES ($userCardId, $selectedTierId, $currentYearMonth, 0, $initialAnnualAmount);

-- 6. user_voucher 초기화 (card_voucher 기반)
INSERT INTO user_voucher (user_card_id, card_voucher_id, remaining_count, total_count, valid_from, valid_until)
SELECT $userCardId, cv.card_voucher_id, cv.total_count, cv.total_count,
       $periodStart, $periodEnd
FROM card_voucher cv
WHERE cv.card_id = $cardId AND cv.is_active = true;

-- 7. user_benefit_usage 초기화 (card_benefit 기반)
INSERT INTO user_benefit_usage (user_card_id, card_benefit_id, year_month, used_count, used_amount)
SELECT $userCardId, cb.card_benefit_id, $currentYearMonth, 0, 0
FROM card_benefit cb
WHERE cb.card_id = $cardId AND cb.is_active = true;

COMMIT;
```

### 주요 쿼리 패턴

```sql
-- 내 카드 목록 (실적 요약 포함)
SELECT uc.*, c.card_name, cc.company_name, c.image_url,
       up.monthly_spent, up.annual_accumulated, pt.tier_name
FROM user_card uc
JOIN card c ON uc.card_id = c.card_id
JOIN card_company cc ON c.card_company_id = cc.card_company_id
LEFT JOIN user_performance up ON uc.user_card_id = up.user_card_id
  AND up.year_month = $currentYearMonth
LEFT JOIN performance_tier pt ON up.performance_tier_id = pt.performance_tier_id
WHERE uc.account_id = $accountId AND uc.is_active = true
ORDER BY uc.is_primary DESC, uc.created_at DESC;
```
