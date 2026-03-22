package com.cardwise.card.application.service

import com.cardwise.card.application.dto.*
import com.cardwise.card.application.port.`in`.CardQueryUseCase
import com.cardwise.card.application.port.out.CardPersistencePort
import com.cardwise.common.api.ApiResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CardQueryService(
    private val cardPersistencePort: CardPersistencePort
) : CardQueryUseCase {

    override fun getCardMetadata(): ApiResponse<CardMetadataResponse> {
        return ApiResponse(data = cardPersistencePort.getCardMetadata())
    }

    override fun listUserCards(accountId: UUID): ApiResponse<List<UserCardResponse>> {
        return ApiResponse(data = cardPersistencePort.listUserCards(accountId))
    }
}
