package com.cardwise.card.infrastructure

import com.cardwise.card.api.RegisterCardDetailedRequest
import com.cardwise.card.application.port.out.CardPersistencePort
import com.cardwise.common.exception.NotFoundException
import com.cardwise.performance.infrastructure.CardBrandEntity
import com.cardwise.performance.infrastructure.CardBrandRepository
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.CardIssuerEntity
import com.cardwise.performance.infrastructure.CardIssuerRepository
import com.cardwise.performance.infrastructure.CardRepository
import com.cardwise.performance.infrastructure.CardVoucherRepository
import com.cardwise.performance.infrastructure.UserCardEntity
import com.cardwise.performance.infrastructure.UserCardRepository
import com.cardwise.performance.infrastructure.UserVoucherEntity
import com.cardwise.performance.infrastructure.UserVoucherRepository
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

    override fun findCard(cardId: Long): CardEntity =
        cardRepository.findByCardIdAndIsActiveTrue(cardId)
            ?: throw NotFoundException("카드를 찾을 수 없습니다. (cardId=$cardId)")

    override fun getAllCards(): List<CardEntity> = cardRepository.findAllByIsActiveTrue()

    override fun searchCardsByIssuerAndBrand(issuerId: String, brandId: String): List<CardEntity> =
        cardRepository.findAllByIssuerIdAndBrandIdAndIsActiveTrue(issuerId, brandId)

    override fun searchCardsByKeyword(keyword: String): List<CardEntity> =
        cardRepository.findAllByCardNameContainingIgnoreCaseAndIsActiveTrue(keyword)

    override fun getIssuers(): List<CardIssuerEntity> = issuerRepository.findAllByIsActiveTrue()
    override fun getBrands(): List<CardBrandEntity> = brandRepository.findAllByIsActiveTrue()

    override fun listUserCards(accountId: UUID): List<UserCardEntity> =
        userCardRepository.findAllByAccountIdAndIsActiveTrue(accountId)

    override fun findUserCard(userCardId: Long, accountId: UUID): UserCardEntity =
        userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: throw NotFoundException("등록된 카드를 찾을 수 없습니다.")

    @Transactional
    override fun registerCard(accountId: UUID, cardId: Long, issuedAt: LocalDate, nickname: String?): UserCardEntity {
        findCard(cardId)
        val userCard = UserCardEntity().apply {
            this.accountId = accountId
            this.cardId = cardId
            this.issuedAt = issuedAt
            this.cardNickname = nickname
            this.isActive = true
        }
        val saved = userCardRepository.save(userCard)
        initializeVouchers(saved)
        return saved
    }

    @Transactional
    override fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardEntity {
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
        return userCardRepository.save(userCard)
    }

    @Transactional
    override fun updateUserCard(userCard: UserCardEntity): UserCardEntity =
        userCardRepository.save(userCard)

    @Transactional
    override fun deactivateUserCard(userCard: UserCardEntity): UserCardEntity {
        userCard.isActive = false
        return userCardRepository.save(userCard)
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
}
