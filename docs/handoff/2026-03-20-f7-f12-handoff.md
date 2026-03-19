# F7/F12 Handoff - 2026-03-20

## 범위
- F7 알림 센터
- F12 그룹 가계부 쓰기/거버넌스
- 기준: 인증/인가 제외, 아키텍처 우선

## 현재 상태 요약
- 브랜치: `codex/integration-phase1`
- 상태: 작업 중단 지점
- 워크트리: dirty
- 커밋/푸시: 이번 F7/F12 턴은 아직 없음

## 이번 턴에서 확인한 사실
- 실제 원격 DB에는 `notification` 테이블이 없음
- 실제 원격 DB에는 `notification_setting` 테이블이 있고 컬럼은 다음과 같음
  - `voucher_expiry_alert`
  - `performance_reminder`
  - `payment_confirm_alert`
  - `email_notification`
  - `push_notification`
- 실제 원격 DB의 `tag` 테이블에는 이미 `group_id`가 있음
- 실제 원격 DB의 `ledger_group`에는 아직 `deleted_at`이 없음
- 현재 리포에는 Supabase SQL migration 기반 흐름이 있으므로 스키마 변경은 `supabase/migrations`로 맞추는 것이 맞음

## 이미 만들어 둔 것
- 신규 migration 초안
  - [20260320093000_f7_f12_notification_group_ops.sql](/E:/Dev_ai/CardWise/supabase/migrations/20260320093000_f7_f12_notification_group_ops.sql)
  - 현재 내용:
    - `notification` 테이블 생성
    - `ledger_group.deleted_at` 추가
    - `notification` RLS/policy 추가
  - 아직 부족한 내용:
    - `notification_setting.group_invite_alert`
    - `notification_setting.group_activity_alert`
- 알림 도메인 초안
  - [NotificationRepository.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/infrastructure/NotificationRepository.kt)
  - [NotificationEventHandler.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/application/NotificationEventHandler.kt)
  - [NotificationController.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/api/NotificationController.kt)
  - [NotificationDtos.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/api/NotificationDtos.kt)
  - [NotificationService.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/application/NotificationService.kt)
- 그룹 이벤트 초안
  - [GroupEvents.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/domain/event/GroupEvents.kt)
- 그룹 API/DTO 확장 초안
  - [GroupController.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/api/GroupController.kt)
  - [GroupDtos.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/api/GroupDtos.kt)

## 프론트 워커가 만든 변경 흔적
- 수정됨
  - [groups payments route](/E:/Dev_ai/CardWise/frontend/src/app/api/groups/[groupId]/payments/route.ts)
  - [groups payments page](/E:/Dev_ai/CardWise/frontend/src/app/groups/[groupId]/payments/page.tsx)
  - [groups page](/E:/Dev_ai/CardWise/frontend/src/app/groups/page.tsx)
  - [app-shell.tsx](/E:/Dev_ai/CardWise/frontend/src/components/app-shell.tsx)
  - [cardwise-api.ts](/E:/Dev_ai/CardWise/frontend/src/lib/cardwise-api.ts)
- 신규
  - [frontend notifications api](/E:/Dev_ai/CardWise/frontend/src/app/api/notifications)
  - [frontend groups detail api](/E:/Dev_ai/CardWise/frontend/src/app/api/groups/[groupId])
  - [frontend notifications page](/E:/Dev_ai/CardWise/frontend/src/app/notifications)
  - [frontend group detail page](/E:/Dev_ai/CardWise/frontend/src/app/groups/[groupId]/page.tsx)
  - [frontend group settings](/E:/Dev_ai/CardWise/frontend/src/app/groups/[groupId]/settings)
  - [group-payments-client.tsx](/E:/Dev_ai/CardWise/frontend/src/components/group-payments-client.tsx)
  - [group-settings-client.tsx](/E:/Dev_ai/CardWise/frontend/src/components/group-settings-client.tsx)
  - [notification-badge.tsx](/E:/Dev_ai/CardWise/frontend/src/components/notification-badge.tsx)
