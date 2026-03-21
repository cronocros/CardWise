package com.cardwise.card.application

import com.cardwise.card.api.CardMetadataResponse
import com.cardwise.card.api.CardSummaryDto
import com.cardwise.card.api.IssuerDto
import com.cardwise.card.api.BrandDto
import com.cardwise.card.api.UserCardDetailResponse
import com.cardwise.card.api.UserCardSummaryResponse
import com.cardwise.card.application.port.`in`.CardQueryUseCase
import com.cardwise.card.application.port.out.CardPersistencePort
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.UserCardEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CardQueryService(
    private val cardPersistencePort: CardPersistencePort,
) : CardQueryUseCase {

    private val objectMapper = com.fasterxml.jackson.module.kotlin.jacksonObjectMapper()

    override fun getMetadata(): CardMetadataResponse {
        val issuers = cardPersistencePort.getIssuers().map { IssuerDto(it.issuerId, it.name, it.logoUrl) }
        val brands = cardPersistencePort.getBrands().map { BrandDto(it.brandId, it.name, it.logoUrl) }
        return CardMetadataResponse(issuers = issuers, brands = brands)
    }

    override fun getCards(issuerId: String?, brandId: String?, keyword: String?): List<CardSummaryDto> {
        val cards = when {
            keyword != null && keyword.isNotBlank() -> cardPersistencePort.searchCardsByKeyword(keyword)
            issuerId != null && brandId != null -> cardPersistencePort.searchCardsByIssuerAndBrand(issuerId, brandId)
            else -> cardPersistencePort.getAllCards()
        }
        return cards.map { toCardSummaryDto(it) }
    }

    override fun listMyCards(accountId: UUID): List<UserCardSummaryResponse> {
        val cards = cardPersistencePort.listUserCards(accountId)
        return cards.map { toSummary(it) }
    }

    override fun getMyCard(accountId: UUID, userCardId: Long): UserCardDetailResponse {
        val userCard = cardPersistencePort.findUserCard(userCardId, accountId)
        val card = userCard.cardId?.let { cardPersistencePort.findCard(it) }
        return toDetail(userCard, card)
    }

    private fun toCardSummaryDto(it: CardEntity) = CardSummaryDto(
        cardId = it.cardId!!,
        cardName = it.cardName,
        issuerId = it.issuerId ?: "",
        brandId = it.brandId ?: "",
        cardType = it.cardType.name,
        features = try {
            if (it.features != null) objectMapper.readValue(it.features!!, Array<String>::class.java).toList()
            else emptyList()
        } catch (e: Exception) { emptyList() },
        imageUrl = it.imageUrl
    )

    private fun toSummary(userCard: UserCardEntity): UserCardSummaryResponse {
        return UserCardSummaryResponse(
            userCardId = requireNotNull(userCard.userCardId),
            cardId = userCard.cardId,
            cardName = try {
                userCard.cardId?.let { cardPersistencePort.findCard(it).cardName } ?: userCard.cardNickname ?: "커스텀 카드"
            } catch (e: Exception) { "알 수 없는 카드" },
            cardNickname = userCard.cardNickname,
            issuedAt = userCard.issuedAt,
            isActive = userCard.isActive,
            imageUrl = userCard.imageUrl
        )
    }

    fun toDetail(userCard: UserCardEntity, card: CardEntity?): UserCardDetailResponse {
        return UserCardDetailResponse(
            userCardId = requireNotNull(userCard.userCardId),
            cardId = userCard.cardId,
            cardName = card?.cardName ?: userCard.cardNickname ?: "커스텀 카드",
            cardNickname = userCard.cardNickname,
            issuedAt = userCard.issuedAt,
            expiryMonth = userCard.expiryMonth,
            expiryYear = userCard.expiryYear
        )
    }
}
