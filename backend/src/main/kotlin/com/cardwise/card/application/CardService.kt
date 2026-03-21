package com.cardwise.card.application

import com.cardwise.card.api.*
import com.cardwise.card.infrastructure.CardManagementRepository
import com.cardwise.common.api.ApiResponse
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.UserCardEntity
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CardService(
    private val cardRepository: CardManagementRepository,
) {
    fun getMetadata(): ApiResponse<CardMetadataResponse> {
        val issuers = cardRepository.getIssuers().map { IssuerDto(it.issuerId, it.name, it.logoUrl) }
        val brands = cardRepository.getBrands().map { BrandDto(it.brandId, it.name, it.logoUrl) }
        return ApiResponse(data = CardMetadataResponse(issuers = issuers, brands = brands))
    }

    private val objectMapper = com.fasterxml.jackson.module.kotlin.jacksonObjectMapper()

    fun getCards(issuerId: String?, brandId: String?, keyword: String?): ApiResponse<List<CardSummaryDto>> {
        val cards = when {
            keyword != null && keyword.isNotBlank() -> cardRepository.searchCardsByKeyword(keyword)
            issuerId != null && brandId != null -> cardRepository.searchCardsByIssuerAndBrand(issuerId, brandId)
            else -> cardRepository.getAllCards()
        }

        return ApiResponse(data = cards.map { 
            CardSummaryDto(
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
        })
    }

    fun listMyCards(accountId: UUID): ApiResponse<List<UserCardSummaryResponse>> {
        val cards = cardRepository.listUserCards(accountId)
        return ApiResponse(data = cards.map { toSummary(it) })
    }

    fun getMyCard(accountId: UUID, userCardId: Long): ApiResponse<UserCardDetailResponse> {
        val userCard = cardRepository.findUserCard(userCardId, accountId)
        val card = userCard.cardId?.let { cardRepository.findCard(it) }
        return ApiResponse(data = toDetail(userCard, card))
    }

    @Transactional
    fun registerCard(accountId: UUID, request: RegisterCardRequest): ApiResponse<UserCardDetailResponse> {
        val saved = cardRepository.registerCard(
            accountId = accountId,
            cardId = request.cardId,
            issuedAt = request.issuedAt,
            nickname = request.cardNickname?.trim()?.takeIf { it.isNotBlank() },
        )
        val card = cardRepository.findCard(saved.cardId!!)
        return ApiResponse(data = toDetail(saved, card))
    }

    @Transactional
    fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): ApiResponse<UserCardDetailResponse> {
        val saved = cardRepository.registerCardDetailed(accountId, request)
        return ApiResponse(data = toDetail(saved, null))
    }

    @Transactional
    fun updateCard(accountId: UUID, userCardId: Long, request: UpdateCardRequest): ApiResponse<UserCardDetailResponse> {
        val userCard = cardRepository.findUserCard(userCardId, accountId)

        request.cardNickname?.let { userCard.cardNickname = it.trim().takeIf { n -> n.isNotBlank() } }
        request.issuedAt?.let { userCard.issuedAt = it }

        val saved = cardRepository.updateUserCard(userCard)
        val card = saved.cardId?.let { cardRepository.findCard(it) }
        return ApiResponse(data = toDetail(saved, card))
    }

    @Transactional
    fun deleteCard(accountId: UUID, userCardId: Long): ApiResponse<DeleteCardResponse> {
        val userCard = cardRepository.findUserCard(userCardId, accountId)
        cardRepository.deactivateUserCard(userCard)
        return ApiResponse(
            data = DeleteCardResponse(
                userCardId = userCardId,
                message = "카드가 삭제되었습니다.",
            ),
        )
    }

    private fun toSummary(userCard: UserCardEntity): UserCardSummaryResponse {
        return UserCardSummaryResponse(
            userCardId = requireNotNull(userCard.userCardId),
            cardId = userCard.cardId,
            cardName = try {
                userCard.cardId?.let { cardRepository.findCard(it).cardName } ?: userCard.cardNickname ?: "커스텀 카드"
            } catch (e: Exception) {
                "알 수 없는 카드"
            },
            cardNickname = userCard.cardNickname,
            issuedAt = userCard.issuedAt,
            isActive = userCard.isActive,
            imageUrl = userCard.imageUrl
        )
    }

    private fun toDetail(userCard: UserCardEntity, card: CardEntity?): UserCardDetailResponse {
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
