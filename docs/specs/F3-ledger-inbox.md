# F3 - 가계부 인박스 (확인 필요 항목)

> 최종 갱신: 2026-03-19

---

## 1. 개요

### 목적
사용자가 확인하거나 처리해야 하는 항목을 한 곳에서 관리하는 인박스 기능을 정의한다. 환율 확정(FX Correction), 청구할인 감지, 중복 결제 의심, 카테고리 미매핑, 엑셀 업로드 검토 등 시스템이 자동으로 처리할 수 없는 항목을 사용자에게 확인 요청한다.

DB 테이블: user_pending_action
- action_type ENUM: FX_CORRECTION_NEEDED, BILLING_DISCOUNT_FOUND, PAYMENT_CONFIRMATION, DUPLICATE_DETECTED, CATEGORY_UNMAPPED, EXCEL_REVIEW, PERFORMANCE_EXCLUSION_CHECK
- status: PENDING / RESOLVED / DISMISSED
- priority: HIGH / MEDIUM / LOW

### 대상 사용자
- 해외 결제 후 환율 확정을 기다리는 회원
- 청구할인이나 결제대금 차감이 감지된 회원
- 엑셀 업로드 후 데이터 검토가 필요한 회원
- 중복 결제 의심 항목이 있는 회원

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| F3-US-01 | 회원 | 확인이 필요한 항목 목록을 한 곳에서 보고 싶다 | 미처리 항목 관리 |
| F3-US-02 | 회원 | 환율이 확정되면 결제 금액을 보정하고 싶다 | 가계부 정확도 |
| F3-US-03 | 회원 | 청구할인이 감지되면 가계부에 반영하고 싶다 | 실제 지출 반영 |
| F3-US-04 | 회원 | 중복 의심 결제를 확인하고 유지/삭제를 결정하고 싶다 | 데이터 정확도 |
| F3-US-05 | 회원 | 확인 완료된 항목은 목록에서 사라지게 하고 싶다 | 깔끔한 관리 |
| F3-US-06 | 회원 | 대시보드에서 "확인 필요 N건" 배지를 보고 싶다 | 빠른 인지 |

## 3. 화면 명세

### 3.1 인박스 목록 화면
- 진입 경로: 대시보드 "확인 필요 N건" 배지 탭 또는 가계부 탭 → 인박스 아이콘, /inbox
- 테마: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 페이지 제목 "확인 필요" | Text (title-lg) | - | 미처리 건수 배지 |
| 필터 탭 | TabGroup | - | "전체", "높음", "보통", "낮음" |
| 상태 필터 | ChipGroup | - | "미처리" (기본), "처리 완료", "무시" |
| 인박스 항목 목록 | List | - | 우선순위별 정렬 (HIGH → MEDIUM → LOW), 생성일 역순 |
| 빈 상태 | EmptyState | - | 마스코트 Celebrating + "확인할 항목이 없습니다!" |

### 3.2 인박스 항목 카드 (목록 아이템)

| 요소명 | 유형 | 설명 |
|--------|------|------|
| 우선순위 아이콘 | Icon | HIGH: 🔴, MEDIUM: 🟡, LOW: 🟢 |
| 항목 유형 배지 | Badge | "환율 확정", "청구할인", "중복 의심" 등 |
| 제목 | Text (bold) | "USD 결제 환율 확정 필요" |
| 설명 | Text (muted) | "Amazon $45.00 → 확정 환율 적용 대기 중" |
| 생성일 | Text (caption) | "2일 전" |
| 처리 버튼 | Button group | "확인" / "무시" |

### 3.3 항목 유형별 처리 화면 (Bottom Sheet)

각 action_type별 처리 UI:

**FX_CORRECTION_NEEDED (환율 확정)**:
- 원본: USD $45.00 × 임시 환율 1,300 = ₩58,500
- 확정: USD $45.00 × 확정 환율 1,285 = ₩57,825
- 차액: -₩675
- [확정 적용] [무시]

**BILLING_DISCOUNT_FOUND (청구할인 감지)**:
- 원본 결제: ₩50,000
- 청구할인: -₩5,000
- 확정 금액: ₩45,000
- [할인 반영] [무시]

