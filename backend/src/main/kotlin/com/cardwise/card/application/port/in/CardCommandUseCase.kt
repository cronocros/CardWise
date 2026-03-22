package com.cardwise.card.application.port.`in`

import com.cardwise.card.application.dto.*
import com.cardwise.common.api.ApiResponse
import java.util.UUID

interface CardCommandUseCase {
    fun registerCard(accountId: UUID, request: RegisterCardRequest): ApiResponse<UserCardResponse>
    fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): ApiResponse<UserCardResponse>
    fun deactivateUserCard(accountId: UUID, userCardId: Long)
}