- 주의:
  - 이 변경들은 아직 검증하지 않았음
  - 백엔드 시그니처가 완성되지 않아 현재는 깨질 가능성이 높음

## 지금 깨져 있는 핵심 지점
1. [GroupController.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/api/GroupController.kt)
   - 새 엔드포인트를 호출하지만 [GroupService.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/application/GroupService.kt)가 그 시그니처를 아직 구현하지 않음
2. [GroupRepository.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/infrastructure/GroupRepository.kt)
   - 일부 데이터 클래스만 확장됨
   - 아래 메서드들이 없거나 반쯤만 맞음
   - `findGroupMembers`
   - `findCurrentMonthSpent`
   - `countActiveInvitations`
   - `deleteInvitation`
   - `findPayment`
   - `createGroupPayment`
   - `updateGroupPayment`
   - `softDeleteGroupPayment`
   - `replacePaymentItems`
   - `replacePaymentTags`
   - `findPaymentTagNames`
   - `createOrFindGroupTag`
   - `findGroupTags`
3. [NotificationService.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/application/NotificationService.kt)
   - `createNotificationIfAccountExists`는 잘못된 구현임
   - `findAccountIdByEmail(command.accountId.toString())` 로 되어 있어 제거 또는 수정 필요
4. [NotificationEventHandler.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/application/NotificationEventHandler.kt)
   - `handleGroupPaymentCreated`가 placeholder 상태
5. 알림 설정 스키마/DTO
   - F7 아키텍처 기준으로는 `group_invite_alert`, `group_activity_alert`가 필요
   - 현재 DB/코드에는 없음

## 다음 작업 권장 순서
1. 백엔드부터 복구
   - [GroupRepository.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/infrastructure/GroupRepository.kt) 완성
   - [GroupService.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/group/application/GroupService.kt) 재작성
   - 초점:
     - `getGroupDetail`
     - `updateGroup`
     - `deleteGroup`
     - `cancelInvitation`
     - `createGroupPayment`
     - `updateGroupPayment`
     - `deleteGroupPayment`
     - `removeMember`
     - `leaveGroup`
     - `transferOwnership`
     - `getGroupTags`
     - `createGroupTag`
2. F7 알림 설정 스키마 정합성 맞추기
   - migration에 `group_invite_alert`, `group_activity_alert` 추가
   - [NotificationSettingRepository.kt](/E:/Dev_ai/CardWise/backend/src/main/kotlin/com/cardwise/notification/infrastructure/NotificationSettingRepository.kt) 반영
   - DTO/컨트롤러/프론트 설정 화면 반영
3. 이벤트 기반 알림 생성 닫기
   - 초대: 이메일 기준 account resolve 후 그룹 초대 알림 생성
   - 그룹 결제 등록: 본인 제외 멤버에게 그룹 활동 알림 생성
   - 추방/OWNER 양도: 대상 멤버 알림 생성
4. 프론트/BFF 연결 확인
   - 워커가 만든 `/notifications`, `/groups/[groupId]`, `/groups/[groupId]/settings` 계열을 백엔드 완성 후 검증
5. migration 실제 적용
   - Supabase CLI 없음
   - `psql` 없음
   - `python + psycopg`로 수동 적용해야 함
6. 검증
   - `backend`: `.\gradlew.bat test`
   - `frontend`: `npm run lint`
   - `frontend`: `npm run build`
   - 스모크:
     - `/notifications`
     - `/groups`
     - `/groups/{id}`
     - `/groups/{id}/payments`
     - `/groups/{id}/settings`
     - `/settings/notifications`

## 참고 메모
- `psycopg[binary]`는 이미 설치됨
- 실제 DB 조사 결과:
  - `tag.group_id`는 이미 존재
  - `notification_setting`에 그룹 알림 컬럼은 아직 없음
- 인증/인가 구현은 사용자 요청으로 후순위

