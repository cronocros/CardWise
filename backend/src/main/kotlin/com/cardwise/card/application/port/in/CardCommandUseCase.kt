package com.cardwise.card.application.port.`in`

import com.cardwise.card.api.DeleteCardResponse
import com.cardwise.card.api.RegisterCardDetailedRequest
import com.cardwise.card.api.RegisterCardRequest
import com.cardwise.card.api.UpdateCardRequest
import com.cardwise.card.api.UserCardDetailResponse
import java.util.UUID

interface CardCommandUseCase {
    fun registerCard(accountId: UUID, request: RegisterCardRequest): UserCardDetailResponse
    fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardDetailResponse
    fun updateCard(accountId: UUID, userCardId: Long, request: UpdateCardRequest): UserCardDetailResponse
    fun deleteCard(accountId: UUID, userCardId: Long): DeleteCardResponse
}
