# CardWise - Requirements & Specification

## Context

CardWise는 한국 신용카드/체크카드 혜택 관리 플랫폼이다. 사용자가 보유한 카드의 혜택(할인, 적립, 바우처 등)을 한눈에 파악하고, 실제 사용 현황을 추적하며, 가계부 기능을 통해 지출을 관리하고, 가맹점 검색 시 최적의 카드를 추천받을 수 있다. 모든 데이터를 통계화하여 인사이트를 제공한다.

추후 실제 서비스 론칭을 목표로 하며, Freemium 모델로 수익화한다.

---

## 핵심 요구사항

| # | 요구사항 | 설명 |
|---|---------|------|
| R1 | 혜택 파악 | 내가 가진 카드의 바우처 및 베네핏 혜택 정보를 한눈에 파악 |
| R2 | 사용 현황 관리 | 바우처 및 베네핏의 실제 적용 현황과 사용 여부를 추적/관리 |
| R3 | 가계부 관리 | 결제 내역 기록, 혜택 적용 확인, 지출 관리 |
| R4 | 혜택 검색 | 가맹점/카테고리 검색 시 혜택 적용 가능 카드 추천 |
| R5 | 통계/인사이트 | 모든 데이터를 통계화하여 분석하고 인사이트 제공 |

---

## 도메인 핵심 개념

### Benefit vs Voucher 분리

- **Benefit** = 결제 시 자동 적용되는 혜택 (할인, 적립, 캐시백, 마일리지, 무이자)
  - 가계부(Ledger)와 직접 연결
  - `payment_item`에서 어떤 benefit이 적용되었는지 추적
- **Voucher** = 별도 사용/수령이 필요한 혜택 (쿠폰, 서비스, 라운지, 보험 등)
  - 사용자 도메인에서 상태(잔여 횟수, 사용 이력) 추적

### 연간 실적 계산

- 카드 발급일(`issued_at`) 기준으로 연간 실적 산정 (달력 연도가 아님)
- 예: 발급일 2025-06-15 -> 연간 기간: 2025.06 ~ 2026.05

### 결제-품목 구조

- 1건의 결제(Payment) -> N개의 품목(PaymentItem)
- 품목별로 카테고리, 혜택 적용, 태그 부여 가능
- 쿠팡 등 복수 품목 주문 대응

---

## 상세 기획서 (docs/specs/)

각 기능의 화면 명세, Acceptance Criteria, Edge Cases, API 연동 등은 상세 기획서를 참조한다.

| 기획서 | 기능 | 파일 |
|--------|------|------|
| AUTH | 회원가입/로그인/OAuth | [AUTH-signup-login.md](../specs/AUTH-signup-login.md) |
| F1 | 카드 등록/관리 | [F1-card-management.md](../specs/F1-card-management.md) |
| F2 | 가계부 (수동 입력 + 해외결제) | [F2-ledger-manual.md](../specs/F2-ledger-manual.md) |
| F3 | 가계부 인박스 (확인 필요 항목) | [F3-ledger-inbox.md](../specs/F3-ledger-inbox.md) |
| F4 | 연간/월간 실적 관리 | [F4-performance-tracking.md](../specs/F4-performance-tracking.md) |
| F5 | 혜택 검색 | [F5-benefit-search.md](../specs/F5-benefit-search.md) |
| F6 | 바우처 관리 | [F6-voucher-management.md](../specs/F6-voucher-management.md) |
| F7 | 알림 | [F7-notification.md](../specs/F7-notification.md) |
| F8 | 대시보드 + 태그 교차 분석 | [F8-dashboard.md](../specs/F8-dashboard.md) |
| F12 | 가족/그룹 공유 가계부 | [F12-group-ledger.md](../specs/F12-group-ledger.md) |
| TAG | 태그 시스템 & 통계 | [TAG-system.md](../specs/TAG-system.md) |

---

## 기능 명세

### Phase 1 (MVP)

