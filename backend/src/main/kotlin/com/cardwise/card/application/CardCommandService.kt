package com.cardwise.card.application

import com.cardwise.card.api.DeleteCardResponse
import com.cardwise.card.api.RegisterCardDetailedRequest
import com.cardwise.card.api.RegisterCardRequest
import com.cardwise.card.api.UpdateCardRequest
import com.cardwise.card.api.UserCardDetailResponse
import com.cardwise.card.application.port.`in`.CardCommandUseCase
import com.cardwise.card.application.port.out.CardPersistencePort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class CardCommandService(
    private val cardPersistencePort: CardPersistencePort,
    private val cardQueryService: CardQueryService,
) : CardCommandUseCase {

    override fun registerCard(accountId: UUID, request: RegisterCardRequest): UserCardDetailResponse {
        val saved = cardPersistencePort.registerCard(
            accountId = accountId,
            cardId = request.cardId,
            issuedAt = request.issuedAt,
            nickname = request.cardNickname?.trim()?.takeIf { it.isNotBlank() },
        )
        val card = cardPersistencePort.findCard(saved.cardId!!)
        return cardQueryService.toDetail(saved, card)
    }

    override fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardDetailResponse {
        val saved = cardPersistencePort.registerCardDetailed(accountId, request)
        return cardQueryService.toDetail(saved, null)
    }

    override fun updateCard(accountId: UUID, userCardId: Long, request: UpdateCardRequest): UserCardDetailResponse {
        val userCard = cardPersistencePort.findUserCard(userCardId, accountId)
        request.cardNickname?.let { userCard.cardNickname = it.trim().takeIf { n -> n.isNotBlank() } }
        request.issuedAt?.let { userCard.issuedAt = it }
        val saved = cardPersistencePort.updateUserCard(userCard)
        val card = saved.cardId?.let { cardPersistencePort.findCard(it) }
        return cardQueryService.toDetail(saved, card)
    }

    override fun deleteCard(accountId: UUID, userCardId: Long): DeleteCardResponse {
        val userCard = cardPersistencePort.findUserCard(userCardId, accountId)
        cardPersistencePort.deactivateUserCard(userCard)
        return DeleteCardResponse(
            userCardId = userCardId,
            message = "카드가 삭제되었습니다.",
        )
    }
}
