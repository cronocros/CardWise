package com.cardwise.card.application.port.`in`

import com.cardwise.card.application.dto.*
import com.cardwise.common.api.ApiResponse
import java.util.UUID

interface CardQueryUseCase {
    fun getCardMetadata(): ApiResponse<CardMetadataResponse>
    fun listUserCards(accountId: UUID): ApiResponse<List<UserCardResponse>>
}
