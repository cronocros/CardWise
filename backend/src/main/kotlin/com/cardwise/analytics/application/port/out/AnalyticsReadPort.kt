package com.cardwise.analytics.application.port.out

import com.cardwise.analytics.infrastructure.CardSummaryRow
import com.cardwise.analytics.infrastructure.CategorySummaryRow
import com.cardwise.analytics.infrastructure.MonthlySummaryRow
import com.cardwise.analytics.infrastructure.TagCrossBreakdownRow
import com.cardwise.analytics.infrastructure.TagSelectionRow
import com.cardwise.analytics.infrastructure.TagSummaryRow
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

interface AnalyticsReadPort {
    fun findMonthlySummary(accountId: UUID, yearMonth: YearMonth): MonthlySummaryRow?
    fun findCardSummaries(accountId: UUID, yearMonth: YearMonth): List<CardSummaryRow>
    fun findCategorySummaries(accountId: UUID, yearMonth: YearMonth): List<CategorySummaryRow>
    fun findTagSummaries(accountId: UUID, yearMonth: YearMonth): List<TagSummaryRow>
    fun findMonthlyTrends(accountId: UUID, limit: Int): List<MonthlySummaryRow>
    fun findTagsByIds(accountId: UUID, tagIds: List<Long>): List<TagSelectionRow>
    fun findTagCrossByCategory(accountId: UUID, tagIds: List<Long>, from: LocalDate, to: LocalDate): List<TagCrossBreakdownRow>
    fun findTagCrossByPeriod(accountId: UUID, tagIds: List<Long>, from: LocalDate, to: LocalDate): List<TagCrossBreakdownRow>
    fun findTagCrossByTag(accountId: UUID, tagIds: List<Long>, from: LocalDate, to: LocalDate): List<TagCrossBreakdownRow>
}