| # | 기능 | 설명 | 관련 요구사항 |
|---|------|------|-------------|
| F1 | 카드 등록/관리 | 사용자 카드 등록, 발급일 관리, 실적 구간 설정 | R1 |
| F2 | 가계부 (수동 입력) | 결제 건 + 품목 수동 입력, 태그 부여 | R3 |
| F3 | 가계부 인박스 | 확인 필요 항목(환율 확정, 청구할인, 중복 의심 등) 사용자 확인 인박스 | R3 |
| F4 | 연간/월간 실적 관리 | 자동 집계, 실적 구간 충족 여부 판정, 연간/월간 기산 방식, 혜택 기준월 lag, 그레이스 기간, 실적 제외 규칙 | R2 |
| F5 | 혜택 검색 | 가맹점/카테고리 검색 -> 최적 카드 추천 | R4 |
| F6 | 바우처 관리 | 사용/미사용 체크, 잔여 횟수 추적, 만료 알림, 바우처 잠금해제 조건 | R2 |
| F7 | 알림 | 바우처 만료 알림, 실적 리마인더 | R2 |
| F8 | 대시보드 | 월간 종합, 카테고리별/카드별/태그별 통계 + 태그 교차 분석 | R5 |
| F12 | 가족/그룹 공유 가계부 | 그룹 생성, 멤버 초대/추방, 공유 결제 관리, 거버넌스 | R3, R5 |

> **Note:** 이메일 파싱(기존 F3)은 Phase 1.5로 이동. MVP에서는 인박스(확인 필요 항목) 기능으로 대체.

### Phase 2

| # | 기능 | 설명 | 관련 요구사항 |
|---|------|------|-------------|
| F9 | SMS 파싱 | 모바일 앱에서 SMS 결제 내역 파싱 | R3 |

### Phase 3 (추후)

| # | 기능 | 설명 | 관련 요구사항 |
|---|------|------|-------------|
| F10 | 카드사 이벤트 검색 | 진행 중인 카드사 이벤트/프로모션 수집 | R4 |
| F11 | 사후 분석 | 다른 카드 사용 시 절약 시뮬레이션 | R5 |

---

## 프로세스 흐름

### F1: 카드 등록/관리

```
[사용자]
  |
  | 1. 카드 검색 (카드사/카드명)
  v
[카드 검색 화면]
  |
  | 2. 카드 선택
  v
[카드 상세 확인]
  |
  | 3. 발급일 입력 + 현재 실적 구간 선택
  v
[Backend: UserCard 생성]
  |
  +-- 3a. user_card 저장 (card_id, issued_at)
  +-- 3b. user_performance 초기화 (현재 월)
  +-- 3c. user_voucher 인스턴스 생성 (해당 카드의 card_voucher 기반)
  +-- 3d. user_benefit_usage 초기화 (해당 카드의 card_benefit 기반)
  |
  | 4. UserCardRegisteredEvent 발행
  v
[Notification] -> 등록 완료 알림
[Cache] -> user:{accountId}:dashboard 무효화
```

### F2: 가계부 - 수동 입력

```
[사용자]
  |
  | 1. 결제 정보 입력 (날짜, 카드, 총액, 통화)
  |    -> 통화 선택 (기본: KRW, 해외: USD/EUR/JPY 등)
  |    -> 해외결제 시: 원본 금액 + KRW 환산 금액 입력
  |    -> 그룹 가계부 선택 가능 (개인/그룹)
  v
[결제 입력 폼]
  |
  | 2. 품목 추가 (1~N개)
  |    각 품목: 이름, 금액, 카테고리, 태그 (N개 자유 부착)
  v
[가맹점 자동 매칭]
  |
  | 3. merchant_alias 검색 (fuzzy match)
  |    -> 매칭 성공: merchant_id 연결
  |    -> 매칭 실패: merchant_name_raw만 저장
  v
[혜택 자동 매칭]
  |
  | 4. 품목별 card_benefit 자동 추천
  |    -> merchant_id 또는 category_id 기준
  |    -> 사용자가 확인/수정 가능
  v
[Backend: Payment + PaymentItem 저장]
  |
  +-- 5a. payment 생성
  +-- 5b. payment_item(s) 생성 (card_benefit_id, benefit_amount 포함)
  +-- 5c. payment_item_tag 연결
  |
  | 6. PaymentCreatedEvent 발행
  v
[이벤트 핸들러들]
  +-- user_performance 갱신 (월간 실적 재계산)
  +-- user_benefit_usage 갱신 (한도 소진 업데이트)
  +-- Analytics summary 갱신
  +-- Cache 무효화 (dashboard, performance)
```

