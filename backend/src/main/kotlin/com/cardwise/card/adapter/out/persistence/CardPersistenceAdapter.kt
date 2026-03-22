package com.cardwise.card.adapter.out.persistence

import com.cardwise.card.application.dto.*
import com.cardwise.card.application.port.out.CardPersistencePort
import com.cardwise.common.exception.NotFoundException
import com.cardwise.card.adapter.out.persistence.entity.*
import com.cardwise.card.adapter.out.persistence.repository.*
import com.cardwise.voucher.adapter.out.persistence.entity.UserVoucherEntity
import com.cardwise.voucher.adapter.out.persistence.repository.CardVoucherRepository
import com.cardwise.voucher.adapter.out.persistence.repository.UserVoucherRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Component
class CardPersistenceAdapter(
    private val cardRepository: CardRepository,
    private val userCardRepository: UserCardRepository,
    private val userVoucherRepository: UserVoucherRepository,
    private val cardVoucherRepository: CardVoucherRepository,
    private val issuerRepository: CardIssuerRepository,
    private val brandRepository: CardBrandRepository,
    private val objectMapper: ObjectMapper,
) : CardPersistencePort {

    fun findCard(cardId: Long): CardEntity =
        cardRepository.findByCardIdAndIsActiveTrue(cardId)
            ?: throw NotFoundException("카드를 찾을 수 없습니다. (cardId=$cardId)")

    override fun getCardMetadata(): CardMetadataResponse {
        val issuers = issuerRepository.findAllByIsActiveTrue().map { 
            CardIssuerResponse(it.issuerId, it.name, it.logoUrl) 
        }
        val brands = brandRepository.findAllByIsActiveTrue().map { 
            CardBrandResponse(it.brandId, it.name, it.logoUrl) 
        }
        return CardMetadataResponse(issuers, brands)
    }

    override fun listUserCards(accountId: UUID): List<UserCardResponse> {
        return userCardRepository.findAllByAccountIdAndIsActiveTrue(accountId)
            .map { toResponse(it) }
    }

    @Transactional
    override fun registerCard(accountId: UUID, cardId: Long, request: RegisterCardRequest): UserCardResponse {
        findCard(cardId)
        val userCard = UserCardEntity().apply {
            this.accountId = accountId
            this.cardId = cardId
            this.issuedAt = request.issuedAt
            this.cardNickname = request.nickname
            this.isActive = true
        }
        val saved = userCardRepository.save(userCard)
        initializeVouchers(saved)
        return toResponse(saved)
    }

    @Transactional
    override fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardResponse {
        val userCard = UserCardEntity().apply {
            this.accountId = accountId
            this.cardId = null
            this.cardNickname = request.cardNickname
            this.issuerId = request.issuerId
            this.brandId = request.brandId
            this.cardType = request.cardType
            this.cardNumberFirstFour = request.cardNumberFirstFour
            this.cardNumberLastFour = request.cardNumberLastFour
            this.expiryMonth = request.expiryMonth
            this.expiryYear = request.expiryYear
            this.monthlyTargetAmount = request.monthlyTargetAmount
            this.annualTargetAmount = request.annualTargetAmount
            this.isNotificationEnabled = request.isNotificationEnabled
            this.isMain = request.isMain
            this.isPinned = request.isPinned
            this.features = objectMapper.writeValueAsString(request.features)
            this.imageUrl = request.imageUrl
            this.issuedAt = LocalDate.now()
            this.isActive = true
        }
        val saved = userCardRepository.save(userCard)
        return toResponse(saved)
    }

    @Transactional
    override fun deactivateUserCard(accountId: UUID, userCardId: Long) {
        val userCard = userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: throw NotFoundException("등록된 카드를 찾을 수 없습니다.")
        userCard.isActive = false
        userCardRepository.save(userCard)
    }

    private fun initializeVouchers(userCard: UserCardEntity) {
        val cardId = userCard.cardId ?: return
        val cardVouchers = cardVoucherRepository.findAllByCardIdAndIsActiveTrue(cardId)
        if (cardVouchers.isNotEmpty()) {
            val now = LocalDate.now()
            val vouchers = cardVouchers.map { cv ->
                UserVoucherEntity().apply {
                    this.userCardId = userCard.userCardId
                    this.cardVoucherId = cv.cardVoucherId
                    this.remainingCount = cv.totalCount
                    this.totalCount = cv.totalCount
                    this.validFrom = cv.validFrom ?: now
                    this.validUntil = cv.validUntil
                }
            }
            userVoucherRepository.saveAll(vouchers)
        }
    }

    private fun toResponse(entity: UserCardEntity): UserCardResponse {
        val template = entity.cardId?.let { 
            try { findCard(it) } catch(e: Exception) { null }
        }
        
        return UserCardResponse(
            userCardId = entity.userCardId!!,
            cardId = entity.cardId,
            cardName = template?.cardName ?: entity.cardNickname ?: "알 수 없는 카드",
            cardNickname = entity.cardNickname,
            issuerName = entity.issuerId ?: template?.issuerId ?: "알 수 없음",
            brandName = entity.brandId ?: template?.brandId ?: "알 수 없음",
            imageUrl = entity.imageUrl ?: template?.imageUrl,
            monthlyTargetAmount = entity.monthlyTargetAmount,
            isMain = entity.isMain,
            isPinned = entity.isPinned,
            features = template?.cardRules?.let { mapOf("rules" to it) } 
        )
    }
}
