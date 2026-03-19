package com.cardwise.analytics.api

import com.cardwise.analytics.application.AnalyticsService
import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import java.time.LocalDate
import java.time.YearMonth
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class AnalyticsController(
    private val analyticsService: AnalyticsService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/dashboard/monthly")
    fun getMonthlySummary(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ApiResponse<DashboardMonthlySummaryResponse> {
        val yearMonth = YearMonth.of(year, month)
        return ApiResponse(
            data = analyticsService.getMonthlySummary(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                yearMonth = yearMonth,
            ),
        )
    }

    @GetMapping("/dashboard/cards")
    fun getCardSummaries(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): ApiResponse<List<DashboardCardSummaryResponse>> {
        return ApiResponse(
            data = analyticsService.getCardSummaries(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                from = from,
                to = to,
            ),
        )
    }

    @GetMapping("/dashboard/categories")
    fun getCategorySummaries(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): ApiResponse<List<DashboardCategorySummaryResponse>> {
        return ApiResponse(
            data = analyticsService.getCategorySummaries(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                from = from,
                to = to,
            ),
        )
    }

    @GetMapping("/tags/stats")
    fun getTagSummaries(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): ApiResponse<List<DashboardTagSummaryResponse>> {
        return ApiResponse(
            data = analyticsService.getTagSummaries(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                from = from,
                to = to,
            ),
        )
    }

    @GetMapping("/tags/stats/cross")
    fun getTagCrossStats(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(defaultValue = "category") type: String,
        @RequestParam(name = "tagIds") tagIds: List<Long>,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): ApiResponse<TagCrossStatsResponse> {
        return ApiResponse(
            data = analyticsService.getTagCrossStats(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                type = type,
                tagIds = tagIds,
                from = from,
                to = to,
            ),
        )
    }

    @GetMapping("/dashboard/trends")
    fun getTrendPoints(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(defaultValue = "monthly") period: String,
        @RequestParam(defaultValue = "6") limit: Int,
    ): ApiResponse<List<DashboardTrendPointResponse>> {
        return ApiResponse(
            data = analyticsService.getTrendPoints(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                period = period,
                limit = limit,
            ),
        )
    }
}
