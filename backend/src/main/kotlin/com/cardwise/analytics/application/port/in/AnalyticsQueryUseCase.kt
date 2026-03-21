package com.cardwise.analytics.application.port.`in`

import com.cardwise.analytics.api.DashboardCardSummaryResponse
import com.cardwise.analytics.api.DashboardCategorySummaryResponse
import com.cardwise.analytics.api.DashboardMonthlySummaryResponse
import com.cardwise.analytics.api.DashboardTagSummaryResponse
import com.cardwise.analytics.api.DashboardTrendPointResponse
import com.cardwise.analytics.api.TagCrossStatsResponse
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

interface AnalyticsQueryUseCase {
    fun getMonthlySummary(accountId: UUID, yearMonth: YearMonth): DashboardMonthlySummaryResponse
    fun getCardSummaries(accountId: UUID, from: LocalDate, to: LocalDate): List<DashboardCardSummaryResponse>
    fun getCategorySummaries(accountId: UUID, from: LocalDate, to: LocalDate): List<DashboardCategorySummaryResponse>
    fun getTagSummaries(accountId: UUID, from: LocalDate, to: LocalDate): List<DashboardTagSummaryResponse>
    fun getTrendPoints(accountId: UUID, period: String, limit: Int): List<DashboardTrendPointResponse>
    fun getTagCrossStats(accountId: UUID, type: String, tagIds: List<Long>, from: LocalDate, to: LocalDate): TagCrossStatsResponse
}
