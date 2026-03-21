package com.cardwise.ledger.adapter.`in`.web

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.api.CountResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.ledger.application.port.`in`.PaymentUseCase
import com.cardwise.ledger.application.port.`in`.PendingActionUseCase
import com.cardwise.ledger.dto.*
import com.cardwise.performance.application.PerformanceService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
class LedgerAdapterInWeb(
    private val paymentUseCase: PaymentUseCase,
    private val pendingActionUseCase: PendingActionUseCase,
    private val performanceService: PerformanceService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/payments/{paymentId}/adjustments")
    fun listPaymentAdjustments(
        @PathVariable paymentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<AdjustmentResponse>> {
        return paymentUseCase.listPaymentAdjustments(paymentId, requestAccountIdResolver.resolve(accountIdHeader))
    }

    @GetMapping("/payments")
    fun listPayments(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(defaultValue = "100") limit: Int,
    ): ApiResponse<List<PaymentResponse>> {
        return paymentUseCase.getPayments(
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            limit = limit
        )
    }

    @DeleteMapping("/payments/{paymentId}")
    fun deletePayment(
        @PathVariable paymentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<Unit> {
        return paymentUseCase.deletePayment(
            paymentId = paymentId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader)
        )
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    fun createPayment(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreatePaymentRequest,
    ): ApiResponse<PaymentResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        val oldTier = try {
            performanceService.getPerformance(request.userCardId, accountId).data.annual.currentTier?.tierName
        } catch (e: Exception) { null }

        val res = paymentUseCase.createPayment(accountId, request)

        val newTier = try {
            performanceService.getPerformance(request.userCardId, accountId).data.annual.currentTier?.tierName
        } catch (e: Exception) { null }

        val changed = oldTier != newTier && newTier != null
        val finalData = if (changed) res.data.copy(tierChanged = true, newTierName = newTier) else res.data

        return ApiResponse(data = finalData)
    }

    @PatchMapping("/payments/{paymentId}")
    fun updatePayment(
        @PathVariable paymentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: UpdatePaymentRequest,
    ): ApiResponse<PaymentResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        val oldTier = try {
            performanceService.getPerformance(request.userCardId, accountId).data.annual.currentTier?.tierName
        } catch (e: Exception) { null }

        val res = paymentUseCase.updatePayment(paymentId, accountId, request)

        val newTier = try {
            performanceService.getPerformance(request.userCardId, accountId).data.manual.currentTier?.tierName
        } catch (e: Exception) { null }

        val changed = oldTier != newTier && newTier != null
        val finalData = if (changed) res.data.copy(tierChanged = true, newTierName = newTier) else res.data

        return ApiResponse(data = finalData)
    }

    @PostMapping("/payments/{paymentId}/adjustments")
    fun createPaymentAdjustment(
        @PathVariable paymentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreatePaymentAdjustmentRequest,
    ): ApiResponse<AdjustmentResponse> {
        return paymentUseCase.createPaymentAdjustment(
            paymentId = paymentId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            request = request,
        )
    }

    @GetMapping("/pending-actions")
    fun listPendingActions(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false) status: PendingActionStatus?,
        @RequestParam(required = false) priority: Priority?,
        @RequestParam(defaultValue = "100") limit: Int,
    ): ApiResponse<List<PendingActionResponse>> {
        return pendingActionUseCase.listPendingActions(
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            status = status,
            priority = priority,
            limit = limit,
        )
    }

    @GetMapping("/pending-actions/count")
    fun countPendingActions(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false) status: PendingActionStatus?,
    ): ApiResponse<CountResponse> {
        return pendingActionUseCase.countPendingActions(
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            status = status,
        )
    }

    @PatchMapping("/pending-actions/{actionId}/resolve")
    fun resolvePendingAction(
        @PathVariable actionId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: ResolvePendingActionRequest,
    ): ApiResponse<PendingActionResponse> {
        return pendingActionUseCase.resolvePendingAction(
            pendingActionId = actionId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            request = request,
        )
    }

    @PatchMapping("/pending-actions/{actionId}/dismiss")
    fun dismissPendingAction(
        @PathVariable actionId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<PendingActionResponse> {
        return pendingActionUseCase.dismissPendingAction(
            pendingActionId = actionId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
        )
    }
}
