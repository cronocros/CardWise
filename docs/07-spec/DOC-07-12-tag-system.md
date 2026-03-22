# CardWise 태그 시스템 상세 명세 (DOC-07-12)

> 최종 갱신: 2026-03-18

---

## 1. 개요

### 목적

결제 항목(payment_item)에 자유 형식 태그를 부착하여 사용자 고유의 분류 체계를 구축하고, 태그 기반 통계 및 교차 분석을 제공하는 기능을 정의한다. 카테고리(category)가 시스템 정의 분류라면, 태그는 사용자 정의 분류로서 개인화된 지출 분석을 가능하게 한다.

태그 시스템은 개인 가계부와 그룹 가계부 모두에서 동작하며, 그룹 공유 태그를 통해 가족/그룹 구성원 간 일관된 분류를 지원한다. 교차 분석(태그×카테고리, 태그×멤버, 태그×기간, 태그×태그)을 통해 다차원 지출 인사이트를 제공한다.

### 대상 사용자

- 지출을 세분화하여 추적하고 싶은 회원 (예: "용돈", "경조사", "고양이")
- 가족/그룹 가계부에서 멤버별 지출을 태그로 구분하려는 그룹 사용자
- 태그 기반 통계 및 교차 분석으로 인사이트를 얻고 싶은 회원

---

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| TAG-US-01 | 회원 | 결제 항목에 자유롭게 태그를 붙이고 싶다 (예: "김밍밍", "용돈") | 개인화된 분류 |
| TAG-US-02 | 회원 | 태그 입력 시 기존 태그가 자동완성되어 빠르게 선택하고 싶다 | UX 편의성 |
| TAG-US-03 | 회원 | 새로운 태그를 입력하면 즉시 생성되어 사용하고 싶다 | 진입 장벽 제거 |
| TAG-US-04 | 회원 | 태그별 총 지출, 건수, 월별 추이를 확인하고 싶다 | 기본 통계 |
| TAG-US-05 | 회원 | "용돈 중 카페 비중은?"처럼 태그×카테고리 교차 분석을 보고 싶다 | 다차원 인사이트 |
| TAG-US-06 | 회원 | "김밍밍 vs 박영희 지출 비교"처럼 태그×멤버 분석을 보고 싶다 | 그룹 분석 |
| TAG-US-07 | 회원 | "용돈 월별 추이"처럼 태그×기간 분석을 보고 싶다 | 트렌드 파악 |
| TAG-US-08 | 회원 | "김밍밍 + 용돈 교집합"처럼 태그×태그 분석을 보고 싶다 | 복합 필터 |
| TAG-US-09 | 그룹 멤버 | 그룹 공유 태그를 사용하여 그룹 내 일관된 분류를 하고 싶다 | 그룹 통계 |
| TAG-US-10 | 회원 | 불필요한 태그를 삭제하거나 이름을 수정하고 싶다 | 태그 관리 |

---

## 3. 화면 명세

### 3.1 태그 부착 (결제 입력/수정 화면 내)

- **진입 경로**: 결제 입력 → 품목별 태그 필드, `/payments/new` 또는 `/payments/{id}/edit`

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 태그 입력 필드 | Combobox (multi-select) | ❌ | 최대 10개/품목, 태그명 1~30자 |
| 자동완성 드롭다운 | Dropdown | - | 1자 이상 입력 시 표시, 최근 사용 순 정렬 |
| 새 태그 생성 옵션 | DropdownItem | - | "'{입력값}' 새 태그 만들기" 표시 |
| 태그 칩 | Badge (removable) | - | 선택된 태그 표시, X 버튼으로 제거 |

**동작 규칙**:
- 태그 입력 시 기존 태그 목록에서 자동완성 (fuzzy match)
- 일치하는 태그가 없으면 "새 태그 만들기" 옵션 표시
- 동일 품목에 동일 태그 중복 부착 불가
- 그룹 결제 입력 시: 개인 태그 + 그룹 태그 모두 자동완성 대상

### 3.2 태그 관리 화면

