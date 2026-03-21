package com.cardwise.card.infrastructure

import com.cardwise.performance.infrastructure.*
import com.cardwise.common.exception.NotFoundException
import com.cardwise.card.api.RegisterCardDetailedRequest
import java.time.LocalDate
import java.util.UUID
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import com.fasterxml.jackson.databind.ObjectMapper

@Repository
class CardManagementRepository(
    private val cardRepository: CardRepository,
    private val userCardRepository: UserCardRepository,
    private val userVoucherRepository: UserVoucherRepository,
    private val cardVoucherRepository: CardVoucherRepository,
    private val issuerRepository: CardIssuerRepository,
    private val brandRepository: CardBrandRepository,
    private val objectMapper: ObjectMapper,
) {
    fun findCard(cardId: Long): CardEntity =
        cardRepository.findByCardIdAndIsActiveTrue(cardId)
            ?: throw NotFoundException("카드를 찾을 수 없습니다. (cardId=$cardId)")

    fun listUserCards(accountId: UUID): List<UserCardEntity> =
        userCardRepository.findAllByAccountIdAndIsActiveTrue(accountId)

    fun findUserCard(userCardId: Long, accountId: UUID): UserCardEntity =
        userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: throw NotFoundException("등록된 카드를 찾을 수 없습니다.")

    fun getIssuers(): List<CardIssuerEntity> = issuerRepository.findAllByIsActiveTrue()
    fun getBrands(): List<CardBrandEntity> = brandRepository.findAllByIsActiveTrue()

    fun searchCardsByIssuerAndBrand(issuerId: String, brandId: String): List<CardEntity> =
        cardRepository.findAllByIssuerIdAndBrandIdAndIsActiveTrue(issuerId, brandId)

    fun searchCardsByKeyword(keyword: String): List<CardEntity> =
        cardRepository.findAllByCardNameContainingIgnoreCaseAndIsActiveTrue(keyword)

    fun getAllCards(): List<CardEntity> = cardRepository.findAllByIsActiveTrue()

    @Transactional
    fun registerCard(accountId: UUID, cardId: Long, issuedAt: LocalDate, nickname: String?): UserCardEntity {
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
    fun registerCardDetailed(accountId: UUID, request: RegisterCardDetailedRequest): UserCardEntity {
        // 상세 등록 로직
        val userCard = UserCardEntity().apply {
            this.accountId = accountId
            this.cardId = null // 상세 등록 시에는 템플릿 카드 ID가 없을 수도 있음 (커스텀 등록)
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
            this.issuedAt = LocalDate.now()
            this.isActive = true
        }
        val saved = userCardRepository.save(userCard)
        // 바우처 초기화는 템플릿 카드가 있을 때만 수행 (필요 시 로직 추가 가능)
        return saved
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

    @Transactional
    fun updateUserCard(userCard: UserCardEntity): UserCardEntity {
        return userCardRepository.save(userCard)
    }

    @Transactional
    fun deactivateUserCard(userCard: UserCardEntity): UserCardEntity {
        userCard.isActive = false
        return userCardRepository.save(userCard)
    }
}
