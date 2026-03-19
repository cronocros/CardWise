package com.cardwise.voucher.infrastructure

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "user_voucher_log")
open class UserVoucherLogEntity(
    @Id
    @Column(name = "user_voucher_log_id")
    var userVoucherLogId: Long? = null,

    @Column(name = "user_voucher_id")
    var userVoucherId: Long? = null,

    @Column(name = "voucher_action")
    var voucherAction: String? = null,

    @Column(name = "memo")
    var memo: String? = null,

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = null,
)
