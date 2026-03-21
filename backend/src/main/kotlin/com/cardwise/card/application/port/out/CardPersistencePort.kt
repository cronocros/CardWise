package com.cardwise.card.application.port.out

import com.cardwise.card.api.RegisterCardDetailedRequest
import com.cardwise.performance.infrastructure.CardBrandEntity
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.CardIssuerEntity
import com.cardwise.performance.infrastructure.UserCardEntity
import java.time.LocalDate
import java.util.UUID

interface CardPersistencePort {
    fun findCard(cardId: Long): CardEntity
    fun getAllCards(): List<CardEntity>
    fun searchCardsByIssuerAndBrand(issuerId: String, brandId: String): List<CardEntity>
    fun searchCardsByKeyword(keyword: String): List<CardEntity>
    fun getIssuers(): List<CardIssuerEntity>
    fun getBrands(): List<CardBrandEntity>

    fun listUserCards(accountId: UUID): List<UserCardEntity>
    fun findUserCard(userCardId: Long, accountId: UUID): UserCardEntity

    fun registerCard(accountId: UUID, cardId: Long, issuedAt: LocalDate, nickname: String?): UserCardEntity
    fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardEntity
    fun updateUserCard(userCard: UserCardEntity): UserCardEntity
    fun deactivateUserCard(userCard: UserCardEntity): UserCardEntity
}
