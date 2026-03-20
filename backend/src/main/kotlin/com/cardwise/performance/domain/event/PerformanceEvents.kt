package com.cardwise.performance.domain.event

import java.time.YearMonth
import java.util.UUID

data class PerformanceTierChangedEvent(
    val accountId: UUID,
    val userCardId: Long,
    val yearMonth: YearMonth,
    val oldTierId: Long?,
    val oldTierName: String?,
    val newTierId: Long?,
    val newTierName: String?,
)