### F3: 가계부 — 인박스 (확인 필요 항목)

```
[시스템 이벤트]
  |
  +--[환율 확정 필요]---------> FX_CORRECTION_NEEDED
  +--[청구할인 감지]----------> BILLING_DISCOUNT_FOUND
  +--[중복 결제 의심]---------> DUPLICATE_DETECTED
  +--[카테고리 미매핑]--------> CATEGORY_UNMAPPED
  +--[엑셀 업로드 검토]-------> EXCEL_REVIEW
  +--[실적 제외 확인]---------> PERFORMANCE_EXCLUSION_CHECK
  |
  v
[user_pending_action 생성 (PENDING)]
  |
  | PendingActionCreatedEvent 발행
  v
[Notification] -> 사용자에게 "확인 필요 N건" 배지 + 알림
  |
  v
[사용자 인박스 화면]
  |
  +--[확인 (RESOLVED)]--------+--[무시 (DISMISSED)]
  |                            |
  v                            v
[연관 테이블 갱신]            [pending_action
 payment_adjustment 생성      status=DISMISSED]
 user_performance 재계산      [종료]
  |
  | PaymentAdjustedEvent 발행
  v
[이벤트 핸들러들]
  +-- user_performance 갱신
  +-- Analytics 갱신
  +-- Cache 무효화
```

### F3-Legacy: 가계부 - 이메일 파싱 (Phase 1.5)

```
[이메일 수신]
  |
  | 1. 카드사별 이메일 감지
  v
[Email Parser Module]
  |
  | 2. email_parse_rule 기반 파싱
  |    -> 카드사, 결제일, 금액, 가맹점명 추출
  v
[payment_draft 생성 (PENDING)]
  |
  | 3. PaymentDraftCreatedEvent 발행
  v
[Notification] -> 사용자에게 확인 요청 알림
  |
  v
[사용자 확인 화면]
  |
  +--[확인(CONFIRMED)]-----+--[거부(REJECTED)]
  |                         |
  v                         v
[payment + payment_item    [draft 상태 REJECTED]
 생성]                      [종료]
  |
  | 4. draft.payment_id 연결
  | 5. PaymentCreatedEvent 발행
  v
[이벤트 핸들러들] (F2와 동일)
```

### F4: 연간/월간 실적 관리

```
[실적 조회 요청]
  |
  v
[Backend: 실적 계산]
  |
  | 1. user_card.issued_at 기준 연간 기간 산출
  |    예: issued_at=2025-06-15
  |        연간: 2025-06 ~ 2026-05
  |        현재월: 2026-03 -> 연간 10번째 월
  |
  | 2. user_performance에서 해당 기간 조회
  |    -> annual_accumulated (연간 누적)
  |    -> monthly_spent (이번달)
  |
  | 3. performance_tier와 비교
  |    -> 현재 구간 판별
  |    -> 다음 구간까지 남은 금액 계산
  v
[실적 현황 화면]
  |
  +-- 연간 누적 실적 / 목표
  +-- 월별 실적 추이 (차트)
  +-- 현재 달성 구간 / 다음 구간 안내
  +-- 전월 대비 증감

--- 실적 자동 갱신 (이벤트 기반) ---

[PaymentCreatedEvent 수신]
  |
  v
[UserCard Module]
  |
  | 1. payment.user_card_id로 user_card 조회
  | 2. issued_at 기준 해당 월/연 판별
  | 3. user_performance.monthly_spent += payment.total_amount
  | 4. user_performance.annual_accumulated 재계산
  | 5. 새 performance_tier 판별
  |
  +--[구간 변경됨?]
  |  |
  |  +--[Yes] -> PerformanceTierChangedEvent 발행
  |  +--[No]  -> 종료
  v
[PerformanceTierChangedEvent]
  -> Notification: "실적 구간이 50만 -> 100만으로 올라갔습니다"
  -> Benefit: 혜택 조건 재평가 (더 높은 구간 혜택 적용)
```

### F5: 혜택 검색 (가맹점/카테고리 -> 카드 추천)

