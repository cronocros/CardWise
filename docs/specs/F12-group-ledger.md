# F12 - 가족/그룹 공유 가계부

> 최종 갱신: 2026-03-18

---

## 1. 개요

### 목적

가족, 친구, 동료 등이 공유 가계부를 생성하여 공동 지출을 관리하고, 멤버별/태그별 통계를 조회하는 기능을 정의한다. 그룹은 OWNER와 MEMBER 2단계 역할 기반 거버넌스를 따르며, 이메일 초대 방식으로 멤버를 추가한다. 개인 가계부와 그룹 가계부는 동일한 payment 테이블을 사용하되, group_id 존재 여부로 구분한다.

### 대상 사용자

- 가족 공동 생활비를 관리하려는 가구 구성원
- 친구/동료와 공동 경비를 추적하려는 소그룹
- 그룹 내 지출 현황을 분석하려는 관리자(OWNER)

---

## 2. 유저 스토리

| ID | 역할 | 스토리 | 비즈니스 가치 |
|----|------|--------|-------------|
| F12-US-01 | 회원 | 가족 공유 가계부 그룹을 생성하고 싶다 | 공동 지출 관리 |
| F12-US-02 | OWNER | 이메일로 가족/친구를 그룹에 초대하고 싶다 | 멤버 확장 |
| F12-US-03 | 피초대자 | 그룹 초대를 수락하거나 거절하고 싶다 | 참여 의사결정 |
| F12-US-04 | MEMBER | 그룹 가계부에 결제를 입력하고 싶다 | 공동 지출 기록 |
| F12-US-05 | 회원 | 그룹 전체 결제 내역을 조회하고 싶다 | 투명한 지출 공유 |
| F12-US-06 | OWNER | 멤버별 지출 통계를 확인하고 싶다 | 지출 분석 |
| F12-US-07 | OWNER | 규칙을 어긴 멤버를 추방하고 싶다 | 그룹 관리 |
| F12-US-08 | MEMBER | 더 이상 참여하지 않을 그룹에서 탈퇴하고 싶다 | 자유로운 탈퇴 |
| F12-US-09 | OWNER | 태그별 그룹 통계를 확인하여 지출 패턴을 분석하고 싶다 | 교차 분석 |
| F12-US-10 | OWNER | OWNER 역할을 다른 멤버에게 양도하고 싶다 | 관리 권한 이전 |

---

## 3. 화면 명세

### 3.1 내 그룹 목록 화면

- **진입 경로**: 가계부 탭 → 상단 "그룹" 세그먼트, `/groups`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 세그먼트 컨트롤 "개인 / 그룹" | SegmentedControl | - | 가계부 탭 내 전환 |
| 그룹 목록 | CardList | - | 그룹명 + 멤버 수 + 이번 달 총지출 |
| 그룹 생성 버튼 (+) | FAB | - | 하단 우측 |
| 대기 중 초대 알림 배지 | Badge (warning) | - | 수락 대기 중인 초대 N건 |
| 빈 상태 | EmptyState | - | 마스코트 Thinking + "참여 중인 그룹이 없습니다" |

**그룹 카드 구성**:
```
┌──────────────────────────────┐
│ 👨‍👩‍👧‍👦 우리 가족                    │
│ 멤버 3명 · OWNER              │
│ 이번 달 ₩2,450,000           │
│ 👤👤👤 (멤버 아바타 3개)        │
└──────────────────────────────┘
```

**사용자 인터랙션**:
1. 그룹 카드 탭 → 그룹 가계부 화면으로 이동
2. "+" FAB → 그룹 생성 폼으로 이동
3. 초대 배지 탭 → 초대 알림 화면으로 이동

---

### 3.2 그룹 생성 폼

- **진입 경로**: 그룹 목록 → "+" FAB, `/groups/new`
- **표시 방식**: 전체 화면

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 페이지 제목 "새 그룹 만들기" | Text (title-lg) | - | - |
| 그룹명 입력 | Input (text) | O | 1~50자 |
| 그룹 설명 입력 | Textarea | - | 최대 200자 |
| "만들기" 버튼 | Button (Primary) | - | 그룹명 입력 시 활성화 |

