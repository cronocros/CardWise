# CardWise 혜택 검색 상세 명세 (DOC-07-06)

> 최종 갱신: 2026-03-18

---

## 1. 개요

### 목적

사용자가 가맹점명 또는 카테고리를 검색하여 혜택을 받을 수 있는 카드를 확인하고, 보유 카드 중 최적의 카드를 추천받는 기능을 정의한다. "이 가게에서 어떤 카드를 쓰면 가장 좋을까?"라는 일상적 질문에 즉시 답을 제공한다.

혜택 유형(할인, 적립, 캐시백, 마일리지, 무이자할부)별 필터와 실적 구간 충족 여부를 고려하여 실질적으로 받을 수 있는 혜택만 표시한다. 전체 카드 DB 기반 검색과 내 카드 한정 검색을 모두 지원한다.

### 대상 사용자

- 결제 전 최적 카드를 확인하고 싶은 회원
- 특정 카테고리(카페, 주유, 온라인쇼핑 등)에서 혜택이 좋은 카드를 찾는 회원
- 카드 신규 발급을 위해 혜택을 비교하려는 회원

---

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| F5-US-01 | 회원 | 가맹점명을 검색하여 혜택 받을 수 있는 카드를 확인하고 싶다 | 최적 카드 선택 |
| F5-US-02 | 회원 | 카테고리(카페, 주유 등)를 선택하여 혜택 카드를 검색하고 싶다 | 카테고리 기반 검색 |
| F5-US-03 | 회원 | 내 카드 중 가장 좋은 혜택의 카드를 추천받고 싶다 | 개인화 추천 |
| F5-US-04 | 회원 | 혜택 유형(할인/적립/캐시백)별로 필터링하고 싶다 | 맞춤 검색 |
| F5-US-05 | 회원 | 내 실적 구간 기준 실제로 받을 수 있는 혜택을 알고 싶다 | 실질 혜택 확인 |
| F5-US-06 | 회원 | 전체 카드 DB에서 혜택을 비교하여 신규 발급 참고하고 싶다 | 카드 발급 의사결정 |

---

## 3. 화면 명세

### 3.1 혜택 검색 화면

- **진입 경로**: 혜택 탭, `/benefits/search`

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 검색 입력 필드 | Input (search) | - | 2자 이상 입력 시 검색 (debounce 300ms) |
| 카테고리 필터 칩 | ChipGroup (scroll) | - | "전체", "카페", "주유", "편의점", "온라인쇼핑" 등 |
| 혜택 유형 필터 | ChipGroup | - | "전체", "할인", "적립", "캐시백", "마일리지", "무이자" |
| 내 카드만 토글 | Switch | - | ON: 등록된 카드만, OFF: 전체 카드 |
| 검색 결과 목록 | List | - | 카드별 혜택 정보 |
| 빈 상태 | EmptyState | - | "검색 결과가 없습니다" |

### 3.2 검색 결과 카드

| 요소명 | 유형 | 설명 |
|--------|------|------|
| 카드 이미지 | Thumbnail (40px) | 카드사 로고 + 카드 이미지 |
| 카드명 | Text (bold) | 카드 공식 이름 |
| 혜택 유형 배지 | Badge | "할인 5%", "적립 1000P" 등 |
| 혜택 상세 | Text (muted) | 적용 조건 요약 |
| 실적 구간 | ProgressBar + Text | 현재 충족 여부 (내 카드만) |
| 적용 가능 여부 | Badge (green/gray) | "적용 가능" 또는 "실적 미달" |
| 내 카드 표시 | Badge (blue) | 등록된 카드인 경우 |

### 3.3 카드 혜택 상세 (Bottom Sheet)

- **진입 경로**: 검색 결과 카드 클릭

| 요소명 | 유형 | 설명 |
|--------|------|------|
| 카드 정보 | CardHeader | 카드 이미지 + 이름 + 카드사 |
| 혜택 목록 | List | 해당 카드의 전체 혜택 (현재 카테고리 하이라이트) |
| 실적 구간 정보 | Table | 구간별 혜택율, 현재 구간 강조 |
| 혜택 한도 | Text | 월 한도, 잔여 한도 (내 카드만) |
| 카드 등록 버튼 | Button | 미등록 카드인 경우 표시 |

