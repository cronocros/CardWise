package com.cardwise.performance.infrastructure

import org.springframework.data.jpa.repository.JpaRepository

interface UserPerformanceRepository : JpaRepository<UserPerformanceEntity, Long> {
    fun findByUserCardIdAndYearMonth(userCardId: Long, yearMonth: String): UserPerformanceEntity?
    fun findTopByUserCardIdOrderByYearMonthDesc(userCardId: Long): UserPerformanceEntity?
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
