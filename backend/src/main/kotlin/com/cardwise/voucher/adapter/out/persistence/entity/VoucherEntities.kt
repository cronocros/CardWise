package com.cardwise.voucher.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(name = "card_voucher")
open class CardVoucherEntity(
    @Id
    @Column(name = "card_voucher_id")
    var cardVoucherId: Long? = null,

    @Column(name = "card_id")
    var cardId: Long? = null,

    @Column(name = "voucher_name")
    var voucherName: String = "",

    @Column(name = "voucher_type")
    var voucherType: String? = null,

    @Column(name = "period_type")
    var periodType: String? = null,

    @Column(name = "total_count")
    var totalCount: Int? = null,

    @Column(name = "description")
    var description: String? = null,

    @Column(name = "valid_from")
    var validFrom: LocalDate? = null,

    @Column(name = "valid_until")
    var validUntil: LocalDate? = null,

    @Column(name = "unlock_conditions", columnDefinition = "jsonb")
    var unlockConditions: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true,
)

@Entity
@Table(name = "user_voucher")
open class UserVoucherEntity(
    @Id
    @Column(name = "user_voucher_id")
    var userVoucherId: Long? = null,

    @Column(name = "user_card_id")
    var userCardId: Long? = null,

    @Column(name = "card_voucher_id")
    var cardVoucherId: Long? = null,

    @Column(name = "remaining_count")
    var remainingCount: Int? = null,

    @Column(name = "total_count")
    var totalCount: Int? = null,

    @Column(name = "valid_from")
    var validFrom: LocalDate? = null,

    @Column(name = "valid_until")
    var validUntil: LocalDate? = null,

    @Column(name = "updated_at")
    var updatedAt: OffsetDateTime? = null,
)
