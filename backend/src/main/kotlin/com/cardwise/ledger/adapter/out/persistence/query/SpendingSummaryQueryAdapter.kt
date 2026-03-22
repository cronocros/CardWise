package com.cardwise.ledger.adapter.out.persistence.query

import com.cardwise.ledger.application.port.out.query.SpendingSummaryQueryPort
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID

@Component
class SpendingSummaryQueryAdapter(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) : SpendingSummaryQueryPort {
    override fun getMonthlyTotalAmount(accountId: UUID, year: Int, month: Int): Long {
        val startOfMonth = LocalDateTime.of(year, month, 1, 0, 0).atOffset(ZoneOffset.UTC)
        val endOfMonth = startOfMonth.plusMonths(1)

        val sql = """
            SELECT COALESCE(SUM(COALESCE(final_krw_amount, krw_amount)), 0)
            FROM payment
            WHERE account_id = :accountId
              AND transaction_type = 'EXPENSE'
              AND deleted_at IS NULL
              AND paid_at >= :startOfMonth
              AND paid_at < :endOfMonth
        """

        val params = mapOf(
            "accountId" to accountId,
            "startOfMonth" to startOfMonth,
            "endOfMonth" to endOfMonth
        )

        return jdbcTemplate.queryForObject(sql, params, Long::class.java) ?: 0L
    }
}
