package com.cardwise.card.application.service

import com.cardwise.card.application.dto.*
import com.cardwise.card.application.port.`in`.CardCommandUseCase
import com.cardwise.card.application.port.out.CardPersistencePort
import com.cardwise.common.api.ApiResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class CardCommandService(
    private val cardPersistencePort: CardPersistencePort
) : CardCommandUseCase {

    override fun registerCard(accountId: UUID, request: RegisterCardRequest): ApiResponse<UserCardResponse> {
        return ApiResponse(data = cardPersistencePort.registerCard(accountId, request.cardId, request))
    }

    override fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): ApiResponse<UserCardResponse> {
        return ApiResponse(data = cardPersistencePort.registerCardDetailed(accountId, request))
    }

    override fun deactivateUserCard(accountId: UUID, userCardId: Long) {
        cardPersistencePort.deactivateUserCard(accountId, userCardId)
    }
}