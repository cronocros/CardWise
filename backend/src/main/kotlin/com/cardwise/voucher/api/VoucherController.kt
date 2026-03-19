package com.cardwise.voucher.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.voucher.application.VoucherService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class VoucherController(
    private val voucherService: VoucherService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/user-cards/{userCardId}/vouchers")
    fun listUserCardVouchers(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<VoucherSummaryResponse>> {
        return voucherService.listUserCardVouchers(
            userCardId = userCardId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
        )
    }

    @GetMapping("/vouchers")
    fun listVouchers(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false) status: String?,
    ): ApiResponse<List<VoucherSummaryResponse>> {
        return voucherService.listVouchers(
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            status = status,
        )
    }

    @GetMapping("/vouchers/expiring")
    fun listExpiringVouchers(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(defaultValue = "7") days: Int,
    ): ApiResponse<List<VoucherSummaryResponse>> {
        return voucherService.listExpiringVouchers(
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            days = days,
        )
    }

    @PatchMapping("/user-vouchers/{userVoucherId}/use")
    fun useVoucher(
        @PathVariable userVoucherId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody(required = false) request: VoucherActionRequest?,
    ): ApiResponse<VoucherSummaryResponse> {
        return voucherService.useVoucher(
            userVoucherId = userVoucherId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            request = request ?: VoucherActionRequest(),
        )
    }

    @PatchMapping("/user-vouchers/{userVoucherId}/unuse")
    fun unuseVoucher(
        @PathVariable userVoucherId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody(required = false) request: VoucherActionRequest?,
    ): ApiResponse<VoucherSummaryResponse> {
        return voucherService.unuseVoucher(
            userVoucherId = userVoucherId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
            request = request ?: VoucherActionRequest(),
        )
    }

    @GetMapping("/user-vouchers/{userVoucherId}/history")
    fun listVoucherHistory(
        @PathVariable userVoucherId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<VoucherHistoryResponse>> {
        return voucherService.listVoucherHistory(
            userVoucherId = userVoucherId,
            accountId = requestAccountIdResolver.resolve(accountIdHeader),
        )
    }
}
