package com.cardwise.group.application.service

import com.cardwise.group.application.port.`in`.GroupUseCase
import com.cardwise.group.infrastructure.adapter.GroupRepository
import com.cardwise.notification.application.NotificationService
import com.cardwise.notification.infrastructure.NotificationInsertCommand

import com.cardwise.common.exception.BadRequestException
import com.cardwise.common.exception.ForbiddenException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.group.api.CreateGroupRequest
import com.cardwise.group.api.GroupInvitationResponse
import com.cardwise.group.api.GroupMemberStatsResponse
import com.cardwise.group.api.GroupPaymentResponse
import com.cardwise.group.api.GroupStatsResponse
import com.cardwise.group.api.GroupSummaryResponse
import com.cardwise.group.api.GroupTagStatsResponse
import com.cardwise.group.api.GroupTrendPointResponse
import com.cardwise.group.api.InviteGroupMemberRequest
import com.cardwise.group.api.GroupDetailResponse
import com.cardwise.group.api.GroupActionResponse
import com.cardwise.group.api.GroupMemberResponse
import com.cardwise.group.api.UpdateGroupRequest
import com.cardwise.group.api.CreateGroupPaymentRequest
import com.cardwise.group.api.UpdateGroupPaymentRequest
import com.cardwise.group.api.TransferOwnershipRequest
import com.cardwise.group.api.CreateGroupTagRequest
import com.cardwise.group.api.GroupTagResponse
import java.time.OffsetDateTime
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import kotlin.math.roundToInt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GroupService(
    private val groupRepository: GroupRepository,
    private val notificationService: NotificationService,
): GroupUseCase {
    @Transactional
    override fun createGroup(accountId: UUID, request: CreateGroupRequest): GroupSummaryResponse {
        val groupId = groupRepository.createGroup(
            ownerAccountId = accountId,
            groupName = request.groupName.trim(),
            description = request.description?.trim()?.takeIf { it.isNotEmpty() },
        )
        groupRepository.insertGroupMember(groupId, accountId, "OWNER")
        return getGroups(accountId).first { it.groupId == groupId }
    }

    override fun getGroups(accountId: UUID): List<GroupSummaryResponse> {
        val currentMonth = YearMonth.now()
        return groupRepository.findGroups(accountId, currentMonth).map { row ->
            GroupSummaryResponse(
                groupId = row.groupId,
                groupName = row.groupName,
                description = row.description,
                role = row.role,
                memberCount = row.memberCount,
                currentMonthSpent = row.currentMonthSpent,
                maxMembers = row.maxMembers,
            )
        }
    }

    override fun getInvitations(accountId: UUID): List<GroupInvitationResponse> {
        val account = requireAccount(accountId)
        groupRepository.expireInvitationsForEmail(account.email)
        return groupRepository.findInvitationsByEmail(account.email).map(::mapInvitation)
    }

    override fun getGroupDetail(accountId: UUID, groupId: Long): GroupDetailResponse {
        val membership = requireMembership(groupId, accountId)
        val currentMonthSpent = groupRepository.findCurrentMonthSpent(groupId, YearMonth.now())
        val pendingInvitations = groupRepository.countActiveInvitations(groupId)
        val members = groupRepository.findGroupMembers(groupId).map { row ->
            GroupMemberResponse(
                accountId = row.accountId.toString(),
                displayName = row.displayName,
                email = row.email,
                role = row.role,
                joinedAt = row.joinedAt
            )
        }

        return GroupDetailResponse(
            groupId = membership.groupId,
            groupName = membership.groupName,
            description = membership.description,
            role = membership.role,
            memberCount = members.size,
            currentMonthSpent = currentMonthSpent,
            maxMembers = membership.maxMembers,
            ownerAccountId = membership.ownerAccountId.toString(),
            canManageSettings = membership.role == "OWNER",
            pendingInvitationCount = pendingInvitations,
            members = members
        )
    }

    @Transactional
    override fun updateGroup(accountId: UUID, groupId: Long, request: UpdateGroupRequest): GroupDetailResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 그룹을 수정할 수 있습니다.")
        }
        groupRepository.updateGroup(groupId, request.groupName, request.description)
        return getGroupDetail(accountId, groupId)
    }

    @Transactional
    override fun deleteGroup(accountId: UUID, groupId: Long): GroupActionResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 그룹을 삭제할 수 있습니다.")
        }
        groupRepository.softDeleteGroup(groupId)
        return GroupActionResponse(groupId, "DELETED", "그룹이 삭제되었습니다.")
    }

    override fun getGroupInvitations(accountId: UUID, groupId: Long): List<GroupInvitationResponse> {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 초대 목록을 볼 수 있습니다.")
        }
        return groupRepository.findGroupInvitations(groupId).map(::mapInvitation)
    }

    @Transactional
    override fun inviteMember(accountId: UUID, groupId: Long, request: InviteGroupMemberRequest): GroupInvitationResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 멤버를 초대할 수 있습니다.")
        }

        val email = request.inviteeEmail.trim().lowercase()
        val currentMembers = groupRepository.countMembers(groupId)
        if (currentMembers >= membership.maxMembers) {
            throw BadRequestException("최대 멤버 수에 도달했습니다.")
        }
        if (groupRepository.hasPendingInvitation(groupId, email)) {
            throw BadRequestException("이미 초대 중인 이메일입니다.")
        }
        if (groupRepository.isExistingMemberByEmail(groupId, email)) {
            throw BadRequestException("이미 그룹에 참여 중인 사용자입니다.")
        }

        val invitationId = groupRepository.createInvitation(groupId, accountId, email)
        
        val group = groupRepository.findGroupConfig(groupId)
        if (group != null) {
            notificationService.createNotificationForEmail(
                email = email,
                notificationType = "GROUP",
                eventCode = "GROUP_INVITE",
                title = "그룹 초대",
                body = "'${group.groupName}' 그룹에서 초대장이 도착했습니다.",
                referenceTable = "ledger_group",
                referenceId = groupId,
                actionUrl = "/dashboard",
                actionLabel = "대시보드 가기"
            )
        }
        
        return groupRepository.findInvitation(invitationId)?.let(::mapInvitation)
            ?: throw NotFoundException("생성된 초대를 찾을 수 없습니다.")
    }

    @Transactional
    override fun acceptInvitation(accountId: UUID, invitationId: Long): GroupInvitationResponse {
        val account = requireAccount(accountId)
        val invitation = requireInvitationForAccount(account.email, invitationId)
        val membership = groupRepository.findMembership(invitation.groupId, accountId)
        if (membership != null) {
            throw BadRequestException("이미 그룹에 참여 중입니다.")
        }

        val currentMembers = groupRepository.countMembers(invitation.groupId)
        val group = groupRepository.findGroupConfig(invitation.groupId)
            ?: throw NotFoundException("그룹을 찾을 수 없습니다.")
        if (currentMembers >= group.maxMembers) {
            throw BadRequestException("최대 멤버 수에 도달했습니다.")
        }

        groupRepository.insertGroupMember(invitation.groupId, accountId, "MEMBER")
        groupRepository.updateInvitationStatus(invitationId, "ACCEPTED")
        
        val groupMembers = groupRepository.findGroupMembers(invitation.groupId)
        groupMembers.forEach { member ->
            if (member.accountId != accountId) {
                notificationService.createNotificationIfAccountExists(
                    NotificationInsertCommand(
                        accountId = member.accountId,
                        notificationType = "GROUP",
                        eventCode = "GROUP_MEMBER_JOINED",
                        title = "그룹 새 멤버 가입",
                        body = "'${account.displayName ?: "새로운 멤버"}' 님이 '${group.groupName}' 그룹에 참여했습니다.",
                        referenceTable = "ledger_group",
                        referenceId = invitation.groupId
                    )
                )
            }
        }
        
        return invitation.copy(invitationStatus = "ACCEPTED")
    }

    @Transactional
    override fun cancelInvitation(accountId: UUID, groupId: Long, invitationId: Long): GroupActionResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 초대를 취소할 수 있습니다.")
        }
        val deletedRows = groupRepository.deleteInvitation(groupId, invitationId)
        if (deletedRows == 0) {
            throw NotFoundException("유효한 초대를 찾을 수 없습니다.")
        }
        return GroupActionResponse(groupId, "CANCELED", "초대 취소 완료")
    }

    @Transactional
    override fun declineInvitation(accountId: UUID, invitationId: Long): GroupInvitationResponse {
        val account = requireAccount(accountId)
        val invitation = requireInvitationForAccount(account.email, invitationId)
        groupRepository.updateInvitationStatus(invitationId, "DECLINED")
        return invitation.copy(invitationStatus = "DECLINED")
    }

    override fun getGroupPayments(
        accountId: UUID,
        groupId: Long,
        from: LocalDate?,
        to: LocalDate?,
        limit: Int,
    ): List<GroupPaymentResponse> {
        val membership = requireMembership(groupId, accountId)
        val range = resolveDateRange(from, to)
        return groupRepository.findGroupPayments(groupId, range.first, range.second, limit.coerceIn(1, 100)).map { row ->
            GroupPaymentResponse(
                paymentId = row.paymentId,
                accountId = row.accountId.toString(),
                payerName = row.payerName,
                merchantName = row.merchantName,
                amount = row.amount,
                paidAt = row.paidAt,
                currency = row.currency,
                memo = row.memo,
                canEdit = membership.role == "OWNER" || row.accountId == accountId,
                userCardId = 0L,
                tagNames = emptyList()
            )
        }
    }

    override fun getGroupStats(accountId: UUID, groupId: Long, from: LocalDate?, to: LocalDate?): GroupStatsResponse {
        val membership = requireMembership(groupId, accountId)
        val range = resolveDateRange(from, to)
        val memberStats = groupRepository.findGroupMemberStats(groupId, range.first, range.second)
        val tagStats = groupRepository.findGroupTagStats(groupId, range.first, range.second)
        val trends = groupRepository.findGroupMonthlyTrend(groupId, 6)
        val totalSpent = memberStats.sumOf { it.spentAmount }
        val paymentCount = memberStats.sumOf { it.paymentCount }

        return GroupStatsResponse(
            groupId = membership.groupId,
            groupName = membership.groupName,
            from = range.first,
            to = range.second,
            totalSpent = totalSpent,
            paymentCount = paymentCount,
            memberStats = memberStats.map { row ->
                GroupMemberStatsResponse(
                    accountId = row.accountId.toString(),
                    displayName = row.displayName,
                    spentAmount = row.spentAmount,
                    paymentCount = row.paymentCount,
                    sharePercent = sharePercent(row.spentAmount, totalSpent),
                )
            },
            tagStats = tagStats.map { row ->
                GroupTagStatsResponse(
                    tagName = row.tagName,
                    spentAmount = row.spentAmount,
                    paymentCount = row.paymentCount,
                    sharePercent = sharePercent(row.spentAmount, totalSpent),
                )
            },
            monthlyTrend = trends.map { row ->
                GroupTrendPointResponse(
                    yearMonth = row.yearMonth,
                    totalSpent = row.totalSpent,
                    paymentCount = row.paymentCount,
                )
            },
        )
    }

    @Transactional
    override fun createGroupPayment(accountId: UUID, groupId: Long, request: CreateGroupPaymentRequest): GroupPaymentResponse {
        val membership = requireMembership(groupId, accountId)
        val paidAt = request.paidAt ?: OffsetDateTime.now()
        val paymentId = groupRepository.createGroupPayment(
            groupId = groupId,
            accountId = accountId,
            userCardId = request.userCardId,
            merchantName = request.merchantName,
            amount = request.amount,
            paidAt = paidAt,
            memo = request.memo
        )
        val paymentItemId = groupRepository.replacePaymentItems(paymentId, request.amount)
        
        val tagIds = request.tagNames.map { tagName ->
            groupRepository.createOrFindGroupTag(groupId, tagName)
        }
        groupRepository.replacePaymentTags(paymentItemId, tagIds)
        
        val groupMembers = groupRepository.findGroupMembers(groupId)
        groupMembers.forEach { member ->
            if (member.accountId != accountId) {
                notificationService.createNotificationIfAccountExists(
                    NotificationInsertCommand(
                        accountId = member.accountId,
                        notificationType = "GROUP",
                        eventCode = "GROUP_PAYMENT_ADDED",
                        title = "그룹 결제 추가",
                        body = "${membership.groupName} 그룹에 새로운 결제 내역이 추가되었습니다: ${request.merchantName}",
                        referenceTable = "ledger_group",
                        referenceId = groupId
                    )
                )
            }
        }
        
        val payment = groupRepository.findPayment(paymentId) ?: throw NotFoundException("결제가 생성되지 않았습니다.")
        val tags = groupRepository.findPaymentTagNames(paymentId)
        return GroupPaymentResponse(
            paymentId = payment.paymentId,
            accountId = payment.accountId.toString(),
            userCardId = payment.userCardId,
            payerName = payment.payerName,
            merchantName = payment.merchantName,
            amount = payment.amount,
            paidAt = payment.paidAt,
            currency = payment.currency,
            memo = payment.memo,
            tagNames = tags,
            canEdit = true
        )
    }

    @Transactional
    override fun updateGroupPayment(accountId: UUID, groupId: Long, paymentId: Long, request: UpdateGroupPaymentRequest): GroupPaymentResponse {
        val membership = requireMembership(groupId, accountId)
        val payment = groupRepository.findPayment(paymentId) ?: throw NotFoundException("결제를 찾을 수 없습니다.")
        if (membership.role != "OWNER" && payment.accountId.toString() != accountId.toString()) {
            throw ForbiddenException("결제 작성자 또는 OWNER만 수정할 수 있습니다.")
        }
        
        groupRepository.updateGroupPayment(
            paymentId = paymentId,
            userCardId = request.userCardId,
            merchantName = request.merchantName,
            amount = request.amount,
            paidAt = request.paidAt,
            memo = request.memo
        )
        
        if (request.amount != null || request.tagNames != null) {
            val amountToUse = request.amount ?: payment.amount
            val paymentItemId = groupRepository.replacePaymentItems(paymentId, amountToUse)
            val tagNames = request.tagNames ?: groupRepository.findPaymentTagNames(paymentId)
            val tagIds = tagNames.map { groupRepository.createOrFindGroupTag(groupId, it) }
            groupRepository.replacePaymentTags(paymentItemId, tagIds)
        }
        
        val updatedPayment = groupRepository.findPayment(paymentId)!!
        val tags = groupRepository.findPaymentTagNames(paymentId)
        return GroupPaymentResponse(
            paymentId = updatedPayment.paymentId,
            accountId = updatedPayment.accountId.toString(),
            userCardId = updatedPayment.userCardId,
            payerName = updatedPayment.payerName,
            merchantName = updatedPayment.merchantName,
            amount = updatedPayment.amount,
            paidAt = updatedPayment.paidAt,
            currency = updatedPayment.currency,
            memo = updatedPayment.memo,
            tagNames = tags,
            canEdit = true
        )
    }

    @Transactional
    override fun deleteGroupPayment(accountId: UUID, groupId: Long, paymentId: Long): GroupActionResponse {
        val membership = requireMembership(groupId, accountId)
        val payment = groupRepository.findPayment(paymentId) ?: throw NotFoundException("결제를 찾을 수 없습니다.")
        if (membership.role != "OWNER" && payment.accountId.toString() != accountId.toString()) {
            throw ForbiddenException("결제 작성자 또는 OWNER만 삭제할 수 있습니다.")
        }
        groupRepository.softDeleteGroupPayment(paymentId)
        return GroupActionResponse(groupId, "DELETED", "그룹 결제가 삭제되었습니다.")
    }

    @Transactional
    override fun removeMember(accountId: UUID, groupId: Long, memberAccountId: String): GroupActionResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 멤버를 추방할 수 있습니다.")
        }
        val targetId = UUID.fromString(memberAccountId)
        if (targetId == accountId) {
            throw BadRequestException("본인을 추방할 수 없습니다. 탈퇴를 이용해주세요.")
        }
        val targetMembership = groupRepository.findMembership(groupId, targetId) ?: throw NotFoundException("그룹 멤버가 아닙니다.")
        if (targetMembership.role == "OWNER") {
            throw BadRequestException("OWNER는 추방할 수 없습니다.")
        }
        val deletedRows = groupRepository.deleteGroupMember(groupId, targetId)
        if (deletedRows == 0) throw NotFoundException("멤버 추방에 실패했습니다.")
        
        notificationService.createNotificationIfAccountExists(
            NotificationInsertCommand(
                accountId = targetId,
                notificationType = "GROUP",
                eventCode = "GROUP_MEMBER_REMOVED",
                title = "그룹 제외 알림",
                body = "'${membership.groupName}' 그룹에서 제외되었습니다.",
                referenceTable = "ledger_group",
                referenceId = groupId
            )
        )
        
        return GroupActionResponse(groupId, "MEMBER_REMOVED", "멤버가 그룹에서 추방되었습니다.")
    }

    @Transactional
    override fun leaveGroup(accountId: UUID, groupId: Long): GroupActionResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role == "OWNER") {
            throw BadRequestException("OWNER는 바로 탈퇴할 수 없습니다. 권한 위임 후 탈퇴하거나 그룹을 삭제하세요.")
        }
        groupRepository.deleteGroupMember(groupId, accountId)
        return GroupActionResponse(groupId, "LEFT", "그룹에서 탈퇴했습니다.")
    }

    @Transactional
    override fun transferOwnership(accountId: UUID, groupId: Long, request: TransferOwnershipRequest): GroupDetailResponse {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 권한을 양도할 수 있습니다.")
        }
        val targetId = UUID.fromString(request.targetAccountId)
        val targetMembership = groupRepository.findMembership(groupId, targetId) ?: throw NotFoundException("대상 멤버를 찾을 수 없습니다.")
        
        groupRepository.updateGroupOwner(groupId, targetId)
        groupRepository.updateMemberRole(groupId, accountId, "MEMBER")
        groupRepository.updateMemberRole(groupId, targetId, "OWNER")
        
        notificationService.createNotificationIfAccountExists(
            NotificationInsertCommand(
                accountId = targetId,
                notificationType = "GROUP",
                eventCode = "GROUP_OWNER_TRANSFERRED",
                title = "그룹 소유권 양도",
                body = "'${membership.groupName}' 그룹의 관리자 권한을 부여받았습니다.",
                referenceTable = "ledger_group",
                referenceId = groupId
            )
        )
        
        return getGroupDetail(accountId, groupId)
    }

    override fun getGroupTags(accountId: UUID, groupId: Long): List<GroupTagResponse> {
        val membership = requireMembership(groupId, accountId)
        return groupRepository.findGroupTags(groupId).map { row ->
            GroupTagResponse(row.tagId, row.tagName, row.color)
        }
    }

    @Transactional
    override fun createGroupTag(accountId: UUID, groupId: Long, request: CreateGroupTagRequest): GroupTagResponse {
        val membership = requireMembership(groupId, accountId)
        val tagId = groupRepository.createOrFindGroupTag(groupId, request.tagName)
        return getGroupTags(accountId, groupId).first { it.tagId == tagId }
    }

    private fun requireAccount(accountId: UUID) =
        groupRepository.findCurrentAccount(accountId)
            ?: throw NotFoundException("계정 정보를 찾을 수 없습니다.")

    private fun requireMembership(groupId: Long, accountId: UUID) =
        groupRepository.findMembership(groupId, accountId)
            ?: throw ForbiddenException("그룹 멤버만 접근할 수 있습니다.")

    private fun requireInvitationForAccount(email: String, invitationId: Long): GroupInvitationResponse {
        groupRepository.expireInvitationsForEmail(email)
        val invitation = groupRepository.findInvitation(invitationId)?.let(::mapInvitation)
            ?: throw NotFoundException("초대를 찾을 수 없습니다.")
        if (invitation.invitationStatus != "PENDING") {
            throw BadRequestException("이미 처리된 초대입니다.")
        }
        if (invitation.inviteeEmail.lowercase() != email.lowercase()) {
            throw ForbiddenException("본인에게 온 초대만 처리할 수 있습니다.")
        }
        return invitation
    }

    private fun mapInvitation(row: com.cardwise.group.infrastructure.adapter.GroupInvitationRow): GroupInvitationResponse {
        return GroupInvitationResponse(
            invitationId = row.invitationId,
            groupId = row.groupId,
            groupName = row.groupName,
            inviterName = row.inviterName,
            inviteeEmail = row.inviteeEmail,
            invitationStatus = row.invitationStatus,
            expiresAt = row.expiresAt,
            createdAt = row.createdAt,
        )
    }

    private fun resolveDateRange(from: LocalDate?, to: LocalDate?): Pair<LocalDate, LocalDate> {
        if (from != null && to != null) {
            return from to to
        }

        val currentMonth = YearMonth.now()
        return currentMonth.atDay(1) to currentMonth.atEndOfMonth()
    }

    private fun sharePercent(amount: Long, total: Long): Double {
        if (total <= 0) {
            return 0.0
        }
        return ((amount.toDouble() / total.toDouble()) * 10000.0).roundToInt() / 100.0
    }
}
