package com.cardwise.notification.application

import com.cardwise.group.domain.event.GroupInvitationSentEvent
import com.cardwise.group.domain.event.GroupMemberRemovedEvent
import com.cardwise.group.domain.event.GroupOwnershipTransferredEvent
import com.cardwise.group.domain.event.GroupPaymentCreatedEvent
import com.cardwise.notification.infrastructure.NotificationInsertCommand
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class NotificationEventHandler(
    private val notificationService: NotificationService,
) {
    @EventListener
    fun handleGroupInvitation(event: GroupInvitationSentEvent) {
        notificationService.createNotificationForEmail(
            email = event.inviteeEmail,
            notificationType = "GROUP",
            eventCode = "GROUP_INVITE",
            title = "\"${event.groupName}\" 그룹에 초대되었습니다",
            body = "${event.inviterName}님이 보낸 초대를 확인해 주세요.",
            actionUrl = "/groups/invitations",
            actionLabel = "초대 확인",
            referenceTable = "group_invitation",
            referenceId = event.invitationId,
        )
    }

    @EventListener
    fun handleGroupPaymentCreated(event: GroupPaymentCreatedEvent) {
        // The caller resolves recipients and invokes direct creation for each account.
    }

    @EventListener
    fun handleMemberRemoved(event: GroupMemberRemovedEvent) {
        notificationService.createNotification(
            NotificationInsertCommand(
                accountId = event.removedAccountId,
                notificationType = "GROUP",
                eventCode = "GROUP_MEMBER_REMOVED",
                title = "\"${event.groupName}\" 그룹에서 제외되었습니다",
                body = "${event.actorName}님이 멤버 구성을 변경했습니다.",
                actionUrl = "/groups",
                actionLabel = "그룹 목록",
                referenceTable = "ledger_group",
                referenceId = event.groupId,
            ),
        )
    }

    @EventListener
    fun handleOwnershipTransferred(event: GroupOwnershipTransferredEvent) {
        notificationService.createNotification(
            NotificationInsertCommand(
                accountId = event.targetAccountId,
                notificationType = "GROUP",
                eventCode = "GROUP_OWNERSHIP_TRANSFERRED",
                title = "\"${event.groupName}\" 그룹 OWNER가 변경되었습니다",
                body = "${event.previousOwnerName}님이 ${event.targetDisplayName}님에게 관리 권한을 양도했습니다.",
                actionUrl = "/groups/${event.groupId}/settings",
                actionLabel = "설정 보기",
                referenceTable = "ledger_group",
                referenceId = event.groupId,
            ),
        )
    }
}
