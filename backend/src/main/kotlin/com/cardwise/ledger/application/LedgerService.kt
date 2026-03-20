package com.cardwise.ledger.application

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.api.CountResponse
import com.cardwise.common.api.PaginationMeta
import com.cardwise.common.exception.BadRequestException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.ledger.dto.AdjustmentType
import com.cardwise.ledger.dto.AdjustmentResponse
import com.cardwise.ledger.dto.CreatePaymentAdjustmentRequest
import com.cardwise.ledger.dto.PendingActionResponse
import com.cardwise.ledger.dto.PendingActionStatus
import com.cardwise.ledger.dto.PendingActionType
import com.cardwise.ledger.dto.PendingActionResolutionRequest
import com.cardwise.ledger.dto.Priority
import com.cardwise.ledger.dto.ResolvePendingActionRequest
import com.cardwise.ledger.dto.ResolutionAction
import com.cardwise.ledger.entity.PaymentAdjustmentEntity
import com.cardwise.ledger.entity.PendingActionEntity
import com.cardwise.ledger.repository.PaymentAdjustmentRepository
import com.cardwise.ledger.repository.PaymentProjection
import com.cardwise.ledger.repository.PaymentRepository
import com.cardwise.ledger.repository.PendingActionProjection
import com.cardwise.ledger.repository.PendingActionRepository
import com.cardwise.notification.application.NotificationService
import com.cardwise.notification.infrastructure.NotificationInsertCommand
import java.time.Clock
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class LedgerService(
    private val paymentRepository: PaymentRepository,
    private val paymentAdjustmentRepository: PaymentAdjustmentRepository,
    private val pendingActionRepository: PendingActionRepository,
    private val notificationService: NotificationService,
    private val clock: Clock,
) {
    @Transactional
    fun createPayment(
        accountId: UUID,
        request: com.cardwise.ledger.dto.CreatePaymentRequest,
    ): ApiResponse<com.cardwise.ledger.dto.PaymentResponse> {
        val now = OffsetDateTime.now(clock)
        val payment = com.cardwise.ledger.entity.PaymentEntity().apply {
            this.accountId = accountId
            userCardId = request.userCardId
            merchantNameRaw = request.merchantName
            krwAmount = request.krwAmount
            finalKrwAmount = request.krwAmount
            paidAt = request.paidAt
            isAdjusted = false
            updatedAt = now
        }

        val saved = paymentRepository.save(payment)

        // 알림 생성 연동
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

        return ApiResponse(data = toPaymentResponse(saved))
    }
    fun listPaymentAdjustments(
        paymentId: Long,
        accountId: UUID,
    ): ApiResponse<List<AdjustmentResponse>> {
        requirePayment(paymentId, accountId)
        val items = paymentAdjustmentRepository
            .findAllByPaymentIdOrderByCreatedAtDesc(paymentId)
            .map(::toAdjustmentResponse)
        return ApiResponse(data = items)
    }

    fun listPayments(
        accountId: UUID,
        limit: Int,
    ): ApiResponse<List<com.cardwise.ledger.dto.PaymentResponse>> {
        val normalizedLimit = limit.coerceIn(1, 100)
        val rows = paymentRepository.findAllByAccountIdAndDeletedAtIsNull(
            accountId = accountId,
            limit = normalizedLimit + 1,
        )
        val hasMore = rows.size > normalizedLimit
        val visible = rows.take(normalizedLimit).map(::toPaymentResponse)
        val nextCursor = if (hasMore) visible.lastOrNull()?.paymentId?.toString() else null

        return ApiResponse(
            data = visible,
            meta = mapOf("pagination" to com.cardwise.common.api.PaginationMeta(nextCursor = nextCursor, hasMore = hasMore, limit = normalizedLimit)),
        )
    }

    @Transactional
    fun deletePayment(
        paymentId: Long,
        accountId: UUID,
    ): ApiResponse<Unit> {
        val updated = paymentRepository.softDelete(paymentId, accountId)
        if (updated != 1) {
            throw NotFoundException("Payment not found or already deleted")
        }
        return ApiResponse(data = Unit)
    }

    @Transactional
    fun createPaymentAdjustment(
        paymentId: Long,
        accountId: UUID,
        request: CreatePaymentAdjustmentRequest,
    ): ApiResponse<AdjustmentResponse> {
        val payment = requirePayment(paymentId, accountId)
        validateAmounts(request.originalKrwAmount, request.adjustedKrwAmount)

        val now = OffsetDateTime.now(clock)
        val adjustment = PaymentAdjustmentEntity().apply {
            this.paymentId = paymentId
            adjustmentType = request.adjustmentType.name
            originalKrwAmount = request.originalKrwAmount
            adjustedKrwAmount = request.adjustedKrwAmount
            reason = request.reason.trim()
            billedAt = request.billedAt ?: payment.paidAt?.toLocalDate()
            createdAt = now
        }

        val saved = paymentAdjustmentRepository.save(adjustment)
        applyFinalAmount(paymentId, accountId, request.adjustedKrwAmount)
        return ApiResponse(data = toAdjustmentResponse(saved))
    }

    fun listPendingActions(
        accountId: UUID,
        status: PendingActionStatus?,
        priority: Priority?,
        limit: Int,
    ): ApiResponse<List<PendingActionResponse>> {
        val normalizedLimit = limit.coerceIn(1, 100)
        val rows = pendingActionRepository.findByAccountIdWithFilters(
            accountId = accountId,
            status = status?.name,
            priority = priority?.name,
            limit = normalizedLimit + 1,
        )
        val hasMore = rows.size > normalizedLimit
        val visible = rows.take(normalizedLimit).map(::toPendingActionResponse)
        val nextCursor = if (hasMore) visible.lastOrNull()?.pendingActionId?.toString() else null

        return ApiResponse(
            data = visible,
            meta = mapOf("pagination" to PaginationMeta(nextCursor = nextCursor, hasMore = hasMore, limit = normalizedLimit)),
        )
    }

    fun countPendingActions(
        accountId: UUID,
        status: PendingActionStatus?,
    ): ApiResponse<CountResponse> {
        val count = pendingActionRepository.countByAccountIdAndStatus(accountId, status?.name)
        return ApiResponse(data = CountResponse(count))
    }

    @Transactional
    fun resolvePendingAction(
        pendingActionId: Long,
        accountId: UUID,
        request: ResolvePendingActionRequest,
    ): ApiResponse<PendingActionResponse> {
        val pendingAction = requirePendingAction(pendingActionId, accountId)
        ensurePending(pendingAction)

        applyResolutionSideEffects(pendingAction, accountId, request.resolution)
        pendingAction.status = PendingActionStatus.RESOLVED.name
        pendingAction.resolvedAt = OffsetDateTime.now(clock)

        val saved = pendingActionRepository.save(pendingAction)
        return ApiResponse(data = toPendingActionResponse(saved))
    }

    @Transactional
    fun dismissPendingAction(
        pendingActionId: Long,
        accountId: UUID,
    ): ApiResponse<PendingActionResponse> {
        val pendingAction = requirePendingAction(pendingActionId, accountId)
        ensurePending(pendingAction)

        pendingAction.status = PendingActionStatus.DISMISSED.name
        pendingAction.resolvedAt = OffsetDateTime.now(clock)

        val saved = pendingActionRepository.save(pendingAction)
        return ApiResponse(data = toPendingActionResponse(saved))
    }

    private fun applyResolutionSideEffects(
        pendingAction: PendingActionEntity,
        accountId: UUID,
        resolution: PendingActionResolutionRequest,
    ) {
        when (resolution.action) {
            ResolutionAction.APPLY_FX_CORRECTION,
            ResolutionAction.APPLY_BILLING_DISCOUNT -> {
                val paymentId = resolvePaymentId(pendingAction, accountId)
                val finalAmount = resolution.adjustedAmount ?: resolveSuggestedAmount(pendingAction)
                    ?: throw BadRequestException("adjustedAmount is required for amount correction actions")
                validateAmounts(1, finalAmount)
                applyFinalAmount(paymentId, accountId, finalAmount)
            }

            ResolutionAction.APPLY_PERFORMANCE_EXCLUSION -> {
                if (pendingAction.referenceTable != "payment_item" || pendingAction.referenceId == null) {
                    throw BadRequestException("Performance exclusion requires a payment_item reference")
                }

                val updated = paymentRepository.updatePaymentItemExcludedFromPerformance(
                    paymentItemId = pendingAction.referenceId!!,
                    accountId = accountId,
                    excluded = true,
                )
                if (updated != 1) {
                    throw NotFoundException("Payment item not found for performance exclusion")
                }
            }

            ResolutionAction.CONFIRM_PAYMENT,
            ResolutionAction.RESOLVE_DUPLICATE,
            ResolutionAction.MAP_CATEGORY,
            ResolutionAction.APPROVE_EXCEL_IMPORT,
            ResolutionAction.KEEP_AS_IS -> Unit
        }
    }

    private fun resolvePaymentId(
        pendingAction: PendingActionEntity,
        accountId: UUID,
    ): Long {
        val referenceId = pendingAction.referenceId
            ?: throw BadRequestException("Pending action does not reference a payment object")

        return when (pendingAction.referenceTable) {
            "payment" -> requirePayment(referenceId, accountId).paymentId
            "payment_adjustment" -> {
                val adjustment = paymentAdjustmentRepository.findById(referenceId)
                    .orElseThrow { NotFoundException("Payment adjustment not found") }
                requirePayment(adjustment.paymentId ?: throw NotFoundException("Payment not found"), accountId).paymentId
            }

            "payment_item" -> paymentRepository.findByPaymentItemIdAndAccountId(referenceId, accountId)?.paymentId
                ?: throw NotFoundException("Payment item payment not found")

            else -> throw BadRequestException("Unsupported reference table: ${pendingAction.referenceTable}")
        }
    }

    private fun resolveSuggestedAmount(pendingAction: PendingActionEntity): Long? {
        if (pendingAction.referenceTable != "payment_adjustment" || pendingAction.referenceId == null) {
            return null
        }

        return paymentAdjustmentRepository.findById(pendingAction.referenceId!!).orElse(null)?.adjustedKrwAmount
    }

    private fun applyFinalAmount(
        paymentId: Long,
        accountId: UUID,
        finalAmount: Long,
    ) {
        val updated = paymentRepository.updateFinalKrwAmount(paymentId, accountId, finalAmount)
        if (updated != 1) {
            throw NotFoundException("Payment not found")
        }
    }

    private fun requirePayment(
        paymentId: Long,
        accountId: UUID,
    ): PaymentProjection {
        return paymentRepository.findByPaymentIdAndAccountId(paymentId, accountId)
            ?: throw NotFoundException("Payment not found")
    }

    private fun requirePendingAction(
        pendingActionId: Long,
        accountId: UUID,
    ): PendingActionEntity {
        return pendingActionRepository.findByPendingActionIdAndAccountId(pendingActionId, accountId)
            ?: throw NotFoundException("Pending action not found")
    }

    private fun ensurePending(pendingAction: PendingActionEntity) {
        if (pendingAction.status != PendingActionStatus.PENDING.name) {
            throw BadRequestException("Pending action has already been processed")
        }
    }

    private fun validateAmounts(
        originalAmount: Long,
        adjustedAmount: Long,
    ) {
        if (originalAmount <= 0) {
            throw BadRequestException("originalKrwAmount must be greater than 0")
        }
        if (adjustedAmount <= 0) {
            throw BadRequestException("adjustedKrwAmount must be greater than 0")
        }
    }

    private fun toAdjustmentResponse(entity: PaymentAdjustmentEntity): AdjustmentResponse {
        val original = entity.originalKrwAmount ?: 0L
        val adjusted = entity.adjustedKrwAmount ?: 0L
        return AdjustmentResponse(
            adjustmentId = entity.adjustmentId ?: 0L,
            paymentId = entity.paymentId ?: 0L,
            adjustmentType = AdjustmentType.valueOf(entity.adjustmentType ?: AdjustmentType.OTHER.name),
            originalKrwAmount = original,
            adjustedKrwAmount = adjusted,
            differenceAmount = adjusted - original,
            reason = entity.reason,
            billedAt = entity.billedAt,
            createdAt = entity.createdAt ?: OffsetDateTime.now(clock),
        )
    }

    private fun toPaymentResponse(projection: PaymentProjection): com.cardwise.ledger.dto.PaymentResponse {
        return com.cardwise.ledger.dto.PaymentResponse(
            paymentId = projection.paymentId,
            userCardId = projection.userCardId,
            merchantName = projection.merchantNameRaw,
            krwAmount = projection.krwAmount,
            finalKrwAmount = projection.finalKrwAmount,
            paidAt = projection.paidAt,
            isAdjusted = projection.isAdjusted,
        )
    }
    private fun toPaymentResponse(entity: com.cardwise.ledger.entity.PaymentEntity): com.cardwise.ledger.dto.PaymentResponse {
        return com.cardwise.ledger.dto.PaymentResponse(
            paymentId = entity.paymentId ?: 0L,
            userCardId = entity.userCardId ?: 0L,
            merchantName = entity.merchantNameRaw ?: "",
            krwAmount = entity.krwAmount ?: 0L,
            finalKrwAmount = entity.finalKrwAmount ?: (entity.krwAmount ?: 0L),
            paidAt = entity.paidAt ?: OffsetDateTime.now(clock),
            isAdjusted = entity.isAdjusted,
        )
    }

    private fun toPendingActionResponse(projection: PendingActionProjection): PendingActionResponse {
        return PendingActionResponse(
            pendingActionId = projection.pendingActionId,
            actionType = PendingActionType.valueOf(projection.actionType),
            referenceTable = projection.referenceTable,
            referenceId = projection.referenceId,
            title = projection.title,
            description = projection.description,
            status = PendingActionStatus.valueOf(projection.status),
            priority = Priority.valueOf(projection.priority),
            createdAt = projection.createdAt,
            resolvedAt = projection.resolvedAt,
        )
    }

    private fun toPendingActionResponse(entity: PendingActionEntity): PendingActionResponse {
        return PendingActionResponse(
            pendingActionId = entity.pendingActionId ?: 0L,
            actionType = PendingActionType.valueOf(entity.actionType ?: PendingActionType.PAYMENT_CONFIRMATION.name),
            referenceTable = entity.referenceTable,
            referenceId = entity.referenceId,
            title = entity.title ?: "",
            description = entity.description,
            status = PendingActionStatus.valueOf(entity.status ?: PendingActionStatus.PENDING.name),
            priority = Priority.valueOf(entity.priority ?: Priority.MEDIUM.name),
            createdAt = entity.createdAt ?: OffsetDateTime.now(clock),
            resolvedAt = entity.resolvedAt,
        )
    }
}
