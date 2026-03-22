package com.cardwise.performance.application

import com.cardwise.performance.domain.event.PerformanceTierChangedEvent
import com.cardwise.performance.infrastructure.PerformanceTierRepository
import com.cardwise.card.adapter.out.persistence.repository.UserCardRepository
import com.cardwise.performance.infrastructure.UserPerformanceEntity
import com.cardwise.performance.infrastructure.UserPerformanceRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.YearMonth
import java.util.UUID

@Service
class PerformanceUpdateService(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
    private val userCardRepository: UserCardRepository,
    private val userPerformanceRepository: UserPerformanceRepository,
    private val performanceTierRepository: PerformanceTierRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    @Transactional
    fun recalculatePerformance(accountId: UUID, userCardId: Long, yearMonth: YearMonth) {
        val userCard = userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: return

        val cardId = userCard.cardId ?: return
        
        // Calculate monthly_spent from payment table
        val monthlySpent = calculateMonthlySpent(userCardId, yearMonth)

        // Find or create UserPerformanceEntity
        val yearMonthStr = yearMonth.toString()
        var performance = userPerformanceRepository.findByUserCardIdAndYearMonth(userCardId, yearMonthStr)
        if (performance == null) {
            performance = UserPerformanceEntity().apply {
                this.userCardId = userCardId
                this.yearMonth = yearMonthStr
                this.monthlySpent = monthlySpent
                this.annualAccumulated = 0 // Will be recalculated shortly
            }
        } else {
            performance.monthlySpent = monthlySpent
        }
        userPerformanceRepository.save(performance)

        // Calculate annual accumulated logic
        recalculateAnnualAccumulated(userCardId, cardId, accountId)
    }

    private fun calculateMonthlySpent(userCardId: Long, yearMonth: YearMonth): Long {
        val sql = """
            SELECT COALESCE(SUM(COALESCE(final_krw_amount, krw_amount)), 0)
            FROM payment
            WHERE user_card_id = :userCardId
              AND to_char(date_trunc('month', paid_at), 'YYYY-MM') = :yearMonth
              AND deleted_at IS NULL
        """.trimIndent()
        val params = MapSqlParameterSource()
            .addValue("userCardId", userCardId)
            .addValue("yearMonth", yearMonth.toString())
        return jdbcTemplate.queryForObject(sql, params, Long::class.java) ?: 0L
    }

    private fun recalculateAnnualAccumulated(userCardId: Long, cardId: Long, accountId: UUID) {
        val allPerformances = userPerformanceRepository
            .findAllByUserCardIdAndYearMonthBetweenOrderByYearMonthAsc(userCardId, "1900-01", "2999-12")
            .sortedBy { it.yearMonth }

        val tiers = performanceTierRepository.findAllByCardIdOrderBySortOrderAsc(cardId)
            .sortedBy { it.minAmount }

        var runningTotal = 0L
        for (perf in allPerformances) {
            runningTotal += perf.monthlySpent
            perf.annualAccumulated = runningTotal
            
            val newTier = tiers.findLast { 
                val maxAmt = it.maxAmount
                it.minAmount <= runningTotal && (maxAmt == null || runningTotal <= maxAmt) 
            }
            val newTierId = newTier?.performanceTierId
            
            if (perf.performanceTierId != newTierId) {
                val oldTierId = perf.performanceTierId
                val oldTier = tiers.find { it.performanceTierId == oldTierId }
                
                perf.performanceTierId = newTierId
                userPerformanceRepository.save(perf)

                eventPublisher.publishEvent(
                    PerformanceTierChangedEvent(
                        accountId = accountId,
                        userCardId = userCardId,
                        yearMonth = YearMonth.parse(perf.yearMonth),
                        oldTierId = oldTierId,
                        oldTierName = oldTier?.tierName,
                        newTierId = newTierId,
                        newTierName = newTier?.tierName
                    )
                )
            } else {
                userPerformanceRepository.save(perf)
            }
        }
    }
}
