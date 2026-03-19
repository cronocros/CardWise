package com.cardwise.group.application.port.`in`

import com.cardwise.group.api.*
import java.time.LocalDate
import java.util.UUID

interface GroupUseCase {
    fun createGroup(accountId: UUID, request: CreateGroupRequest): GroupSummaryResponse
    fun getGroups(accountId: UUID): List<GroupSummaryResponse>
    fun getInvitations(accountId: UUID): List<GroupInvitationResponse>
    fun getGroupInvitations(accountId: UUID, groupId: Long): List<GroupInvitationResponse>
    fun inviteMember(accountId: UUID, groupId: Long, request: InviteGroupMemberRequest): GroupInvitationResponse
    fun acceptInvitation(accountId: UUID, invitationId: Long): GroupInvitationResponse
    fun getGroupDetail(accountId: UUID, groupId: Long): GroupDetailResponse
    fun updateGroup(accountId: UUID, groupId: Long, request: UpdateGroupRequest): GroupDetailResponse
    fun deleteGroup(accountId: UUID, groupId: Long): GroupActionResponse
    fun cancelInvitation(accountId: UUID, groupId: Long, invitationId: Long): GroupActionResponse
    fun declineInvitation(accountId: UUID, invitationId: Long): GroupInvitationResponse
    fun createGroupPayment(accountId: UUID, groupId: Long, request: CreateGroupPaymentRequest): GroupPaymentResponse
    fun updateGroupPayment(accountId: UUID, groupId: Long, paymentId: Long, request: UpdateGroupPaymentRequest): GroupPaymentResponse
    fun deleteGroupPayment(accountId: UUID, groupId: Long, paymentId: Long): GroupActionResponse
    fun removeMember(accountId: UUID, groupId: Long, memberAccountId: String): GroupActionResponse
    fun leaveGroup(accountId: UUID, groupId: Long): GroupActionResponse
    fun transferOwnership(accountId: UUID, groupId: Long, request: TransferOwnershipRequest): GroupDetailResponse
    fun getGroupTags(accountId: UUID, groupId: Long): List<GroupTagResponse>
    fun createGroupTag(accountId: UUID, groupId: Long, request: CreateGroupTagRequest): GroupTagResponse

    fun getGroupPayments(
        accountId: UUID,
        groupId: Long,
        from: LocalDate?,
        to: LocalDate?,
        limit: Int
    ): List<GroupPaymentResponse>
    fun getGroupStats(accountId: UUID, groupId: Long, from: LocalDate?, to: LocalDate?): GroupStatsResponse
}
