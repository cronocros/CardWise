package com.cardwise.ledger.domain.event

import java.time.OffsetDateTime
import java.util.UUID

data class PaymentCreatedEvent(
    val paymentId: Long,
    val accountId: UUID,
    val userCardId: Long,
    val krwAmount: Long,
    val finalKrwAmount: Long?,
    val paidAt: OffsetDateTime,
)

data class PaymentUpdatedEvent(
    val paymentId: Long,
    val accountId: UUID,
    val userCardId: Long,
    val krwAmount: Long,
    val finalKrwAmount: Long?,
    val paidAt: OffsetDateTime,
)

data class PaymentDeletedEvent(
    val paymentId: Long,
    val accountId: UUID,
    val userCardId: Long,
    val paidAt: OffsetDateTime,
)
