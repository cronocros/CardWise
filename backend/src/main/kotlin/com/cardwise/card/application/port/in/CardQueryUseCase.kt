package com.cardwise.card.application.port.`in`

import com.cardwise.card.api.CardMetadataResponse
import com.cardwise.card.api.CardSummaryDto
import com.cardwise.card.api.UserCardDetailResponse
import com.cardwise.card.api.UserCardSummaryResponse
import java.util.UUID

interface CardQueryUseCase {
    fun getMetadata(): CardMetadataResponse
    fun getCards(issuerId: String?, brandId: String?, keyword: String?): List<CardSummaryDto>
    fun listMyCards(accountId: UUID): List<UserCardSummaryResponse>
    fun getMyCard(accountId: UUID, userCardId: Long): UserCardDetailResponse
}
