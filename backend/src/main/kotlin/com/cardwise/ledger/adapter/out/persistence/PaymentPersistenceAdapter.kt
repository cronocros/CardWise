package com.cardwise.ledger.adapter.out.persistence

import com.cardwise.ledger.application.port.out.PaymentPersistencePort
import com.cardwise.ledger.domain.model.*
import com.cardwise.ledger.adapter.out.persistence.entity.PaymentAdjustmentEntity
import com.cardwise.ledger.adapter.out.persistence.entity.PaymentEntity
import com.cardwise.ledger.adapter.out.persistence.entity.PendingActionEntity
import com.cardwise.ledger.adapter.out.persistence.repository.PaymentAdjustmentRepository
import com.cardwise.ledger.adapter.out.persistence.repository.PaymentRepository
import com.cardwise.ledger.adapter.out.persistence.repository.PendingActionRepository
import com.cardwise.ledger.adapter.out.persistence.repository.PaymentProjection
import com.cardwise.ledger.adapter.out.persistence.repository.PendingActionProjection
import org.springframework.stereotype.Component
import java.util.*
import java.time.ZoneId
import java.time.OffsetDateTime

@Component
class PaymentPersistenceAdapter(
    private val paymentRepository: PaymentRepository,
    private val paymentAdjustmentRepository: PaymentAdjustmentRepository,
    private val pendingActionRepository: PendingActionRepository
) : PaymentPersistencePort {

    override fun findById(paymentId: Long, accountId: UUID): Payment? {
        return paymentRepository.findEntityByPaymentIdAndAccountIdAndDeletedAtIsNull(paymentId, accountId)?.toDomain()
    }

    override fun findAllByAccountId(accountId: UUID, limit: Int): List<Payment> {
        return paymentRepository.findAllByAccountIdAndDeletedAtIsNull(accountId, limit)
            .map { it.toDomain() }
    }

    override fun save(payment: Payment): Payment {
        val entity = payment.toEntity()
        return paymentRepository.save(entity).toDomain()
    }

    override fun delete(paymentId: Long, accountId: UUID) {
        paymentRepository.softDelete(paymentId, accountId)
    }

    override fun findAdjustmentsByPaymentId(paymentId: Long, accountId: UUID): List<PaymentAdjustment> {
        return paymentAdjustmentRepository.findAllByPaymentIdOrderByCreatedAtDesc(paymentId)
            .map { it.toDomain() }
    }

    override fun saveAdjustment(adjustment: PaymentAdjustment): PaymentAdjustment {
        return paymentAdjustmentRepository.save(adjustment.toEntity()).toDomain()
    }

    override fun findPendingActions(accountId: UUID, limit: Int): List<PendingAction> {
        return pendingActionRepository.findByAccountIdWithFilters(accountId, null, null, limit)
            .map { it.toDomain() }
    }

    override fun findPendingActionById(actionId: Long, accountId: UUID): PendingAction? {
        return pendingActionRepository.findByPendingActionIdAndAccountId(actionId, accountId)?.toDomain()
    }

    override fun savePendingAction(action: PendingAction): PendingAction {
        return pendingActionRepository.save(action.toEntity()).toDomain()
    }

    override fun countPendingActions(accountId: UUID): Long {
        return pendingActionRepository.countByAccountIdAndStatus(accountId, null)
    }

    // Mappers
    private fun PaymentEntity.toDomain() = Payment(
        paymentId = paymentId,
        accountId = accountId!!,
        userCardId = userCardId!!,
        merchantNameRaw = merchantNameRaw!!,
        paidAt = paidAt!!,
        krwAmount = krwAmount!!,
        finalKrwAmount = finalKrwAmount,
        isAdjusted = isAdjusted,
        transactionType = TransactionType.valueOf(transactionType),
        deletedAt = deletedAt,
        updatedAt = updatedAt
    )

    private fun Payment.toEntity() = PaymentEntity().apply {
        paymentId = this@toEntity.paymentId
        accountId = this@toEntity.accountId
        userCardId = this@toEntity.userCardId
        merchantNameRaw = this@toEntity.merchantNameRaw
        paidAt = this@toEntity.paidAt
        krwAmount = this@toEntity.krwAmount
        finalKrwAmount = this@toEntity.finalKrwAmount
        isAdjusted = this@toEntity.isAdjusted
        transactionType = this@toEntity.transactionType.name
        deletedAt = this@toEntity.deletedAt
        updatedAt = this@toEntity.updatedAt
    }

    private fun PaymentAdjustmentEntity.toDomain() = PaymentAdjustment(
        adjustmentId = adjustmentId,
        paymentId = paymentId!!,
        accountId = UUID.randomUUID(), 
        adjustmentType = adjustmentType!!,
        originalKrwAmount = originalKrwAmount!!,
        adjustedKrwAmount = adjustedKrwAmount!!,
        differenceAmount = (adjustedKrwAmount ?: 0) - (originalKrwAmount ?: 0),
        reason = reason,
        billedAt = billedAt?.atStartOfDay(ZoneId.systemDefault())?.toOffsetDateTime(),
        createdAt = createdAt ?: OffsetDateTime.now()
    )

    private fun PaymentAdjustment.toEntity() = PaymentAdjustmentEntity().apply {
        adjustmentId = this@toEntity.adjustmentId
        paymentId = this@toEntity.paymentId
        adjustmentType = this@toEntity.adjustmentType
        originalKrwAmount = this@toEntity.originalKrwAmount
        adjustedKrwAmount = this@toEntity.adjustedKrwAmount
        reason = this@toEntity.reason
        billedAt = this@toEntity.billedAt?.toLocalDate()
        createdAt = this@toEntity.createdAt
    }

    private fun PendingActionEntity.toDomain() = PendingAction(
        pendingActionId = pendingActionId,
        accountId = accountId!!,
        actionType = actionType!!,
        referenceTable = referenceTable,
        referenceId = referenceId,
        title = title!!,
        description = description,
        status = com.cardwise.ledger.domain.model.PendingActionStatus.valueOf(status!!),
        priority = com.cardwise.ledger.domain.model.Priority.valueOf(priority!!),
        createdAt = createdAt ?: OffsetDateTime.now(),
        resolvedAt = resolvedAt
    )

    private fun PendingAction.toEntity() = PendingActionEntity().apply {
        pendingActionId = this@toEntity.pendingActionId
        accountId = this@toEntity.accountId
        actionType = this@toEntity.actionType
        referenceTable = this@toEntity.referenceTable
        referenceId = this@toEntity.referenceId
        title = this@toEntity.title
        description = this@toEntity.description
        status = this@toEntity.status.name
        priority = this@toEntity.priority.name
        createdAt = this@toEntity.createdAt
        resolvedAt = this@toEntity.resolvedAt
    }

    private fun PaymentProjection.toDomain() = Payment(
        paymentId = paymentId,
        accountId = accountId, 
        userCardId = userCardId,
        merchantNameRaw = merchantNameRaw,
        paidAt = paidAt,
        krwAmount = krwAmount,
        finalKrwAmount = finalKrwAmount,
        isAdjusted = isAdjusted,
        transactionType = TransactionType.valueOf(transactionType)
    )

    private fun PendingActionProjection.toDomain() = PendingAction(
        pendingActionId = pendingActionId,
        accountId = accountId,
        actionType = actionType,
        referenceTable = referenceTable,
        referenceId = referenceId,
        title = title,
        description = description,
        status = com.cardwise.ledger.domain.model.PendingActionStatus.valueOf(status),
        priority = com.cardwise.ledger.domain.model.Priority.valueOf(priority),
        createdAt = createdAt,
        resolvedAt = resolvedAt
    )
}