- **진입 경로**: 설정 → 태그 관리, `/settings/tags`

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 태그 목록 | List | - | 사용 빈도 순 정렬 (기본), 이름순 전환 가능 |
| 태그명 | Text (editable) | - | 인라인 편집, 1~30자 |
| 사용 횟수 | Badge | - | 해당 태그가 부착된 품목 수 |
| 삭제 버튼 | IconButton (trash) | - | 확인 다이얼로그 후 삭제 |
| 검색 필드 | Input (search) | - | 태그 필터링 |

### 3.3 태그 통계 화면

- **진입 경로**: 대시보드 → 태그 통계 탭, `/dashboard/tags`

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 기간 선택기 | DateRangePicker | ✅ | 기본값: 이번 달 |
| 태그별 지출 목록 | SortableTable | - | 태그명, 총액, 건수, 비율 표시 |
| 태그별 지출 차트 | BarChart (horizontal) | - | 상위 10개 태그 |
| 교차 분석 셀렉터 | Select | - | "태그×카테고리", "태그×기간", "태그×태그", "태그×멤버" |

### 3.4 교차 분석 화면

- **진입 경로**: 태그 통계 → 교차 분석 선택, `/dashboard/tags/cross`

| 분석 유형 | 시각화 | 입력 |
|-----------|--------|------|
| 태그×카테고리 | Stacked BarChart | 태그 1개 선택 → 카테고리별 분포 |
| 태그×기간 | LineChart | 태그 1~3개 선택 → 월별 추이 |
| 태그×태그 | Table (교집합 목록) | 태그 2개 선택 → 겹치는 품목 목록 |
| 태그×멤버 | GroupedBarChart | 태그 1개 + 그룹 선택 → 멤버별 비교 |

---

## 4. Acceptance Criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | 결제 품목 입력 화면에서 | 태그 필드에 "용"을 입력하면 | "용돈" 등 기존 태그가 자동완성 드롭다운에 표시된다 |
| AC-02 | 자동완성 결과에 원하는 태그가 없을 때 | "분식점"을 입력하고 "새 태그 만들기"를 선택하면 | 태그가 즉시 생성되어 품목에 부착된다 |
| AC-03 | 품목에 태그 3개가 부착된 상태에서 | 결제를 저장하면 | payment_item_tag에 3개 레코드가 생성된다 |
| AC-04 | 태그 관리 화면에서 | 태그명을 수정하면 | 해당 태그가 부착된 모든 품목에서 새 이름으로 표시된다 |
| AC-05 | 태그 관리 화면에서 | 태그를 삭제하면 | payment_item_tag 연결이 모두 해제되고, user_tag_summary도 삭제된다 |
| AC-06 | 태그 통계 화면에서 기간을 선택하면 | 태그별 지출 목록이 표시되고 | 총액 기준 내림차순 정렬된다 |
| AC-07 | 교차 분석에서 "용돈"×카테고리를 선택하면 | "용돈" 태그가 달린 품목들의 카테고리 분포가 | Stacked BarChart로 표시된다 |
| AC-08 | 교차 분석에서 "김밍밍"+"용돈"을 선택하면 | 두 태그가 모두 달린 품목 목록이 | 테이블로 표시된다 |
| AC-09 | 그룹 가계부에서 | 그룹 태그를 생성하면 | 그룹 멤버 전원이 해당 태그를 사용할 수 있다 |
| AC-10 | 품목당 태그 10개 초과 시 | 태그 추가를 시도하면 | "최대 10개까지 가능합니다" 에러가 표시된다 |

---

## 5. Edge Cases & 에러 시나리오

| 시나리오 | 조건 | 처리 |
|----------|------|------|
| 태그명 중복 | 동일 사용자가 같은 이름의 태그 생성 시도 | 기존 태그 반환 (중복 생성 방지) |
| 태그 삭제 후 통계 | 삭제된 태그의 과거 통계 요청 | 집계 데이터 삭제, 과거 품목에서 태그 연결 해제 |
| 빈 태그명 | 공백만 입력 | 클라이언트 검증 → "태그명을 입력해주세요" |
| 특수문자 태그 | 이모지, 특수문자 포함 | 허용 (1~30자 제한만 적용) |
| 대량 태그 자동완성 | 태그 100개 이상 보유 시 | 상위 20개만 표시, 입력 시 필터링 |
| 그룹 태그 + 개인 태그 충돌 | 그룹 태그 "용돈"과 개인 태그 "용돈"이 모두 존재 | 별도 관리 (group_id로 구분), UI에서 "[그룹]" 라벨 표시 |
| 교차 분석 데이터 없음 | 선택 기간에 해당 태그 데이터가 없는 경우 | EmptyState 표시 |

