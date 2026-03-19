package com.cardwise.ledger.repository

import com.cardwise.ledger.entity.PaymentAdjustmentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface PaymentAdjustmentRepository : JpaRepository<PaymentAdjustmentEntity, Long> {
    fun findAllByPaymentIdOrderByCreatedAtDesc(paymentId: Long): List<PaymentAdjustmentEntity>

    fun findByAdjustmentIdAndPaymentId(adjustmentId: Long, paymentId: Long): PaymentAdjustmentEntity?
}
