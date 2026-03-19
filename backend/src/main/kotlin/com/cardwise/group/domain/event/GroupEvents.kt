package com.cardwise.group.domain.event

import java.util.UUID

data class GroupInvitationSentEvent(
    val invitationId: Long,
    val groupId: Long,
    val groupName: String,
    val inviterName: String,
    val inviteeEmail: String,
)

data class GroupPaymentCreatedEvent(
    val groupId: Long,
    val groupName: String,
    val actorAccountId: UUID,
    val actorName: String,
    val paymentId: Long,
    val merchantName: String,
    val amount: Long,
)

data class GroupMemberRemovedEvent(
    val groupId: Long,
    val groupName: String,
    val removedAccountId: UUID,
    val removedDisplayName: String,
    val actorName: String,
)

data class GroupOwnershipTransferredEvent(
    val groupId: Long,
    val groupName: String,
    val previousOwnerName: String,
    val targetAccountId: UUID,
    val targetDisplayName: String,
)
