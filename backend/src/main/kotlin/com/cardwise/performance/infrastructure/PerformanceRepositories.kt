package com.cardwise.performance.infrastructure

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CardRepository : JpaRepository<CardEntity, Long> {
    fun findByCardIdAndIsActiveTrue(cardId: Long): CardEntity?
}

interface UserCardRepository : JpaRepository<UserCardEntity, Long> {
    fun findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId: Long, accountId: UUID): UserCardEntity?
}

interface UserPerformanceRepository : JpaRepository<UserPerformanceEntity, Long> {
    fun findByUserCardIdAndYearMonth(userCardId: Long, yearMonth: String): UserPerformanceEntity?

    fun findAllByUserCardIdAndYearMonthBetweenOrderByYearMonthAsc(
        userCardId: Long,
        startYearMonth: String,
        endYearMonth: String
    ): List<UserPerformanceEntity>
}

interface PerformanceTierRepository : JpaRepository<PerformanceTierEntity, Long> {
    fun findAllByCardIdOrderBySortOrderAsc(cardId: Long): List<PerformanceTierEntity>
}

interface CardBenefitRepository : JpaRepository<CardBenefitEntity, Long> {
    fun findAllByCardId(cardId: Long): List<CardBenefitEntity>
}

interface SpecialPerformancePeriodRepository : JpaRepository<SpecialPerformancePeriodEntity, Long> {
    fun findAllByCardIdAndIsActiveTrue(cardId: Long): List<SpecialPerformancePeriodEntity>
}

interface CardVoucherRepository : JpaRepository<CardVoucherEntity, Long> {
    fun findAllByCardIdAndIsActiveTrue(cardId: Long): List<CardVoucherEntity>
}

interface UserVoucherRepository : JpaRepository<UserVoucherEntity, Long> {
    fun findAllByUserCardId(userCardId: Long): List<UserVoucherEntity>
}