**사용자 인터랙션**:
1. 그룹명 입력 → "만들기" 클릭 → 그룹 생성 + 자동으로 OWNER 멤버 추가
2. 성공 시 그룹 상세 화면으로 이동 + "멤버를 초대해보세요" 안내 토스트

---

### 3.3 멤버 초대 폼

- **진입 경로**: 그룹 상세 → 설정 → "멤버 초대", `/groups/{groupId}/invite`
- **표시 방식**: BottomSheet

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 이메일 입력 | Input (email) | O | RFC 5322 형식 |
| "초대 보내기" 버튼 | Button (Primary) | - | 유효한 이메일 입력 시 활성화 |
| 현재 멤버 수 표시 | Text (caption) | - | "3 / 10명" |
| 대기 중 초대 목록 | List | - | 이메일 + PENDING 상태 + 만료까지 남은 일수 |

**사용자 인터랙션**:
1. 이메일 입력 → "초대 보내기" → group_invitation(PENDING) 생성 + 인앱 알림 발송
2. 대기 중 초대 항목의 "취소" 버튼 → 초대 취소 (EXPIRED 처리)

---

### 3.4 초대 알림 화면

- **진입 경로**: 알림 목록 또는 그룹 목록 초대 배지, `/groups/invitations`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 초대 목록 | CardList | - | 그룹명 + 초대자 닉네임 + 만료 남은 일수 |
| "수락" 버튼 | Button (Primary) | - | - |
| "거절" 버튼 | Button (Ghost) | - | - |

**초대 카드 구성**:
```
┌──────────────────────────────┐
│ "우리 가족" 그룹에 초대되었습니다  │
│ 초대자: 김민지                  │
│ 만료: D-5                      │
│           [거절]  [수락]        │
└──────────────────────────────┘
```

**사용자 인터랙션**:
1. "수락" → invitation_status = ACCEPTED + group_member 생성 (MEMBER) + 그룹 목록에 추가
2. "거절" → invitation_status = DECLINED + 목록에서 제거

---

### 3.5 그룹 가계부 목록

- **진입 경로**: 그룹 목록 → 그룹 카드 탭, `/groups/{groupId}/payments`
- **테마**: Rose Minimal (클린, 데이터 밀도 높음)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 그룹명 헤더 | Text (title-lg) | - | - |
| 이번 달 합계 | Text (display) | - | 마스킹 토글 지원 |
| 기간 필터 | DateRangePicker | - | 기본: 이번 달 |
| 결제 목록 | VirtualList | - | cursor pagination |
| 결제 입력 FAB | FAB | - | 하단 우측 |

**결제 항목 표시**:
```
┌──────────────────────────────┐
│ 👤 김민지 · 3월 18일 14:30      │
│ 스타벅스         ₩15,000      │
│ 🏷 식비, 카페                  │
└──────────────────────────────┘
```

- 각 결제 항목에 입력자 아바타(24px) + 닉네임 표시
- OWNER: 모든 항목에 "수정/삭제" 가능
- MEMBER: 본인 입력 항목만 "수정/삭제" 가능
- 타 멤버 입력 항목은 조회만 가능

**사용자 인터랙션**:
1. 결제 항목 탭 → 결제 상세 바텀시트
2. 결제 항목 좌측 스와이프 → "수정/삭제" (권한에 따라)
3. FAB → 그룹 결제 입력 폼 (payment.group_id 자동 설정)

---

### 3.6 그룹 통계 화면

- **진입 경로**: 그룹 가계부 → 상단 "통계" 탭, `/groups/{groupId}/stats`
- **테마**: Rose Blossom (라이트)

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 기간 선택 | MonthPicker | - | 기본: 이번 달 |
| 그룹 총 지출 | Text (display) | - | - |
| 멤버별 지출 파이차트 | DonutChart | - | 멤버 최대 10명 |
| 멤버별 지출 순위 | RankList | - | 금액 내림차순 |
| 태그별 지출 차트 | HorizontalBarChart | - | 태그 상위 10개 |
| 월별 추이 | AreaChart | - | 최근 6개월 |

**멤버별 파이차트**:
```
  🍩 (도넛 차트)
  총 ₩2,450,000

  김민지   ₩1,200,000 (49%)
  박영희   ₩1,250,000 (51%)
```