```
[사용자]
  |
  | 1. 검색어 입력 (예: "스타벅스", "편의점")
  v
[검색 분류]
  |
  +--[가맹점 검색]-------------------+--[카테고리 검색]
  |                                   |
  | 2a. merchant_alias                | 2b. category
  |     fuzzy search (pg_trgm)        |     계층 탐색
  |     -> merchant_id 확정            |     -> category_id 확정
  v                                   v
[Cache 조회: recommend:{accountId}:{targetId}]
  |
  +--[Hit] -> 바로 반환
  +--[Miss] -> DB 조회
  |
  v
[혜택 매칭]
  |
  | 3. 사용자의 user_card 목록 조회
  | 4. 각 카드별 card_benefit 조회
  |    -> target_type = MERCHANT (merchant_id 매칭)
  |    -> target_type = CATEGORY (category_id 매칭, 상위 카테고리 포함)
  |    -> target_type = ALL
  | 5. user_performance 기준 현재 tier 확인
  |    -> tier 조건 충족하는 benefit만 필터
  | 6. user_benefit_usage 확인
  |    -> 월간 한도 소진 여부 반영
  v
[추천 결과 정렬]
  |
  | 7. 혜택 금액/비율 기준 정렬
  |    -> "삼성카드 taptap O: 스타벅스 10% 할인 (월 3회 중 1회 사용)"
  |    -> "신한카드 Deep Dream: 카페 5% 적립 (한도 여유 있음)"
  v
[캐시 저장 -> 응답]
```

### F6: 바우처 관리

```
[바우처 목록 화면]
  |
  | 1. user_voucher 목록 조회 (user_card별)
  |    -> remaining_count / total_count
  |    -> 유효기간 (valid_from ~ valid_until)
  v
[바우처 상세]
  |
  +--[사용 기록]----+--[사용 처리]----+--[취소 처리]
  |                  |                  |
  | 2a. user_voucher | 2b. 사용 처리   | 2c. 취소 처리
  |     _log 조회    |                  |
  v                  v                  v
[이력 목록]     [Backend]          [Backend]
                |                   |
                | remaining_count   | remaining_count
                | -= 1              | += 1
                | user_voucher_log  | user_voucher_log
                | (action=USE)      | (action=CANCEL)
                |                   |
                | VoucherUsedEvent  | VoucherCancelledEvent
                v                   v
           [Analytics 갱신]    [Analytics 갱신]

--- 만료 알림 (스케줄러) ---

[Daily Scheduler]
  |
  | 1. valid_until이 7일/3일/1일 이내인 user_voucher 조회
  |    WHERE remaining_count > 0
  v
[VoucherExpiringEvent 발행]
  |
  v
[Notification Module]
  -> "삼성카드 taptap O 라운지 이용권이 3일 후 만료됩니다 (잔여 2회)"
```

### F7: 알림

```
[알림 트리거]
  |
  +--[VoucherExpiringEvent]-----> "바우처 만료 임박" 알림
  +--[PerformanceTierChanged]---> "실적 구간 변경" 알림
  +--[PaymentDraftCreated]------> "결제 내역 확인 요청" 알림
  +--[CardRegisteredEvent]------> "카드 등록 완료" 알림
  +--[Monthly Scheduler]--------> "이번 달 실적 리마인더" 알림
  |
  v
[Notification Module]
  |
  | 1. notification_setting 확인 (사용자별 on/off)
  | 2. 알림 채널 결정
  v
  +--[Push 알림] (Phase 2+)
  +--[In-App 알림]
  +--[이메일 알림] (PREMIUM)
```

### F8: 대시보드

```
[대시보드 화면 요청]
  |
  v
[Cache 조회: user:{accountId}:dashboard]
  |
  +--[Hit] -> 바로 렌더링
  +--[Miss] -> 아래 데이터 조회
  v
[병렬 데이터 로드]
  |
  +-- (A) user_monthly_summary -> 이번 달 총 지출, 총 혜택, 절약액
  +-- (B) user_card_summary    -> 카드별 사용 금액 / 혜택 금액
  +-- (C) user_category_summary -> 카테고리별 지출 비중 (파이 차트)
  +-- (D) user_tag_summary     -> 태그별 지출 (사용자 커스텀 분석)
  +-- (E) user_performance     -> 카드별 실적 달성률
  +-- (F) user_voucher         -> 미사용 바우처 요약
  v
[대시보드 렌더링]
  +-- 월간 요약 카드 (총 지출 / 총 혜택 / 절약률)
  +-- 카드별 사용 현황 (막대 차트)
  +-- 카테고리 분포 (파이/도넛 차트)
  +-- 실적 달성 게이지 (카드별)
  +-- 바우처 잔여 현황 (배지)
  +-- 전월 대비 증감 (화살표 표시)
```

