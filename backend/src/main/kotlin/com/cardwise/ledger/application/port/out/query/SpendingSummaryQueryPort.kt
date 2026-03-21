package com.cardwise.ledger.application.port.out.query

import java.util.UUID

interface SpendingSummaryQueryPort {
    fun getMonthlyTotalAmount(accountId: UUID, year: Int, month: Int): Long
}
