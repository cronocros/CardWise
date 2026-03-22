package com.cardwise.card.application.port.out

import com.cardwise.card.application.dto.*
import java.util.UUID

interface CardPersistencePort {
    fun getCardMetadata(): CardMetadataResponse
    fun listUserCards(accountId: UUID): List<UserCardResponse>
    fun registerCard(accountId: UUID, cardId: Long, request: RegisterCardRequest): UserCardResponse
    fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardResponse
    fun deactivateUserCard(accountId: UUID, userCardId: Long)
}
