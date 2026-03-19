package com.cardwise.ledger.entity

import java.time.LocalDate
import java.time.OffsetDateTime
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "payment_adjustment")
open class PaymentAdjustmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "adjustment_id")
    var adjustmentId: Long? = null

    @Column(name = "payment_id", nullable = false)
    var paymentId: Long? = null

    @Column(name = "adjustment_type", nullable = false)
    var adjustmentType: String? = null

    @Column(name = "original_krw_amount", nullable = false)
    var originalKrwAmount: Long? = null

    @Column(name = "adjusted_krw_amount", nullable = false)
    var adjustedKrwAmount: Long? = null

    @Column(name = "reason")
    var reason: String? = null

    @Column(name = "billed_at")
    var billedAt: LocalDate? = null

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = null
}
