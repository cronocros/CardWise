package com.cardwise.ledger.application.service

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.api.PaginationMeta
import com.cardwise.common.exception.NotFoundException
import com.cardwise.ledger.application.port.`in`.PaymentUseCase
import com.cardwise.ledger.application.port.out.PaymentPersistencePort
import com.cardwise.ledger.domain.model.Payment
import com.cardwise.ledger.domain.model.TransactionType
import com.cardwise.ledger.dto.*
import com.cardwise.notification.application.NotificationService
import com.cardwise.notification.infrastructure.NotificationInsertCommand
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.*

@Service
@Transactional(readOnly = true)
class PaymentApplicationService(
    private val persistencePort: PaymentPersistencePort,
    private val notificationService: NotificationService,
    private val eventPublisher: ApplicationEventPublisher
) : PaymentUseCase {

    override fun getPayments(accountId: UUID, limit: Int): ApiResponse<List<PaymentResponse>> {
        val normalizedLimit = limit.coerceIn(1, 100)
        val domainRows = persistencePort.findAllByAccountId(accountId, normalizedLimit + 1)
        
        val hasMore = domainRows.size > normalizedLimit
        val visible = domainRows.take(normalizedLimit).map { it.toResponse() }
        val nextCursor = if (hasMore) visible.lastOrNull()?.paymentId?.toString() else null

        return ApiResponse(
            data = visible,
            meta = mapOf("pagination" to PaginationMeta(nextCursor = nextCursor, hasMore = hasMore, limit = normalizedLimit)),
        )
    }

    @Transactional
    override fun createPayment(accountId: UUID, request: CreatePaymentRequest): ApiResponse<PaymentResponse> {
        val payment = Payment(
            accountId = accountId,
            userCardId = request.userCardId,
            merchantNameRaw = request.merchantName,
            paidAt = request.paidAt,
            krwAmount = request.krwAmount,
            finalKrwAmount = request.krwAmount,
            transactionType = TransactionType.valueOf(request.transactionType)
        )

        val saved = persistencePort.save(payment)

        // Notification Integration
        notificationService.createNotification(
            NotificationInsertCommand(
                accountId = accountId,
                notificationType = "SYSTEM",
                eventCode = "PAYMENT_CREATED",
                title = "가계부 내역 추가",
                body = "[${request.merchantName}] ${request.krwAmount}원 결제 내역이 수동으로 추가되었습니다.",
                referenceTable = "payment",
                referenceId = saved.paymentId,
            )
        )

        eventPublisher.publishEvent(
            com.cardwise.ledger.domain.event.PaymentCreatedEvent(
                paymentId = saved.paymentId!!,
                accountId = accountId,
                userCardId = request.userCardId,
                krwAmount = request.krwAmount,
                finalKrwAmount = saved.finalKrwAmount,
                paidAt = request.paidAt
            )
        )

        return ApiResponse(data = saved.toResponse())
    }

    @Transactional
    override fun updatePayment(paymentId: Long, accountId: UUID, request: UpdatePaymentRequest): ApiResponse<PaymentResponse> {
        val existing = persistencePort.findById(paymentId, accountId) ?: throw NotFoundException("Payment not found")
        
        val updated = existing.copy(
            userCardId = request.userCardId,
            merchantNameRaw = request.merchantName,
            krwAmount = request.krwAmount,
            finalKrwAmount = request.krwAmount,
            paidAt = request.paidAt,
            transactionType = TransactionType.valueOf(request.transactionType),
            updatedAt = OffsetDateTime.now()
        )

        val saved = persistencePort.save(updated)
        
        eventPublisher.publishEvent(
            com.cardwise.ledger.domain.event.PaymentUpdatedEvent(
                paymentId = saved.paymentId!!,
                accountId = accountId,
                userCardId = request.userCardId,
                krwAmount = request.krwAmount,
                finalKrwAmount = saved.finalKrwAmount,
                paidAt = request.paidAt
            )
        )

        return ApiResponse(data = saved.toResponse())
    }

    @Transactional
    override fun deletePayment(paymentId: Long, accountId: UUID): ApiResponse<Unit> {
        persistencePort.delete(paymentId, accountId)
        return ApiResponse(data = Unit)
    }

    override fun listPaymentAdjustments(paymentId: Long, accountId: UUID): ApiResponse<List<AdjustmentResponse>> {
        val items = persistencePort.findAdjustmentsByPaymentId(paymentId, accountId)
        return ApiResponse(data = items.map { it.toResponse() })
    }

    @Transactional
    override fun createPaymentAdjustment(paymentId: Long, accountId: UUID, request: CreatePaymentAdjustmentRequest): ApiResponse<AdjustmentResponse> {
        // Logic for adjustment creation
        return ApiResponse(data = AdjustmentResponse(0L, paymentId, AdjustmentType.OTHER, 0L, 0L, 0L, null, null, OffsetDateTime.now()))
    }

    // Mapper helper
    private fun Payment.toResponse() = PaymentResponse(
        paymentId = paymentId!!,
        userCardId = userCardId,
        merchantName = merchantNameRaw,
        krwAmount = krwAmount,
        finalKrwAmount = finalKrwAmount ?: krwAmount,
        paidAt = paidAt,
        transactionType = transactionType.name,
        isAdjusted = isAdjusted
    )

    private fun com.cardwise.ledger.domain.model.PaymentAdjustment.toResponse() = AdjustmentResponse(
        adjustmentId = adjustmentId ?: 0L,
        paymentId = paymentId,
        adjustmentType = AdjustmentType.valueOf(adjustmentType),
        originalKrwAmount = originalKrwAmount,
        adjustedKrwAmount = adjustedKrwAmount,
        differenceAmount = differenceAmount,
        reason = reason,
        billedAt = billedAt,
        createdAt = createdAt
    )
}
