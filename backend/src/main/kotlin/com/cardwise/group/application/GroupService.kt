package com.cardwise.group.application

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
import com.cardwise.group.infrastructure.GroupRepository
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import kotlin.math.roundToInt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GroupService(
    private val groupRepository: GroupRepository,
) {
    @Transactional
    fun createGroup(accountId: UUID, request: CreateGroupRequest): GroupSummaryResponse {
        val groupId = groupRepository.createGroup(
            ownerAccountId = accountId,
            groupName = request.groupName.trim(),
            description = request.description?.trim()?.takeIf { it.isNotEmpty() },
        )
        groupRepository.insertGroupMember(groupId, accountId, "OWNER")
        return getGroups(accountId).first { it.groupId == groupId }
    }

    fun getGroups(accountId: UUID): List<GroupSummaryResponse> {
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

    fun getInvitations(accountId: UUID): List<GroupInvitationResponse> {
        val account = requireAccount(accountId)
        groupRepository.expireInvitationsForEmail(account.email)
        return groupRepository.findInvitationsByEmail(account.email).map(::mapInvitation)
    }

    fun getGroupInvitations(accountId: UUID, groupId: Long): List<GroupInvitationResponse> {
        val membership = requireMembership(groupId, accountId)
        if (membership.role != "OWNER") {
            throw ForbiddenException("OWNER만 초대 목록을 볼 수 있습니다.")
        }
        return groupRepository.findGroupInvitations(groupId).map(::mapInvitation)
    }

    @Transactional
    fun inviteMember(accountId: UUID, groupId: Long, request: InviteGroupMemberRequest): GroupInvitationResponse {
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
        return groupRepository.findInvitation(invitationId)?.let(::mapInvitation)
            ?: throw NotFoundException("생성된 초대를 찾을 수 없습니다.")
    }

    @Transactional
    fun acceptInvitation(accountId: UUID, invitationId: Long): GroupInvitationResponse {
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
        return invitation.copy(invitationStatus = "ACCEPTED")
    }

    @Transactional
    fun declineInvitation(accountId: UUID, invitationId: Long): GroupInvitationResponse {
        val account = requireAccount(accountId)
        val invitation = requireInvitationForAccount(account.email, invitationId)
        groupRepository.updateInvitationStatus(invitationId, "DECLINED")
        return invitation.copy(invitationStatus = "DECLINED")
    }

    fun getGroupPayments(
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
            )
        }
    }

    fun getGroupStats(accountId: UUID, groupId: Long, from: LocalDate?, to: LocalDate?): GroupStatsResponse {
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

    private fun mapInvitation(row: com.cardwise.group.infrastructure.GroupInvitationRow): GroupInvitationResponse {
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
