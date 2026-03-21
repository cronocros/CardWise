package com.cardwise.ledger.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDate
import java.time.OffsetDateTime

enum class AdjustmentType {
    FX_CORRECTION,
    BILLING_DISCOUNT,
    PAYMENT_DEDUCTION,
    CARD_FEE,
    OTHER,
}

enum class PendingActionType {
    FX_CORRECTION_NEEDED,
    BILLING_DISCOUNT_FOUND,
    PAYMENT_CONFIRMATION,
    DUPLICATE_DETECTED,
    CATEGORY_UNMAPPED,
    EXCEL_REVIEW,
    PERFORMANCE_EXCLUSION_CHECK,
}

enum class PendingActionStatus {
    PENDING,
    RESOLVED,
    DISMISSED,
}

enum class Priority {
    HIGH,
    MEDIUM,
    LOW,
}

enum class ResolutionAction {
    APPLY_FX_CORRECTION,
    APPLY_BILLING_DISCOUNT,
    CONFIRM_PAYMENT,
    RESOLVE_DUPLICATE,
    MAP_CATEGORY,
    APPROVE_EXCEL_IMPORT,
    APPLY_PERFORMANCE_EXCLUSION,
    KEEP_AS_IS,
}

data class CreatePaymentAdjustmentRequest(
    @field:NotNull
    val adjustmentType: AdjustmentType,
    @field:Positive
    val originalKrwAmount: Long,
    @field:Positive
    val adjustedKrwAmount: Long,
    @field:NotBlank
    val reason: String,
    val billedAt: LocalDate? = null,
)

data class CreatePaymentRequest(
    @field:NotNull
    val userCardId: Long,
    @field:NotBlank
    val merchantName: String,
    @field:Positive
    val krwAmount: Long,
    @field:NotNull
    val paidAt: OffsetDateTime,
    val transactionType: String = "EXPENSE",
)

data class UpdatePaymentRequest(
    @field:NotNull
    val userCardId: Long,
    @field:NotBlank
    val merchantName: String,
    @field:Positive
    val krwAmount: Long,
    @field:NotNull
    val paidAt: OffsetDateTime,
    val transactionType: String = "EXPENSE",
)

data class AdjustmentResponse(
    val adjustmentId: Long,
    val paymentId: Long,
    val adjustmentType: AdjustmentType,
    val originalKrwAmount: Long,
    val adjustedKrwAmount: Long,
    val differenceAmount: Long,
    val reason: String?,
    val billedAt: LocalDate?,
    val createdAt: OffsetDateTime,
)

data class ResolvePendingActionRequest(
    @field:Valid
    val resolution: PendingActionResolutionRequest,
)

data class PendingActionResolutionRequest(
    @field:NotNull
    val action: ResolutionAction,
    val adjustedAmount: Long? = null,
)

data class PendingActionResponse(
    val pendingActionId: Long,
    val actionType: PendingActionType,
    val referenceTable: String?,
    val referenceId: Long?,
    val title: String,
    val description: String?,
    val status: PendingActionStatus,
    val priority: Priority,
    val createdAt: OffsetDateTime,
    val resolvedAt: OffsetDateTime?,
)

data class PendingActionListResponse(
    val data: List<PendingActionResponse>,
    val pagination: PaginationEnvelope,
)

data class PaginationEnvelope(
    val nextCursor: String? = null,
    val hasMore: Boolean = false,
    val limit: Int,
)

data class PendingActionCountResponse(
    val count: Long,
)

data class PaymentResponse(
    val paymentId: Long,
    val userCardId: Long,
    val merchantName: String,
    val krwAmount: Long,
    val finalKrwAmount: Long?,
    val paidAt: OffsetDateTime,
    val transactionType: String = "EXPENSE",
    val isAdjusted: Boolean,
    val createdAt: OffsetDateTime? = null,
    val tierChanged: Boolean? = null,
    val newTierName: String? = null,
)

data class PaymentListResponse(
    val data: List<PaymentResponse>,
    val pagination: PaginationEnvelope,
)

fun AdjustmentResponse.toSeedLikeMap(): Map<String, Any?> {
    return mapOf(
        "adjustmentId" to adjustmentId,
        "paymentId" to paymentId,
        "adjustmentType" to adjustmentType.name,
        "originalKrwAmount" to originalKrwAmount,
        "adjustedKrwAmount" to adjustedKrwAmount,
        "differenceAmount" to differenceAmount,
        "reason" to reason,
        "createdAt" to createdAt,
    )
}

fun PendingActionResponse.toSeedLikeMap(): Map<String, Any?> {
    return mapOf(
        "pendingActionId" to pendingActionId,
        "actionType" to actionType.name,
        "referenceTable" to referenceTable,
        "referenceId" to referenceId,
        "title" to title,
        "description" to description,
        "status" to status.name,
        "priority" to priority.name,
        "createdAt" to createdAt,
    )
}

fun localDateOrNull(value: OffsetDateTime?): LocalDate? {
    return value?.toLocalDate()
}
