package com.cardwise.card.application

import com.cardwise.card.api.DeleteCardResponse
import com.cardwise.card.api.RegisterCardRequest
import com.cardwise.card.api.UpdateCardRequest
import com.cardwise.card.api.UserCardDetailResponse
import com.cardwise.card.api.UserCardSummaryResponse
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
    fun listMyCards(accountId: UUID): ApiResponse<List<UserCardSummaryResponse>> {
        val cards = cardRepository.listUserCards(accountId)
        return ApiResponse(data = cards.map { toSummary(it) })
    }

    fun getMyCard(accountId: UUID, userCardId: Long): ApiResponse<UserCardDetailResponse> {
        val userCard = cardRepository.findUserCard(userCardId, accountId)
        val card = cardRepository.findCard(userCard.cardId!!)
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
    fun updateCard(accountId: UUID, userCardId: Long, request: UpdateCardRequest): ApiResponse<UserCardDetailResponse> {
        val userCard = cardRepository.findUserCard(userCardId, accountId)

        request.cardNickname?.let { userCard.cardNickname = it.trim().takeIf { n -> n.isNotBlank() } }
        request.issuedAt?.let { userCard.issuedAt = it }

        val saved = cardRepository.updateUserCard(userCard)
        val card = cardRepository.findCard(saved.cardId!!)
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
            cardId = requireNotNull(userCard.cardId),
            cardName = try {
                cardRepository.findCard(userCard.cardId!!).cardName
            } catch (e: Exception) {
                "알 수 없는 카드"
            },
            cardNickname = userCard.cardNickname,
            issuedAt = userCard.issuedAt,
            isActive = userCard.isActive,
        )
    }

    private fun toDetail(userCard: UserCardEntity, card: CardEntity): UserCardDetailResponse {
        return UserCardDetailResponse(
            userCardId = requireNotNull(userCard.userCardId),
            cardId = requireNotNull(userCard.cardId),
            cardName = card.cardName,
            cardNickname = userCard.cardNickname,
            issuedAt = userCard.issuedAt,
        )
    }
}
