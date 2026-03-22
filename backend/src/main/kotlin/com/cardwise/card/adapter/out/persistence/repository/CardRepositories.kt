package com.cardwise.card.adapter.out.persistence.repository

import com.cardwise.card.adapter.out.persistence.entity.*
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface CardRepository : JpaRepository<CardEntity, Long> {
    fun findByCardIdAndIsActiveTrue(cardId: Long): CardEntity?
    fun findAllByCardIdInAndIsActiveTrue(cardIds: Collection<Long>): List<CardEntity>
    fun findAllByIssuerIdAndBrandIdAndIsActiveTrue(issuerId: String, brandId: String): List<CardEntity>
    fun findAllByCardNameContainingIgnoreCaseAndIsActiveTrue(keyword: String): List<CardEntity>
    fun findAllByIsActiveTrue(): List<CardEntity>
}

interface UserCardRepository : JpaRepository<UserCardEntity, Long> {
    fun findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId: Long, accountId: UUID): UserCardEntity?
    fun findAllByAccountIdAndIsActiveTrue(accountId: UUID): List<UserCardEntity>
}

interface CardIssuerRepository : JpaRepository<CardIssuerEntity, String> {
    fun findAllByIsActiveTrue(): List<CardIssuerEntity>
}

interface CardBrandRepository : JpaRepository<CardBrandEntity, String> {
    fun findAllByIsActiveTrue(): List<CardBrandEntity>
}

interface SpecialPerformancePeriodRepository : JpaRepository<SpecialPerformancePeriodEntity, Long> {
    fun findAllByCardIdAndIsActiveTrue(cardId: Long): List<SpecialPerformancePeriodEntity>
}
