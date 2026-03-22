package com.cardwise.ledger.application.port.out

import com.cardwise.ledger.domain.model.Payment
import com.cardwise.ledger.domain.model.PaymentAdjustment
import com.cardwise.ledger.domain.model.PendingAction
import java.util.UUID

interface PaymentPersistencePort {
    fun findById(paymentId: Long, accountId: UUID): Payment?
    fun findAllByAccountId(accountId: UUID, limit: Int): List<Payment>
    fun save(payment: Payment): Payment
    fun delete(paymentId: Long, accountId: UUID)
    
    fun findAdjustmentsByPaymentId(paymentId: Long, accountId: UUID): List<PaymentAdjustment>
    fun saveAdjustment(adjustment: PaymentAdjustment): PaymentAdjustment

    fun findPendingActions(accountId: UUID, limit: Int): List<PendingAction>
    fun findPendingActionById(actionId: Long, accountId: UUID): PendingAction?
    fun savePendingAction(action: PendingAction): PendingAction
    fun countPendingActions(accountId: UUID): Long
}
