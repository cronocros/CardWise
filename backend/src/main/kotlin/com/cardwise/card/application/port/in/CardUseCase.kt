package com.cardwise.card.application.service.port.`in`

import java.util.UUID

interface CardUseCase {
    fun getCards(accountId: UUID): Any
    fun registerCard(accountId: UUID, request: Any): Any
    fun getCardDetail(accountId: UUID, cardId: String): Any
    fun deleteCard(accountId: UUID, cardId: String): Any
    fun updateCardInfo(accountId: UUID, cardId: String, request: Any): Any
    fun getCardBenefits(accountId: UUID, cardId: String): Any
    fun getCardTiers(accountId: UUID, cardId: String): Any
    fun getCardPerformance(accountId: UUID, cardId: String): Any
}
