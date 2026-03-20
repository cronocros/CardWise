package com.cardwise.performance.application

import com.cardwise.ledger.domain.event.PaymentCreatedEvent
import com.cardwise.ledger.domain.event.PaymentDeletedEvent
import com.cardwise.ledger.domain.event.PaymentUpdatedEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import java.time.YearMonth

@Component
class PerformanceEventHandler(
    private val performanceUpdateService: PerformanceUpdateService,
) {
    @EventListener
    fun handlePaymentCreated(event: PaymentCreatedEvent) {
        val yearMonth = YearMonth.from(event.paidAt.toLocalDate())
        performanceUpdateService.recalculatePerformance(
            accountId = event.accountId,
            userCardId = event.userCardId,
            yearMonth = yearMonth
        )
    }

    @EventListener
    fun handlePaymentUpdated(event: PaymentUpdatedEvent) {
        val yearMonth = YearMonth.from(event.paidAt.toLocalDate())
        performanceUpdateService.recalculatePerformance(
            accountId = event.accountId,
            userCardId = event.userCardId,
            yearMonth = yearMonth
        )
    }

    @EventListener
    fun handlePaymentDeleted(event: PaymentDeletedEvent) {
        val yearMonth = YearMonth.from(event.paidAt.toLocalDate())
        performanceUpdateService.recalculatePerformance(
            accountId = event.accountId,
            userCardId = event.userCardId,
            yearMonth = yearMonth
        )
    }
}
