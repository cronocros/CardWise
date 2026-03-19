package com.cardwise.analytics.application

import com.cardwise.analytics.api.DashboardCardSummaryResponse
import com.cardwise.analytics.api.DashboardCategorySummaryResponse
import com.cardwise.analytics.api.DashboardMonthlySummaryResponse
import com.cardwise.analytics.api.DashboardTagSummaryResponse
import com.cardwise.analytics.api.DashboardTrendPointResponse
import com.cardwise.analytics.api.TagCrossBreakdownResponse
import com.cardwise.analytics.api.TagCrossSelectionResponse
import com.cardwise.analytics.api.TagCrossStatsResponse
import com.cardwise.analytics.infrastructure.AnalyticsReadRepository
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class AnalyticsService(
    private val analyticsReadRepository: AnalyticsReadRepository,
) {
    fun getMonthlySummary(accountId: UUID, yearMonth: YearMonth): DashboardMonthlySummaryResponse {
        val current = analyticsReadRepository.findMonthlySummary(accountId, yearMonth)
        val previousYearMonth = yearMonth.minusMonths(1)
        val previous = analyticsReadRepository.findMonthlySummary(accountId, previousYearMonth)
        val totalSpent = current?.totalSpent ?: 0L
        val previousSpent = previous?.totalSpent ?: 0L
        val changeAmount = totalSpent - previousSpent
        val changeRate = if (previousSpent > 0L) {
            (changeAmount.toDouble() / previousSpent.toDouble()) * 100.0
        } else {
            null
        }

        return DashboardMonthlySummaryResponse(
            yearMonth = yearMonth.toString(),
            totalSpent = totalSpent,
            totalBenefit = current?.totalBenefit ?: 0L,
            paymentCount = current?.paymentCount ?: 0,
            previousYearMonth = previous?.yearMonth,
            previousSpent = previousSpent,
            changeAmount = changeAmount,
            changeRate = changeRate,
        )
    }

    fun getCardSummaries(accountId: UUID, from: LocalDate, to: LocalDate): List<DashboardCardSummaryResponse> {
        return analyticsReadRepository.findCardSummaries(accountId, resolveYearMonth(from, to))
            .map { row ->
                DashboardCardSummaryResponse(
                    userCardId = row.userCardId,
                    cardName = row.cardName,
                    spentAmount = row.spentAmount,
                    benefitAmount = row.benefitAmount,
                    paymentCount = row.paymentCount,
                    annualAccumulated = row.annualAccumulated,
                    currentTierName = row.currentTierName,
                )
            }
    }

    fun getCategorySummaries(accountId: UUID, from: LocalDate, to: LocalDate): List<DashboardCategorySummaryResponse> {
        val rows = analyticsReadRepository.findCategorySummaries(accountId, resolveYearMonth(from, to))
        val totalSpent = rows.sumOf { it.spentAmount }.takeIf { it > 0L } ?: 0L

        return rows.map { row ->
            DashboardCategorySummaryResponse(
                categoryId = row.categoryId,
                categoryName = row.categoryName,
                spentAmount = row.spentAmount,
                benefitAmount = row.benefitAmount,
                paymentCount = row.paymentCount,
                sharePercent = if (totalSpent > 0L) (row.spentAmount.toDouble() / totalSpent.toDouble()) * 100.0 else 0.0,
            )
        }
    }

    fun getTagSummaries(accountId: UUID, from: LocalDate, to: LocalDate): List<DashboardTagSummaryResponse> {
        val rows = analyticsReadRepository.findTagSummaries(accountId, resolveYearMonth(from, to))
        val totalSpent = rows.sumOf { it.spentAmount }.takeIf { it > 0L } ?: 0L

        return rows.map { row ->
            DashboardTagSummaryResponse(
                tagId = row.tagId,
                tagName = row.tagName,
                spentAmount = row.spentAmount,
                paymentCount = row.paymentCount,
                sharePercent = if (totalSpent > 0L) (row.spentAmount.toDouble() / totalSpent.toDouble()) * 100.0 else 0.0,
            )
        }
    }

    fun getTrendPoints(accountId: UUID, period: String, limit: Int): List<DashboardTrendPointResponse> {
        val normalizedLimit = limit.coerceIn(3, 12)
        return when (period.uppercase()) {
            "MONTHLY" -> analyticsReadRepository.findMonthlyTrends(accountId, normalizedLimit)
            "WEEKLY" -> analyticsReadRepository.findMonthlyTrends(accountId, 4)
            else -> analyticsReadRepository.findMonthlyTrends(accountId, normalizedLimit)
        }.map { row ->
            DashboardTrendPointResponse(
                yearMonth = row.yearMonth,
                totalSpent = row.totalSpent,
                totalBenefit = row.totalBenefit,
                paymentCount = row.paymentCount,
            )
        }
    }

    fun getTagCrossStats(
        accountId: UUID,
        type: String,
        tagIds: List<Long>,
        from: LocalDate,
        to: LocalDate,
    ): TagCrossStatsResponse {
        val normalizedTagIds = tagIds.distinct().filter { it > 0L }
        val selectedTags = analyticsReadRepository.findTagsByIds(accountId, normalizedTagIds)
            .map { row ->
                TagCrossSelectionResponse(
                    tagId = row.tagId,
                    tagName = row.tagName,
                )
            }

        if (selectedTags.isEmpty()) {
            return TagCrossStatsResponse(
                crossType = normalizeCrossType(type),
                selectedTags = emptyList(),
                totalSpent = 0L,
                paymentCount = 0,
                breakdown = emptyList(),
            )
        }

        val breakdownRows = when (normalizeCrossType(type)) {
            "period" -> analyticsReadRepository.findTagCrossByPeriod(accountId, normalizedTagIds, from, to)
            "tag" -> analyticsReadRepository.findTagCrossByTag(accountId, normalizedTagIds, from, to)
            else -> analyticsReadRepository.findTagCrossByCategory(accountId, normalizedTagIds, from, to)
        }

        val breakdown = breakdownRows.map { row ->
            TagCrossBreakdownResponse(
                label = row.label,
                amount = row.amount,
                paymentCount = row.paymentCount,
            )
        }

        return TagCrossStatsResponse(
            crossType = normalizeCrossType(type),
            selectedTags = selectedTags,
            totalSpent = breakdown.sumOf { it.amount },
            paymentCount = breakdown.sumOf { it.paymentCount },
            breakdown = breakdown,
        )
    }

    private fun resolveYearMonth(from: LocalDate, to: LocalDate): YearMonth {
        val fromYearMonth = YearMonth.from(from)
        val toYearMonth = YearMonth.from(to)
        return if (toYearMonth.isBefore(fromYearMonth)) fromYearMonth else toYearMonth
    }

    private fun normalizeCrossType(type: String): String {
        return when (type.lowercase()) {
            "period", "tag" -> type.lowercase()
            else -> "category"
        }
    }
}
