package com.cardwise.group.api

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Positive
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

data class UpdateGroupRequest(
    @field:Size(max = 50)
    val groupName: String? = null,
    @field:Size(max = 200)
    val description: String? = null,
)

data class InviteGroupMemberRequest(
    @field:Email
    @field:NotBlank
    val inviteeEmail: String,
)

data class CreateGroupPaymentRequest(
    @field:Positive
    val userCardId: Long,
    @field:NotBlank
    @field:Size(max = 200)
    val merchantName: String,
    @field:Positive
    val amount: Long,
    val paidAt: OffsetDateTime? = null,
    @field:Size(max = 1000)
    val memo: String? = null,
    val tagNames: List<@Size(min = 1, max = 50) String> = emptyList(),
)

data class UpdateGroupPaymentRequest(
    val userCardId: Long? = null,
    @field:Size(max = 200)
    val merchantName: String? = null,
    val amount: Long? = null,
    val paidAt: OffsetDateTime? = null,
    @field:Size(max = 1000)
    val memo: String? = null,
    val tagNames: List<@Size(min = 1, max = 50) String>? = null,
)

data class TransferOwnershipRequest(
    @field:NotBlank
    val targetAccountId: String,
)

data class CreateGroupTagRequest(
    @field:NotBlank
    @field:Size(max = 50)
    val tagName: String,
    @field:Size(max = 7)
    val color: String? = null,
)

data class GroupActionResponse(
    val groupId: Long,
    val status: String,
    val message: String,
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

data class GroupMemberResponse(
    val accountId: String,
    val displayName: String,
    val email: String,
    val role: String,
    val joinedAt: OffsetDateTime,
)

data class GroupDetailResponse(
    val groupId: Long,
    val groupName: String,
    val description: String?,
    val role: String,
    val memberCount: Int,
    val currentMonthSpent: Long,
    val maxMembers: Int,
    val ownerAccountId: String,
    val canManageSettings: Boolean,
    val pendingInvitationCount: Int,
    val members: List<GroupMemberResponse>,
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

data class GroupTagResponse(
    val tagId: Long,
    val tagName: String,
    val color: String?,
)

data class GroupPaymentResponse(
    val paymentId: Long,
    val accountId: String,
    val userCardId: Long,
    val payerName: String,
    val merchantName: String,
    val amount: Long,
    val paidAt: OffsetDateTime,
    val currency: String,
    val memo: String?,
    val tagNames: List<String>,
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