**사용자 인터랙션**:
1. 파이차트 세그먼트 탭 → 해당 멤버 결제 목록 필터
2. 태그 막대 탭 → 해당 태그 결제 목록 필터
3. 기간 변경 → 통계 데이터 갱신

---

### 3.7 그룹 설정 화면

- **진입 경로**: 그룹 가계부 → 톱니바퀴 아이콘, `/groups/{groupId}/settings`
- **테마**: Rose Minimal (클린)
- **접근 제한**: OWNER만 전체 설정 가능, MEMBER는 조회 + 탈퇴만

| 요소명 | 유형 | 필수 | 검증 규칙 |
|--------|------|------|----------|
| 그룹명 수정 | Input (text) | - | OWNER만 수정 가능 |
| 그룹 설명 수정 | Textarea | - | OWNER만 수정 가능 |
| 멤버 목록 | List | - | 아바타 + 닉네임 + 역할 배지 |
| 멤버 초대 버튼 | Button (Secondary) | - | OWNER만 표시 |
| 멤버 추방 버튼 | IconButton (X) | - | OWNER만, 각 MEMBER 항목에 표시 |
| OWNER 양도 | Button (Ghost) | - | OWNER만, 각 MEMBER 항목에 표시 |
| 그룹 탈퇴 | Button (Destructive) | - | MEMBER만 표시 |
| 그룹 삭제 | Button (Destructive) | - | OWNER만 표시 |

---

## 4. Acceptance Criteria

### AC-01: 그룹 생성

```
Given 로그인한 회원이 그룹 생성 폼에 접근한 상태
When  그룹명 "우리 가족"을 입력하고 "만들기"를 클릭하면
Then  ledger_group 레코드가 생성되고 (owner_account_id = 현재 사용자)
      group_member 레코드가 생성되고 (role = OWNER)
      GroupCreatedEvent가 발행되고
      그룹 상세 화면으로 이동한다
```

### AC-02: 멤버 초대

```
Given OWNER가 멤버 초대 폼에서 이메일을 입력한 상태
When  "family@example.com"을 입력하고 "초대 보내기"를 클릭하면
Then  group_invitation 레코드가 생성되고 (invitation_status = PENDING, expires_at = 7일 후)
      InvitationSentEvent가 발행되고
      피초대자에게 인앱 알림이 발송된다
```

### AC-03: 초대 수락

```
Given 피초대자가 초대 알림 화면에서 PENDING 초대를 확인한 상태
When  "수락" 버튼을 클릭하면
Then  invitation_status가 ACCEPTED로 변경되고
      group_member 레코드가 생성되고 (role = MEMBER)
      MemberJoinedEvent가 발행되고
      그룹 목록에 해당 그룹이 추가된다
```

### AC-04: 그룹 결제 입력

```
Given MEMBER가 그룹 가계부에서 결제 입력 FAB를 클릭한 상태
When  결제 정보를 입력하고 저장하면
Then  payment 레코드가 생성되고 (group_id = 해당 그룹, account_id = 입력자)
      그룹 가계부 목록에 입력자 아바타와 함께 표시된다
```

### AC-05: 그룹 통계 조회

```
Given OWNER가 그룹 통계 화면에 접근한 상태
When  이번 달 통계를 조회하면
Then  멤버별 지출 파이차트가 표시되고
      태그별 지출 차트가 표시되고
      월별 추이 그래프가 표시된다
```

### AC-06: 결제 수정/삭제 권한

```
Given MEMBER가 그룹 가계부를 조회하는 상태
When  본인이 입력한 결제를 스와이프하면
Then  "수정/삭제" 버튼이 표시된다
When  타 멤버가 입력한 결제를 스와이프하면
Then  아무 버튼도 표시되지 않는다
```

### AC-07: OWNER 전체 수정/삭제 권한

```
Given OWNER가 그룹 가계부를 조회하는 상태
When  어떤 멤버의 결제 항목이든 스와이프하면
Then  "수정/삭제" 버튼이 표시된다
```

### AC-08: 멤버 추방

```
Given OWNER가 그룹 설정에서 멤버를 추방하려는 상태
When  MEMBER의 추방 버튼을 클릭하고 확인하면
Then  group_member 레코드가 삭제되고
      해당 멤버의 기존 결제 데이터는 유지되고 (account_id 보존)
      추방된 멤버에게 알림이 발송된다
```

---

## 5. Edge Cases & 에러 시나리오