### 관리자: 카드 데이터 크롤링

```
[크롤링 스케줄러 / 수동 트리거]
  |
  | 1. crawl_source 조회 (카드사별 URL/설정)
  v
[Crawler Module]
  |
  | 2. crawl_log 생성 (crawl_status=STARTED)
  | 3. 카드사 웹 크롤링 실행
  |
  +--[성공]-----------------------------+--[실패]
  |                                      |
  | 4a. crawl_log.crawl_status=SUCCESS   | 4b. crawl_log.crawl_status=FAILED
  | 5. 기존 데이터와 diff 비교            |     error_message 기록
  |    -> 변경분만 crawl_draft 생성       |     [종료]
  v
[crawl_draft(s) 생성]
  |
  | reference_type = BENEFIT | VOUCHER
  | draft_status = PENDING
  | raw_data = JSONB (파싱된 원본)
  v
[관리자 검수 화면]
  |
  +--[APPROVED]-------------------+--[REJECTED]
  |                                |
  | 6a. card_benefit 또는           | 6b. draft_status=REJECTED
  |     card_voucher 생성/수정      |     [종료]
  | 7. card_benefit_history 기록    |
  | 8. DraftApprovedEvent 발행     |
  v
[CardDataChangedEvent 발행]
  |
  +-- Benefit Module: 캐시 무효화
  +-- 검색 인덱스 갱신
```

---

## 사용자 시나리오 (End-to-End)

### 시나리오 1: 신규 사용자 가입 ~ 첫 결제 기록

```
1. 회원가입 (Supabase Auth)
2. 카드 등록 (삼성카드 taptap O, 발급일 2025-03-01)
   -> user_card, user_performance, user_voucher, user_benefit_usage 초기화
3. 스타벅스 결제 5,000원 수동 입력
   -> merchant_alias "스타벅스" 매칭 -> merchant_id
   -> card_benefit "카페 10% 할인" 자동 추천 -> 사용자 확인
   -> payment + payment_item 저장 (benefit_amount=500)
4. 대시보드에서 확인
   -> 이번 달 지출 5,000원, 혜택 500원, 절약률 10%
```

### 시나리오 2: 가맹점 검색으로 최적 카드 찾기

```
1. "스타벅스" 검색
2. 내 카드 3장에서 혜택 조회
   -> 삼성 taptap O: 카페 10% 할인 (월 3회, 1회 사용)
   -> 신한 Deep Dream: 카페 5% 적립 (한도 여유)
   -> 현대 M포인트: 해당 없음
3. "삼성 taptap O로 결제하면 500원 할인" 추천
```

### 시나리오 3: 바우처 만료 알림

```
1. [D-3 스케줄러] 삼성 taptap O 공항 라운지 이용권 만료 임박 감지
2. 알림: "공항 라운지 이용권이 3일 후 만료됩니다 (잔여 1회)"
3. 사용자가 바우처 화면에서 사용 처리
4. remaining_count 0 -> 완전 소진
```

---

## 데이터 수집 요구사항

### 카드 데이터 (관리자 측)

| 수집 방식 | 흐름 |
|----------|------|
| 크롤링 | 카드사 웹 -> 크롤러 -> Draft(PENDING) -> 관리자 검수(APPROVED/REJECTED) -> Master 반영 |
| 수동 입력 | 관리자 패널 -> Master 직접 입력 |
| 변경 추적 | 혜택/바우처 변경 시 이력 기록 |

### 거래 데이터 (사용자 측)

| 수집 방식 | 흐름 |
|----------|------|
| 수동 입력 | 사용자 -> payment + payment_item 직접 생성 |
| 엑셀 업로드 | 사용자 -> 엑셀 템플릿 업로드 -> 중복 감지 -> 미리보기 -> 확인 -> payment 생성 |
| 이메일 파싱 | 이메일 -> Draft(PENDING) -> 사용자 확인(CONFIRMED) -> payment 생성 |
| 마이데이터 (향후) | 마이데이터 API -> 자동 수집 -> 사용자 확인 -> payment 생성 |
| SMS (Phase 2) | SMS -> Draft -> 사용자 확인 -> payment 생성 |

