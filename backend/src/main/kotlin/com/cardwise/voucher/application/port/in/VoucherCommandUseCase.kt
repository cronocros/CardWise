package com.cardwise.voucher.application.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.voucher.api.VoucherActionRequest
import com.cardwise.voucher.api.VoucherSummaryResponse
import java.util.UUID

interface VoucherCommandUseCase {
    fun useVoucher(userVoucherId: Long, accountId: UUID, request: VoucherActionRequest): ApiResponse<VoucherSummaryResponse>
    fun unuseVoucher(userVoucherId: Long, accountId: UUID, request: VoucherActionRequest): ApiResponse<VoucherSummaryResponse>
}