| # | 시나리오 | 예상 동작 |
|---|---------|----------|
| E-01 | **OWNER 탈퇴 시도** | 불가. "먼저 다른 멤버에게 OWNER 역할을 양도해주세요" 안내. OWNER 양도 후에만 탈퇴 가능 |
| E-02 | **OWNER 양도** | 대상 MEMBER의 role을 OWNER로 변경, 기존 OWNER는 MEMBER로 변경. ledger_group.owner_account_id도 갱신 |
| E-03 | **멤버 0명 그룹** | OWNER 1명이 항상 존재하므로 발생 불가. OWNER가 마지막 멤버인 경우 탈퇴 대신 "그룹 삭제"만 가능 |
| E-04 | **초대 중복** | 동일 이메일로 동일 그룹에 PENDING 초대가 이미 존재하면 "이미 초대 중입니다" 안내. 새 초대 생성 불가 |
| E-05 | **이미 가입된 멤버에게 초대** | 해당 이메일의 account가 이미 group_member에 존재하면 "이미 그룹에 참여 중인 사용자입니다" 안내 |
| E-06 | **미가입 이메일 초대** | 초대 레코드 생성 + 이메일 알림 발송. 피초대자가 가입 후 초대 목록에서 수락 가능 |
| E-07 | **초대 만료 (7일 경과)** | expires_at < now()인 초대는 EXPIRED 처리. 스케줄러 또는 조회 시점에 상태 갱신 |
| E-08 | **그룹 삭제 시 결제 데이터** | soft delete (ledger_group에 deleted_at 추가 고려) 또는 payment.group_id를 NULL로 변경하지 않고 그룹 정보 보존. 삭제된 그룹의 결제는 "(삭제된 그룹)" 라벨로 표시 |
| E-09 | **최대 멤버 수 초과** | max_members(기본 10) 초과 시 초대 불가. "최대 멤버 수에 도달했습니다" 안내 |
| E-10 | **동시 초대 수락** | group_member UNIQUE(group_id, account_id) 제약으로 중복 방지. 두 번째 수락은 409 Conflict |
| E-11 | **멤버 추방 후 재초대** | 추방된 멤버를 다시 초대 가능. 새 group_invitation 생성 → 수락 시 새 group_member 생성 |
| E-12 | **그룹 태그 vs 개인 태그** | 그룹 결제에 부착하는 태그는 tag.group_id가 해당 그룹 ID. 개인 태그(group_id IS NULL)와 분리. 그룹 태그는 모든 멤버가 생성 가능 |

---

## 6. API 연동

### 6.1 그룹 생성

```
POST /api/v1/groups
```

**요청**:
```json
{
  "groupName": "우리 가족",
  "description": "가족 공동 가계부"
}
```

**성공 응답** (201):
```json
{
  "data": {
    "groupId": 1,
    "groupName": "우리 가족",
    "description": "가족 공동 가계부",
    "role": "OWNER",
    "memberCount": 1,
    "maxMembers": 10
  }
}
```

### 6.2 내 그룹 목록

```
GET /api/v1/groups
```

### 6.3 그룹 상세

```
GET /api/v1/groups/{groupId}
```

### 6.4 그룹 설정 수정 (OWNER)

```
PATCH /api/v1/groups/{groupId}
```

### 6.5 그룹 삭제 (OWNER)

```
DELETE /api/v1/groups/{groupId}
```

### 6.6 멤버 초대 (OWNER)

```
POST /api/v1/groups/{groupId}/invite
```

**요청**:
```json
{
  "email": "family@example.com"
}
```

### 6.7 초대 수락/거절

```
POST /api/v1/groups/invitations/{invitationId}/accept
POST /api/v1/groups/invitations/{invitationId}/decline
```

### 6.8 멤버 추방 (OWNER)

```
DELETE /api/v1/groups/{groupId}/members/{memberId}
```

### 6.9 그룹 탈퇴 (MEMBER)

```
POST /api/v1/groups/{groupId}/leave
```

### 6.10 OWNER 양도

```
POST /api/v1/groups/{groupId}/transfer-ownership
```

**요청**:
```json
{
  "targetAccountId": "uuid-..."
}
```

### 6.11 그룹 결제 목록

