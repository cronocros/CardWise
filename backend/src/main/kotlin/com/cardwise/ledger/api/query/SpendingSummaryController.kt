package com.cardwise.ledger.api.query

import com.cardwise.common.api.ApiResponse
import com.cardwise.ledger.application.query.GetSpendingSummaryQuery
import com.cardwise.ledger.application.query.SpendingSummaryResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@Tag(name = "지출 요약 (Query)")
@RestController
@RequestMapping("/api/v1/spending-summary")
class SpendingSummaryController(
    private val getSpendingSummaryQuery: GetSpendingSummaryQuery,
) {
    @Operation(summary = "월별 지출 합계 조회")
    @GetMapping("/monthly")
    fun getMonthlySummary(
        @RequestParam accountId: UUID,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ApiResponse<SpendingSummaryResponse> {
        val response = getSpendingSummaryQuery.getMonthlySummary(accountId, year, month)
        return ApiResponse(data = response)
    }
}
