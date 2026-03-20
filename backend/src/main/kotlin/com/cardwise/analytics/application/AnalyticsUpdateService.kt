package com.cardwise.analytics.application

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.YearMonth
import java.util.UUID

@Service
class AnalyticsUpdateService(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) {
    @Transactional
    fun recalculateAllSummaries(accountId: UUID, yearMonth: YearMonth) {
        val yearMonthStr = yearMonth.toString()
        
        recalculateUserMonthlySummary(accountId, yearMonthStr)
        recalculateUserCardMonthlySummary(accountId, yearMonthStr)
        recalculateUserCategoryMonthlySummary(accountId, yearMonthStr)
        // Tag summary can be added similarly if needed
    }

    private fun recalculateUserMonthlySummary(accountId: UUID, yearMonthStr: String) {
        val sql = """
            INSERT INTO user_monthly_summary (account_id, year_month, total_spent, total_benefit, payment_count, updated_at)
            SELECT 
                p.account_id, 
                :yearMonth,
                COALESCE(SUM(COALESCE(p.final_krw_amount, p.krw_amount)), 0),
                COALESCE((
                    SELECT SUM(pi.benefit_amount)
                    FROM payment_item pi
                    JOIN payment p2 ON p2.payment_id = pi.payment_id
                    WHERE p2.account_id = :accountId
                      AND to_char(p2.paid_at, 'YYYY-MM') = :yearMonth
                      AND p2.deleted_at IS NULL
                ), 0),
                COUNT(*)
            FROM payment p
            WHERE p.account_id = :accountId
              AND to_char(p.paid_at, 'YYYY-MM') = :yearMonth
              AND p.deleted_at IS NULL
            GROUP BY p.account_id
            ON CONFLICT (account_id, year_month) DO UPDATE SET
                total_spent = EXCLUDED.total_spent,
                total_benefit = EXCLUDED.total_benefit,
                payment_count = EXCLUDED.payment_count,
                updated_at = now()
        """.trimIndent()
        
        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonthStr)
        
        jdbcTemplate.update(sql, params)
    }

    private fun recalculateUserCardMonthlySummary(accountId: UUID, yearMonthStr: String) {
        // Clear existing for this month to handle removed cards
        jdbcTemplate.update(
            "DELETE FROM user_card_summary WHERE account_id = :accountId AND year_month = :yearMonth",
            MapSqlParameterSource().addValue("accountId", accountId).addValue("yearMonth", yearMonthStr)
        )

        val sql = """
            INSERT INTO user_card_summary (account_id, user_card_id, year_month, spent_amount, benefit_amount, payment_count, updated_at)
            SELECT 
                p.account_id, 
                p.user_card_id,
                :yearMonth,
                SUM(COALESCE(p.final_krw_amount, p.krw_amount)),
                COALESCE((
                    SELECT SUM(pi.benefit_amount)
                    FROM payment_item pi
                    JOIN payment p2 ON p2.payment_id = pi.payment_id
                    WHERE p2.user_card_id = p.user_card_id
                      AND to_char(p2.paid_at, 'YYYY-MM') = :yearMonth
                      AND p2.deleted_at IS NULL
                ), 0),
                COUNT(*),
                now()
            FROM payment p
            WHERE p.account_id = :accountId
              AND to_char(p.paid_at, 'YYYY-MM') = :yearMonth
              AND p.deleted_at IS NULL
              AND p.user_card_id IS NOT NULL
            GROUP BY p.account_id, p.user_card_id
        """.trimIndent()
        
        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonthStr)
        
        jdbcTemplate.update(sql, params)
    }

    private fun recalculateUserCategoryMonthlySummary(accountId: UUID, yearMonthStr: String) {
        // Clear existing
        jdbcTemplate.update(
            "DELETE FROM user_category_summary WHERE account_id = :accountId AND year_month = :yearMonth",
            MapSqlParameterSource().addValue("accountId", accountId).addValue("yearMonth", yearMonthStr)
        )

        val sql = """
            INSERT INTO user_category_summary (account_id, category_id, year_month, spent_amount, benefit_amount, payment_count, updated_at)
            SELECT 
                p.account_id,
                pi.category_id,
                :yearMonth,
                SUM(pi.amount),
                SUM(pi.benefit_amount),
                COUNT(*),
                now()
            FROM payment p
            JOIN payment_item pi ON pi.payment_id = p.payment_id
            WHERE p.account_id = :accountId
              AND to_char(p.paid_at, 'YYYY-MM') = :yearMonth
              AND p.deleted_at IS NULL
              AND pi.category_id IS NOT NULL
            GROUP BY p.account_id, pi.category_id
        """.trimIndent()
        
        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonthStr)
        
        jdbcTemplate.update(sql, params)
    }
}
