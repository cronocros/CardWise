package com.cardwise.performance.api

import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.performance.application.PerformanceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/cards")
class PerformanceController(
    private val performanceService: PerformanceService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/{userCardId}/performance")
    fun getPerformance(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ResponseEntity<PerformanceResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return ResponseEntity.ok(performanceService.getPerformance(userCardId, accountId))
    }
}
