package com.cardwise.ledger.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.api.CountResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.ledger.application.LedgerService
import com.cardwise.ledger.dto.AdjustmentResponse
import com.cardwise.ledger.dto.CreatePaymentAdjustmentRequest
import com.cardwise.ledger.dto.PendingActionResponse
import com.cardwise.ledger.dto.PendingActionStatus
import com.cardwise.ledger.dto.Priority
import com.cardwise.ledger.dto.ResolvePendingActionRequest
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class LedgerController(
    private val ledgerService: LedgerService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/payments/{paymentId}/adjustments")
    fun listPaymentAdjustments(
        @PathVariable paymentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<AdjustmentResponse>> {
        return ledgerService.listPaymentAdjustments(paymentId, requestAccountIdResolver.resolve(accountIdHeader))
    }

    @PostMapping("/payments/{paymentId}/adjustments")
    fun createPaymentAdjustment(
        @PathVariable paymentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreatePaymentAdjustmentRequest,
    ): ApiResponse<AdjustmentResponse> {
        return ledgerService.createPaymentAdjustment(
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
        @RequestParam(defaultValue = "20") limit: Int,
    ): ApiResponse<List<PendingActionResponse>> {
        return ledgerService.listPendingActions(
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
        return ledgerService.countPendingActions(
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
        return ledgerService.resolvePendingAction(
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
        return ledgerService.dismissPendingAction(
            pendingActionId = actionId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
        )
    }
}
