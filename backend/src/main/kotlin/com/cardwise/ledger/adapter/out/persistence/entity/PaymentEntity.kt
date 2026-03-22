package com.cardwise.ledger.adapter.out.persistence.entity

import java.time.OffsetDateTime
import java.util.UUID
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "payment")
open class PaymentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    var paymentId: Long? = null

    @Column(name = "account_id", nullable = false)
    var accountId: UUID? = null

    @Column(name = "user_card_id", nullable = false)
    var userCardId: Long? = null

    @Column(name = "merchant_name_raw", nullable = false)
    var merchantNameRaw: String? = null

    @Column(name = "paid_at", nullable = false)
    var paidAt: OffsetDateTime? = null

    @Column(name = "krw_amount", nullable = false)
    var krwAmount: Long? = null

    @Column(name = "final_krw_amount")
    var finalKrwAmount: Long? = null

    @Column(name = "is_adjusted", nullable = false)
    var isAdjusted: Boolean = false

    @Column(name = "transaction_type", nullable = false)
    var transactionType: String = "EXPENSE"

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null

    @Column(name = "updated_at")
    var updatedAt: OffsetDateTime? = null
}