```
GET /api/v1/groups/{groupId}/payments?cursor=&limit=20&from=&to=
```

### 6.12 그룹 결제 입력

```
POST /api/v1/groups/{groupId}/payments
```

### 6.13 그룹 태그 관리

```
GET  /api/v1/groups/{groupId}/tags
POST /api/v1/groups/{groupId}/tags
```

### 6.14 그룹 통계

```
GET /api/v1/groups/{groupId}/stats?yearMonth=2026-03
```

**응답**:
```json
{
  "data": {
    "groupId": 1,
    "groupName": "우리 가족",
    "currentMonth": {
      "totalExpense": 2450000,
      "currency": "KRW"
    },
    "memberStats": [
      { "accountId": "uuid-1", "displayName": "김민지", "spent": 1200000, "count": 15 },
      { "accountId": "uuid-2", "displayName": "박영희", "spent": 1250000, "count": 18 }
    ],
    "tagStats": [
      { "tagId": 1, "tagName": "식비", "amount": 800000, "count": 25 },
      { "tagId": 2, "tagName": "교통비", "amount": 350000, "count": 40 }
    ]
  }
}
```

---

## 7. 데이터 모델 연동

### 관련 테이블

| 테이블 | 역할 |
|--------|------|
| `ledger_group` | 그룹 마스터 (group_name, owner_account_id, max_members) |
| `group_member` | 그룹 멤버십 (OWNER/MEMBER, UNIQUE(group_id, account_id)) |
| `group_invitation` | 초대 관리 (PENDING → ACCEPTED/DECLINED/EXPIRED) |
| `payment` | 결제 (group_id nullable: NULL=개인, NOT NULL=그룹) |
| `tag` | 태그 (group_id nullable: NULL=개인, NOT NULL=그룹) |

### 거버넌스 모델 (DB 레벨 권한 체크)

```sql
-- 결제 수정/삭제 권한 체크
-- OWNER: 그룹 내 모든 결제
-- MEMBER: 본인 입력 결제만
SELECT CASE
  WHEN gm.role = 'OWNER' THEN true
  WHEN gm.role = 'MEMBER' AND p.account_id = $currentAccountId THEN true
  ELSE false
END AS can_modify
FROM payment p
JOIN group_member gm ON gm.group_id = p.group_id AND gm.account_id = $currentAccountId
WHERE p.payment_id = $paymentId;
```

### 주요 쿼리 패턴

```sql
-- 내 그룹 목록 (이번 달 총지출 포함)
SELECT lg.*, gm.role,
  (SELECT COUNT(*) FROM group_member WHERE group_id = lg.group_id) AS member_count,
  COALESCE(
    (SELECT SUM(p.krw_amount) FROM payment p
     WHERE p.group_id = lg.group_id
       AND p.paid_at >= date_trunc('month', now())
       AND p.deleted_at IS NULL), 0
  ) AS monthly_total
FROM ledger_group lg
JOIN group_member gm ON lg.group_id = gm.group_id
WHERE gm.account_id = $accountId
ORDER BY lg.updated_at DESC;

-- 그룹 결제 목록 (멤버 정보 포함)
SELECT p.*, ap.display_name, ap.account_id
FROM payment p
JOIN account_profile ap ON p.account_id = ap.account_id
WHERE p.group_id = $groupId AND p.deleted_at IS NULL
ORDER BY p.paid_at DESC;

-- 멤버별 통계
SELECT p.account_id, ap.display_name,
  SUM(p.krw_amount) AS total_spent,
  COUNT(*) AS payment_count
FROM payment p
JOIN account_profile ap ON p.account_id = ap.account_id
WHERE p.group_id = $groupId
  AND p.paid_at BETWEEN $from AND $to
  AND p.deleted_at IS NULL
GROUP BY p.account_id, ap.display_name
ORDER BY total_spent DESC;

-- 대기 중인 초대 목록 (피초대자 기준)
SELECT gi.*, lg.group_name, ap.display_name AS inviter_name
FROM group_invitation gi
JOIN ledger_group lg ON gi.group_id = lg.group_id
JOIN account_profile ap ON gi.inviter_id = ap.account_id
WHERE gi.invitee_email = $currentUserEmail
  AND gi.invitation_status = 'PENDING'
  AND gi.expires_at > now()
ORDER BY gi.created_at DESC;
```
