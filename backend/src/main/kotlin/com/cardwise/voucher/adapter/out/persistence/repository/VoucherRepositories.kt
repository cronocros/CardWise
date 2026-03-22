package com.cardwise.voucher.adapter.out.persistence.repository

import com.cardwise.voucher.adapter.out.persistence.entity.*
import org.springframework.data.jpa.repository.JpaRepository

interface CardVoucherRepository : JpaRepository<CardVoucherEntity, Long> {
    fun findAllByCardIdAndIsActiveTrue(cardId: Long): List<CardVoucherEntity>
    fun findAllByCardIdInAndIsActiveTrue(cardIds: Collection<Long>): List<CardVoucherEntity>
}

interface UserVoucherRepository : JpaRepository<UserVoucherEntity, Long> {
    fun findAllByUserCardId(userCardId: Long): List<UserVoucherEntity>
    fun findAllByUserCardIdIn(userCardIds: Collection<Long>): List<UserVoucherEntity>
}
