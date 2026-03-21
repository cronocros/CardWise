package com.cardwise.ledger.domain.model

import java.time.OffsetDateTime

data class PaymentAdjustment(
    val adjustmentId: Long? = null,
    val paymentId: Long,
    val accountId: java.util.UUID,
    val adjustmentType: String,
    val originalKrwAmount: Long,
    val adjustedKrwAmount: Long,
    val differenceAmount: Long,
    val reason: String? = null,
    val billedAt: OffsetDateTime? = null,
    val createdAt: OffsetDateTime = OffsetDateTime.now()
)

data class PendingAction(
    val pendingActionId: Long? = null,
    val accountId: java.util.UUID,
    val actionType: String,
    val referenceTable: String? = null,
    val referenceId: Long? = null,
    val title: String,
    val description: String? = null,
    val status: PendingActionStatus = PendingActionStatus.PENDING,
    val priority: Priority = Priority.MEDIUM,
    val createdAt: OffsetDateTime = OffsetDateTime.now(),
    val resolvedAt: OffsetDateTime? = null
)

enum class PendingActionStatus {
    PENDING, RESOLVED, DISMISSED
}

enum class Priority {
    HIGH, MEDIUM, LOW
}
