package com.cardwise.ledger.application.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.ledger.application.dto.*
import java.util.UUID

interface PaymentUseCase {
    fun getPayments(accountId: UUID, limit: Int): ApiResponse<List<PaymentResponse>>
    fun createPayment(accountId: UUID, request: CreatePaymentRequest): ApiResponse<PaymentResponse>
    fun updatePayment(paymentId: Long, accountId: UUID, request: UpdatePaymentRequest): ApiResponse<PaymentResponse>
    fun deletePayment(paymentId: Long, accountId: UUID): ApiResponse<Unit>
    fun listPaymentAdjustments(paymentId: Long, accountId: UUID): ApiResponse<List<AdjustmentResponse>>
    fun createPaymentAdjustment(paymentId: Long, accountId: UUID, request: CreatePaymentAdjustmentRequest): ApiResponse<AdjustmentResponse>
}