**DUPLICATE_DETECTED (중복 의심)**:
- 결제 A: 3/15 스타벅스 ₩5,500
- 결제 B: 3/15 스타벅스 ₩5,500 (동일?)
- [둘 다 유지] [B 삭제] [A 삭제]

**CATEGORY_UNMAPPED (카테고리 미매핑)**:
- 가맹점: "알 수 없는 가맹점명"
- 카테고리 선택 드롭다운
- [저장]

**EXCEL_REVIEW (엑셀 업로드 검토)**:
- 업로드된 N건 중 M건 확인 필요
- 각 항목별 수정/승인/삭제

**PERFORMANCE_EXCLUSION_CHECK (실적 제외 확인)**:
- 결제: 국세청 ₩500,000
- 자동 제외 사유: TAX (세금)
- [제외 유지] [실적에 포함]

## 4. Acceptance Criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | 확인 필요 항목이 3건 있는 상태 | 대시보드를 조회하면 | "확인 필요 3건" 배지가 표시된다 |
| AC-02 | FX_CORRECTION 항목을 "확정 적용"하면 | payment.final_krw_amount가 갱신되고 | payment.is_adjusted=true, payment_adjustment 레코드 생성, pending_action status=RESOLVED |
| AC-03 | DUPLICATE_DETECTED 항목에서 "B 삭제"하면 | 해당 payment가 soft delete되고 | user_performance 재계산, pending_action status=RESOLVED |
| AC-04 | 항목을 "무시"하면 | pending_action status=DISMISSED로 변경 | 인박스 목록에서 제거 (필터로 조회 가능) |
| AC-05 | 모든 항목을 처리하면 | 인박스 빈 상태 화면 표시 | 마스코트 Celebrating + "확인할 항목이 없습니다!" |

## 5. Edge Cases & 에러 시나리오

| 시나리오 | 조건 | 처리 |
|----------|------|------|
| 동시 처리 | 다른 디바이스에서 동시에 같은 항목 처리 | Optimistic Lock, 먼저 처리한 쪽 반영 |
| 원본 결제 삭제 후 | pending_action의 reference_id가 삭제된 payment 가리킴 | "원본 결제가 삭제되었습니다" 표시, 자동 DISMISSED 처리 |
| 대량 미처리 | 100건 이상 미처리 | 페이지네이션 (20건씩), 우선순위별 정렬 |
| 자동 해소 | 시스템이 자동으로 해결 가능한 항목 (예: 환율 자동 확정) | 자동 RESOLVED 처리 + "자동 처리됨" 라벨 |

## 6. API 연동

| 화면/기능 | Method | Endpoint | 비고 |
|-----------|--------|----------|------|
| 인박스 목록 | GET | `/api/v1/pending-actions?status=PENDING&priority=HIGH` | 필터, 정렬, 페이지네이션 |
| 인박스 건수 | GET | `/api/v1/pending-actions/count?status=PENDING` | 배지용 |
| 항목 처리 (확인) | PATCH | `/api/v1/pending-actions/{actionId}/resolve` | body: 처리 상세 |
| 항목 무시 | PATCH | `/api/v1/pending-actions/{actionId}/dismiss` | - |

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 |
|--------|------|
| `user_pending_action` | 사용자 확인 필요 항목 (핵심) |
| `payment` | 결제 건 (reference_table='payment') |
| `payment_adjustment` | 결제 보정 이력 |
| `payment_item` | 품목 (실적 제외 확인) |

### 핵심 비즈니스 로직

1. **항목 생성**: 시스템 이벤트(결제 보정, 엑셀 업로드, 중복 감지) → user_pending_action INSERT
2. **항목 처리**: 사용자 확인 → 연관 테이블 갱신 → status = RESOLVED, resolved_at 기록
3. **항목 무시**: status = DISMISSED (이후 필터로 재조회 가능)
4. **자동 해소**: 환율 확정 등 시스템이 자동 처리 가능한 경우 → status = RESOLVED + 자동 처리 표시
5. **배지 갱신**: PENDING 건수 변경 시 대시보드 캐시 무효화
