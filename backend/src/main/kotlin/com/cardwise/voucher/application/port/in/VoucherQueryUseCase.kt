package com.cardwise.voucher.application.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.voucher.api.VoucherHistoryResponse
import com.cardwise.voucher.api.VoucherSummaryResponse
import java.util.UUID

interface VoucherQueryUseCase {
    fun listUserCardVouchers(userCardId: Long, accountId: UUID): ApiResponse<List<VoucherSummaryResponse>>
    fun listVouchers(accountId: UUID, status: String?): ApiResponse<List<VoucherSummaryResponse>>
    fun listExpiringVouchers(accountId: UUID, days: Int): ApiResponse<List<VoucherSummaryResponse>>
    fun listVoucherHistory(userVoucherId: Long, accountId: UUID): ApiResponse<List<VoucherHistoryResponse>>
}
