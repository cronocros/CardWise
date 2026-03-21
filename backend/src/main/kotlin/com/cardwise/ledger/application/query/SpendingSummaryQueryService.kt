package com.cardwise.ledger.application.query

import com.cardwise.ledger.application.port.out.query.SpendingSummaryQueryPort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class SpendingSummaryQueryService(
    private val spendingSummaryQueryPort: SpendingSummaryQueryPort,
) : GetSpendingSummaryQuery {
    override fun getMonthlySummary(accountId: UUID, year: Int, month: Int): SpendingSummaryResponse {
        val totalAmount = spendingSummaryQueryPort.getMonthlyTotalAmount(accountId, year, month)
        return SpendingSummaryResponse(
            totalAmount = totalAmount,
            year = year,
            month = month,
        )
    }
}
