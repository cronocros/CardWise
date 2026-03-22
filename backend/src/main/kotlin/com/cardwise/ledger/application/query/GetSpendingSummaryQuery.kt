package com.cardwise.ledger.application.query

import java.util.UUID

interface GetSpendingSummaryQuery {
    fun getMonthlySummary(accountId: UUID, year: Int, month: Int): SpendingSummaryResponse
}

data class SpendingSummaryResponse(
    val totalAmount: Long,
    val year: Int,
    val month: Int,
)
