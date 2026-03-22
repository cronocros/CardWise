package com.cardwise.ledger.adapter.out.persistence.repository

import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

interface PaymentProjection {
    val paymentId: Long
    val accountId: UUID
    val userCardId: Long
    val merchantNameRaw: String
    val krwAmount: Long
    val finalKrwAmount: Long?
    val paidAt: OffsetDateTime
    val transactionType: String
    val isAdjusted: Boolean
}

interface PaymentAdjustmentProjection {
    val adjustmentId: Long
    val paymentId: Long
    val adjustmentType: String
    val originalKrwAmount: Long
    val adjustedKrwAmount: Long
    val reason: String?
    val billedAt: LocalDate?
    val createdAt: OffsetDateTime
}

interface PendingActionProjection {
    val pendingActionId: Long
    val accountId: UUID
    val actionType: String
    val referenceTable: String?
    val referenceId: Long?
    val title: String
    val description: String?
    val status: String
    val priority: String
    val createdAt: OffsetDateTime
    val resolvedAt: OffsetDateTime?
}
