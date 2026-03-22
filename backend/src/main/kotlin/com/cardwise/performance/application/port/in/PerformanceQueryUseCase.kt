package com.cardwise.performance.application.port.`in`

import com.cardwise.performance.api.PerformanceResponse
import java.util.UUID

interface PerformanceQueryUseCase {
    fun getPerformance(userCardId: Long, accountId: UUID): PerformanceResponse
}