---

### F12: 가족/그룹 공유 가계부

```
[그룹 생성]
  |
  | 1. 그룹명, 설명 입력
  v
[Backend: LedgerGroup 생성]
  |
  +-- ledger_group 저장 (owner_account_id = 현재 사용자)
  +-- group_member 생성 (role = OWNER)
  |
  | 2. GroupCreatedEvent 발행
  v
[멤버 초대]
  |
  | 3. OWNER가 이메일로 멤버 초대
  v
[group_invitation 생성 (PENDING, 7일 만료)]
  |
  | 4. InvitationSentEvent 발행 → 이메일/인앱 알림
  v
[피초대자]
  |
  +--[수락(ACCEPTED)]-----+--[거절(DECLINED)]
  |                        |
  | group_member 생성      | invitation_status 갱신
  | (role = MEMBER)        | [종료]
  | MemberJoinedEvent      |
  v
[그룹 가계부 사용]
  |
  | 5. 모든 멤버가 결제 입력 가능
  |    payment.group_id = {group_id}
  |    payment.account_id = 입력한 멤버
  |
  | 6. 조회: 모든 멤버가 그룹 전체 결제 조회 가능
  | 7. 수정/삭제:
  |    OWNER → 모든 멤버의 결제 수정/삭제 가능
  |    MEMBER → 본인이 입력한 결제만 수정/삭제 가능
  v
[그룹 통계]
  +-- 멤버별 지출 비교
  +-- 태그별 그룹 통계 (교차 분석)
  +-- 월별 그룹 지출 추이
```

### 태그 시스템 상세

```
[태그 부착]
  |
  | 1. 결제 항목(payment_item)에 N개 태그 자유 부착
  |    예: "A분식 15000원" → 태그: 김밍밍, 용돈, 분식점
  |
  | 2. 태그 자동완성 (기존 태그 목록에서)
  |    → 매칭 없으면 신규 태그 즉시 생성
  v
[태그 통계 — 기본]
  |
  +-- 태그별 총 지출, 건수
  +-- 태그별 기간 추이 (월별)
  v
[태그 통계 — 교차 분석]
  |
  +-- 태그 × 카테고리: "용돈 중 카페 비중은?"
  +-- 태그 × 멤버: "김밍밍 vs 박영희 지출 비교" (그룹 가계부)
  +-- 태그 × 기간: "용돈 월별 추이"
  +-- 태그 × 태그: "김밍밍 + 용돈 교집합 항목"
  |
  | MVP: 실시간 쿼리 (집계 테이블 없이)
  | Phase 1.5: 성능 이슈 시 user_tag_cross_summary 추가
```

---

## 수익 모델 (Freemium)

| 항목 | FREE | PREMIUM |
|------|------|---------|
| 카드 등록 | 3장 | 무제한 |
| 결제 입력 | 수동 | 수동 + 엑셀 업로드 + 이메일 파싱(Phase 1.5) + 마이데이터(Phase 2) |
| 혜택 검색 | 기본 | 고급 |
| 통계 | 기본 | 고급 통계 + 인사이트 |
| 알림 | - | 바우처 만료, 실적 리마인더 |

---

## 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 응답 속도 | 일반 API < 200ms, 검색 API < 500ms |
| 가용성 | 99.5% (Managed Service 의존) |
| 동시 사용자 | MVP 기준 100명 |
| 데이터 보존 | 결제 이력 영구 보존, 분석 데이터 2년 |
| 보안 | OWASP Top 10 대응, 개인정보 암호화 |

---

## 검증 계획

1. Supabase 프로젝트 생성 후 마이그레이션 SQL 실행하여 전체 테이블 생성 확인
2. 시드 데이터 (카드사 3개, 카드 5개, 혜택 20개, 카테고리/가맹점) 입력
3. 핵심 쿼리 테스트:
   - "스타벅스에서 내 카드 중 최적 추천" 쿼리
   - "이번 달 실적 충족률" 쿼리
   - "바우처 잔여 현황" 쿼리
4. Spring Boot 프로젝트 초기화, 헥사고날 모듈 구조 확인
5. Next.js 프로젝트 초기화, API 연동 확인
