package com.cardwise.card.infrastructure

import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.CardRepository
import com.cardwise.performance.infrastructure.UserCardEntity
import com.cardwise.performance.infrastructure.UserCardRepository
import com.cardwise.performance.infrastructure.UserVoucherEntity
import com.cardwise.performance.infrastructure.UserVoucherRepository
import com.cardwise.performance.infrastructure.CardVoucherRepository
import com.cardwise.common.exception.NotFoundException
import java.time.LocalDate
import java.util.UUID
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class CardManagementRepository(
    private val cardRepository: CardRepository,
    private val userCardRepository: UserCardRepository,
    private val userVoucherRepository: UserVoucherRepository,
    private val cardVoucherRepository: CardVoucherRepository,
) {
    fun findCard(cardId: Long): CardEntity =
        cardRepository.findByCardIdAndIsActiveTrue(cardId)
            ?: throw NotFoundException("카드를 찾을 수 없습니다. (cardId=$cardId)")

    fun listUserCards(accountId: UUID): List<UserCardEntity> =
        userCardRepository.findAllByAccountIdAndIsActiveTrue(accountId)

    fun findUserCard(userCardId: Long, accountId: UUID): UserCardEntity =
        userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: throw NotFoundException("등록된 카드를 찾을 수 없습니다.")

    @Transactional
    fun registerCard(accountId: UUID, cardId: Long, issuedAt: LocalDate, nickname: String?): UserCardEntity {
        findCard(cardId) // 카드 존재 여부 확인
        val userCard = UserCardEntity().apply {
            this.accountId = accountId
            this.cardId = cardId
            this.issuedAt = issuedAt
            this.cardNickname = nickname
            this.isActive = true
        }
        val saved = userCardRepository.save(userCard)

        // 해당 카드의 바우처 인스턴스 초기화
        val cardVouchers = cardVoucherRepository.findAllByCardIdAndIsActiveTrue(cardId)
        if (cardVouchers.isNotEmpty()) {
            val now = LocalDate.now()
            val vouchers = cardVouchers.map { cv ->
                UserVoucherEntity().apply {
                    this.userCardId = saved.userCardId
                    this.cardVoucherId = cv.cardVoucherId
                    this.remainingCount = cv.totalCount
                    this.totalCount = cv.totalCount
                    this.validFrom = cv.validFrom ?: now
                    this.validUntil = cv.validUntil
                }
            }
            userVoucherRepository.saveAll(vouchers)
        }

        return saved
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
