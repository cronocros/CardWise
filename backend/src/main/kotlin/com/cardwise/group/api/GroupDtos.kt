package com.cardwise.group.api

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.time.OffsetDateTime

data class CreateGroupRequest(
    @field:NotBlank
    @field:Size(max = 50)
    val groupName: String,
    @field:Size(max = 200)
    val description: String? = null,
)

data class InviteGroupMemberRequest(
    @field:Email
    @field:NotBlank
    val inviteeEmail: String,
)

data class GroupSummaryResponse(
    val groupId: Long,
    val groupName: String,
    val description: String?,
    val role: String,
    val memberCount: Int,
    val currentMonthSpent: Long,
    val maxMembers: Int,
)

data class GroupInvitationResponse(
    val invitationId: Long,
    val groupId: Long,
    val groupName: String,
    val inviterName: String,
    val inviteeEmail: String,
    val invitationStatus: String,
    val expiresAt: OffsetDateTime,
    val createdAt: OffsetDateTime,
)

data class GroupPaymentResponse(
    val paymentId: Long,
    val accountId: String,
    val payerName: String,
    val merchantName: String,
    val amount: Long,
    val paidAt: OffsetDateTime,
    val currency: String,
    val memo: String?,
    val canEdit: Boolean,
)

data class GroupMemberStatsResponse(
    val accountId: String,
    val displayName: String,
    val spentAmount: Long,
    val paymentCount: Int,
    val sharePercent: Double,
)

data class GroupTagStatsResponse(
    val tagName: String,
    val spentAmount: Long,
    val paymentCount: Int,
    val sharePercent: Double,
)

data class GroupTrendPointResponse(
    val yearMonth: String,
    val totalSpent: Long,
    val paymentCount: Int,
)

data class GroupStatsResponse(
    val groupId: Long,
    val groupName: String,
    val from: LocalDate,
    val to: LocalDate,
    val totalSpent: Long,
    val paymentCount: Int,
    val memberStats: List<GroupMemberStatsResponse>,
    val tagStats: List<GroupTagStatsResponse>,
    val monthlyTrend: List<GroupTrendPointResponse>,
)