---

## 4. Acceptance Criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | 검색 필드에 | "스타벅스"를 입력하면 | 스타벅스 혜택이 있는 카드가 혜택율 높은 순으로 표시된다 |
| AC-02 | 카테고리 "카페"를 선택하면 | 카페 카테고리 혜택이 있는 카드 목록이 | 혜택율 높은 순으로 표시된다 |
| AC-03 | "내 카드만" 토글 ON 상태에서 | 검색하면 | 등록된 카드 중 혜택 있는 카드만 표시된다 |
| AC-04 | 내 카드의 실적이 2구간일 때 | 검색 결과에서 해당 카드를 보면 | 2구간 기준 혜택율과 "적용 가능" 배지가 표시된다 |
| AC-05 | 실적 미달인 카드가 있으면 | 검색 결과에 | "실적 미달" 배지와 함께 필요 실적이 표시된다 |
| AC-06 | 혜택 유형 "캐시백"만 선택하면 | 검색 결과에 | 캐시백 혜택만 필터링되어 표시된다 |
| AC-07 | 검색 결과가 없으면 | EmptyState가 표시되고 | "다른 검색어를 시도해보세요" 안내가 표시된다 |

---

## 5. Edge Cases & 에러 시나리오

| 시나리오 | 조건 | 처리 |
|----------|------|------|
| 카드 미등록 | 등록된 카드 0장 + "내 카드만" 토글 ON | "카드를 먼저 등록해주세요" 안내 |
| 혜택 데이터 없음 | 해당 가맹점/카테고리 혜택이 없는 카드 | 결과에서 제외 (빈 목록 시 EmptyState) |
| 실적 계산 지연 | 실적 데이터가 아직 갱신되지 않은 경우 | 마지막 갱신 시점 표시 |
| 혜택 조건 복잡 | 시간대별, 요일별 혜택 차이 | 기본 혜택율 표시 + 조건 상세는 Bottom Sheet에서 |
| 폐지 카드 | 신규 발급 중단된 카드의 혜택 | "신규 발급 불가" 표시, 기존 보유자에겐 정상 표시 |

---

## 6. API 연동

| 화면/기능 | Method | Endpoint | 비고 |
|-----------|--------|----------|------|
| 혜택 검색 | GET | `/api/v1/benefits/search?q={query}&categoryId={id}&type={benefitType}` | 페이지네이션 |
| 최적 카드 추천 | GET | `/api/v1/benefits/recommend?categoryId={id}&merchantName={name}` | 내 카드 중 최적 |
| 카드 혜택 상세 | GET | `/api/v1/cards/{cardId}/benefits` | 전체 혜택 목록 |
| 카테고리 목록 | GET | `/api/v1/categories` | 캐시 가능 |

---

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 |
|--------|------|
| `card` | 카드 마스터 |
| `card_benefit` | 카드별 혜택 정의 |
| `benefit_category_mapping` | 혜택-카테고리 매핑 |
| `category` | 카테고리 마스터 |
| `user_card` | 사용자 등록 카드 |
| `user_performance` | 사용자 실적 (구간 충족 여부 판정) |
| `performance_tier` | 실적 구간 정의 |

### 주요 쿼리 패턴

**가맹점/카테고리 혜택 검색**:
```sql
SELECT c.card_name, cb.benefit_type, cb.benefit_rate, cb.benefit_amount,
       pt.tier_name, pt.min_amount, pt.max_amount,
       CASE WHEN uc.user_card_id IS NOT NULL THEN true ELSE false END AS is_my_card,
       CASE WHEN up.current_amount >= pt.min_amount THEN true ELSE false END AS is_eligible
FROM card_benefit cb
JOIN card c ON cb.card_id = c.card_id
JOIN benefit_category_mapping bcm ON cb.benefit_id = bcm.benefit_id
LEFT JOIN performance_tier pt ON cb.tier_id = pt.tier_id
LEFT JOIN user_card uc ON c.card_id = uc.card_id AND uc.account_id = :accountId
LEFT JOIN user_performance up ON uc.user_card_id = up.user_card_id
WHERE bcm.category_id = :categoryId
ORDER BY cb.benefit_rate DESC;
```