---

## 6. API 연동

| 화면/기능 | Method | Endpoint | 비고 |
|-----------|--------|----------|------|
| 태그 자동완성 | GET | `/api/v1/tags?q={query}` | 자동완성용, 최근 사용 순 |
| 태그 생성 | POST | `/api/v1/tags` | `{ tag_name }` |
| 태그 수정 | PATCH | `/api/v1/tags/{tagId}` | `{ tag_name }` |
| 태그 삭제 | DELETE | `/api/v1/tags/{tagId}` | 연관 데이터 정리 |
| 품목에 태그 부착 | POST | `/api/v1/payment-items/{itemId}/tags` | `{ tag_ids: [] }` |
| 품목에서 태그 제거 | DELETE | `/api/v1/payment-items/{itemId}/tags/{tagId}` | |
| 태그별 통계 | GET | `/api/v1/tags/stats?from={date}&to={date}` | 기간 필터 |
| 교차 분석 | GET | `/api/v1/tags/stats/cross?type={type}&tagIds={ids}&from={date}&to={date}` | type: category, period, tag, member |
| 그룹 태그 목록 | GET | `/api/v1/groups/{groupId}/tags` | |
| 그룹 태그 생성 | POST | `/api/v1/groups/{groupId}/tags` | OWNER/MEMBER 가능 |

---

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 |
|--------|------|
| `tag` | 태그 정의 (account_id 또는 group_id 소유) |
| `payment_item_tag` | 품목-태그 M:N 연결 |
| `user_tag_summary` | 월간 태그별 집계 (기본 통계용) |
| `payment_item` | 결제 품목 (태그 부착 대상) |
| `payment` | 결제 건 (기간 필터용) |
| `category` | 카테고리 (교차 분석: 태그×카테고리) |

### 주요 쿼리 패턴

**태그별 통계 (기본)**:
```sql
SELECT t.tag_name, SUM(pi.amount) AS total, COUNT(*) AS count
FROM payment_item_tag pit
JOIN payment_item pi ON pit.payment_item_id = pi.payment_item_id
JOIN payment p ON pi.payment_id = p.payment_id
JOIN tag t ON pit.tag_id = t.tag_id
WHERE p.account_id = :accountId AND p.paid_at BETWEEN :from AND :to
GROUP BY t.tag_name ORDER BY total DESC;
```

**교차 분석: 태그×카테고리**:
```sql
SELECT t.tag_name, c.category_name, SUM(pi.amount) AS total
FROM payment_item_tag pit
JOIN payment_item pi ON pit.payment_item_id = pi.payment_item_id
JOIN payment p ON pi.payment_id = p.payment_id
JOIN tag t ON pit.tag_id = t.tag_id
JOIN category c ON pi.category_id = c.category_id
WHERE pit.tag_id = :tagId AND p.paid_at BETWEEN :from AND :to
GROUP BY t.tag_name, c.category_name ORDER BY total DESC;
```

**교차 분석: 태그×태그 (교집합)**:
```sql
SELECT pi.* FROM payment_item pi
WHERE pi.payment_item_id IN (
  SELECT payment_item_id FROM payment_item_tag WHERE tag_id = :tagId1
  INTERSECT
  SELECT payment_item_id FROM payment_item_tag WHERE tag_id = :tagId2
);
```

### 구현 방식

- **MVP**: 실시간 쿼리 (위 SQL 패턴)
- **Phase 1.5 (성능 이슈 시)**: `user_tag_cross_summary` 집계 테이블 추가 고려
- **인덱스**: `payment_item_tag(tag_id)`, `payment_item_tag(payment_item_id)` 복합 인덱스 필수
