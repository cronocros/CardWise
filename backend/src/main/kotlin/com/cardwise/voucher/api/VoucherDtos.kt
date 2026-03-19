package com.cardwise.voucher.api

import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.time.OffsetDateTime

data class VoucherSummaryResponse(
    val userVoucherId: Long,
    val cardVoucherId: Long,
    val userCardId: Long,
    val cardId: Long,
    val cardName: String,
    val cardNickname: String?,
    val cardLabel: String,
    val voucherName: String,
    val voucherType: String?,
    val periodType: String?,
    val status: String,
    val unlockType: String,
    val unlockState: String,
    val remainingCount: Int?,
    val totalCount: Int?,
    val validFrom: LocalDate?,
    val validUntil: LocalDate?,
    val daysUntilExpiry: Long?,
    val description: String?,
    val requiredAnnualPerformance: Long?,
    val currentAnnualPerformance: Long,
    val remainingAmount: Long?,
    val availableAt: LocalDate?,
    val notes: String?,
    val canUse: Boolean,
)

data class VoucherHistoryResponse(
    val voucherHistoryId: Long,
    val action: String,
    val memo: String?,
    val createdAt: OffsetDateTime,
)

data class VoucherActionRequest(
    @field:Size(max = 500)
    val memo: String? = null,
)
