package com.cardwise.voucher.infrastructure

import org.springframework.data.jpa.repository.JpaRepository

interface UserVoucherLogRepository : JpaRepository<UserVoucherLogEntity, Long> {
    fun findAllByUserVoucherIdOrderByCreatedAtDesc(userVoucherId: Long): List<UserVoucherLogEntity>
}
