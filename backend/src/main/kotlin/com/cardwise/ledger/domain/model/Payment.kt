package com.cardwise.ledger.domain.model

enum class TransactionType {
    INCOME, EXPENSE
}

data class Payment(
    val paymentId: Long? = null,
    val accountId: java.util.UUID,
    val userCardId: Long,
    val merchantNameRaw: String,
    val paidAt: java.time.OffsetDateTime,
    val krwAmount: Long,
    val finalKrwAmount: Long? = null,
    val isAdjusted: Boolean = false,
    val transactionType: TransactionType = TransactionType.EXPENSE,
    val deletedAt: java.time.OffsetDateTime? = null,
    val updatedAt: java.time.OffsetDateTime? = null
)
