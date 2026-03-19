package com.cardwise.voucher

import com.cardwise.common.exception.BadRequestException
import com.cardwise.performance.domain.AnnualPerfBasis
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.CardRepository
import com.cardwise.performance.infrastructure.CardVoucherEntity
import com.cardwise.performance.infrastructure.CardVoucherRepository
import com.cardwise.performance.infrastructure.UserCardEntity
import com.cardwise.performance.infrastructure.UserCardRepository
import com.cardwise.performance.infrastructure.UserPerformanceEntity
import com.cardwise.performance.infrastructure.UserPerformanceRepository
import com.cardwise.performance.infrastructure.UserVoucherEntity
import com.cardwise.performance.infrastructure.UserVoucherRepository
import com.cardwise.voucher.api.VoucherActionRequest
import com.cardwise.voucher.application.VoucherService
import com.cardwise.voucher.infrastructure.UserVoucherLogEntity
import com.cardwise.voucher.infrastructure.UserVoucherLogRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Optional
import java.util.UUID

class VoucherServiceTest {
    private val accountId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")
    private val clock: Clock = Clock.fixed(Instant.parse("2026-03-19T00:00:00Z"), ZoneId.of("Asia/Seoul"))
    private val objectMapper = ObjectMapper()

    @Test
    fun `lists vouchers with unlock and expiry metadata`() {
        val cardRepository = Mockito.mock(CardRepository::class.java)
        val userCardRepository = Mockito.mock(UserCardRepository::class.java)
        val cardVoucherRepository = Mockito.mock(CardVoucherRepository::class.java)
        val userVoucherRepository = Mockito.mock(UserVoucherRepository::class.java)
        val userPerformanceRepository = Mockito.mock(UserPerformanceRepository::class.java)
        val userVoucherLogRepository = Mockito.mock(UserVoucherLogRepository::class.java)
        val service = VoucherService(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userVoucherRepository,
            userPerformanceRepository,
            userVoucherLogRepository,
            objectMapper,
            clock,
        )

        val userCard = UserCardEntity(
            userCardId = 11L,
            accountId = accountId,
            cardId = 31L,
            cardNickname = "메인 카드",
            issuedAt = LocalDate.of(2025, 9, 1),
            isActive = true,
        )
        val card = CardEntity(
            cardId = 31L,
            cardName = "Samsung taptap O",
            annualPerfBasis = AnnualPerfBasis.ISSUANCE_MONTH,
            isActive = true,
        )
        val activeVoucher = CardVoucherEntity(
            cardVoucherId = 51L,
            cardId = 31L,
            voucherName = "Airport Lounge",
            voucherType = "LOUNGE",
            periodType = "YEARLY",
            totalCount = 2,
            description = "Lounge pass",
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
            unlockConditions = "{\"unlock_type\":\"AUTO\"}",
            isActive = true,
        )
        val lockedVoucher = CardVoucherEntity(
            cardVoucherId = 52L,
            cardId = 31L,
            voucherName = "Premium Dining",
            voucherType = "SERVICE",
            periodType = "YEARLY",
            totalCount = 1,
            description = "Dining voucher",
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
            unlockConditions = "{\"unlock_type\":\"MANUAL\",\"requires_annual_performance\":1000000}",
            isActive = true,
        )
        val userVoucher = UserVoucherEntity(
            userVoucherId = 71L,
            userCardId = 11L,
            cardVoucherId = 51L,
            remainingCount = 2,
            totalCount = 2,
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
        )
        val lockedUserVoucher = UserVoucherEntity(
            userVoucherId = 72L,
            userCardId = 11L,
            cardVoucherId = 52L,
            remainingCount = 1,
            totalCount = 1,
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
        )

        Mockito.`when`(userCardRepository.findAllByAccountIdAndIsActiveTrue(accountId)).thenReturn(listOf(userCard))
        Mockito.`when`(cardRepository.findAllByCardIdInAndIsActiveTrue(listOf(31L))).thenReturn(listOf(card))
        Mockito.`when`(cardVoucherRepository.findAllByCardIdInAndIsActiveTrue(listOf(31L))).thenReturn(listOf(activeVoucher, lockedVoucher))
        Mockito.`when`(userVoucherRepository.findAllByUserCardIdIn(listOf(11L))).thenReturn(listOf(userVoucher, lockedUserVoucher))
        Mockito.`when`(userPerformanceRepository.findTopByUserCardIdOrderByYearMonthDesc(11L))
            .thenReturn(UserPerformanceEntity(1L, 11L, "2026-03", 400_000, 400_000))

        val result = service.listVouchers(accountId, "active").data

        assertThat(result).hasSize(2)
        assertThat(result.first().cardLabel).isEqualTo("메인 카드")
        assertThat(result.first().unlockState).isEqualTo("UNLOCKED")
        assertThat(result.first().canUse).isTrue()
        assertThat(result.last().unlockState).isEqualTo("UNLOCKED")
        assertThat(result.last().requiredAnnualPerformance).isEqualTo(1_000_000)
    }

    @Test
    fun `uses voucher and records history`() {
        val cardRepository = Mockito.mock(CardRepository::class.java)
        val userCardRepository = Mockito.mock(UserCardRepository::class.java)
        val cardVoucherRepository = Mockito.mock(CardVoucherRepository::class.java)
        val userVoucherRepository = Mockito.mock(UserVoucherRepository::class.java)
        val userPerformanceRepository = Mockito.mock(UserPerformanceRepository::class.java)
        val userVoucherLogRepository = Mockito.mock(UserVoucherLogRepository::class.java)
        val service = VoucherService(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userVoucherRepository,
            userPerformanceRepository,
            userVoucherLogRepository,
            objectMapper,
            clock,
        )

        val userVoucher = UserVoucherEntity(
            userVoucherId = 71L,
            userCardId = 11L,
            cardVoucherId = 51L,
            remainingCount = 1,
            totalCount = 2,
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
        )

        stubOwnedVoucher(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userPerformanceRepository,
            userVoucher,
        )
        Mockito.`when`(userVoucherRepository.findById(71L)).thenReturn(Optional.of(userVoucher))
        Mockito.`when`(userVoucherRepository.save(Mockito.any(UserVoucherEntity::class.java)))
            .thenAnswer { it.arguments[0] as UserVoucherEntity }

        val response = service.useVoucher(71L, accountId, VoucherActionRequest("라운지 사용"))

        val logCaptor = ArgumentCaptor.forClass(UserVoucherLogEntity::class.java)
        Mockito.verify(userVoucherLogRepository).save(logCaptor.capture())
        assertThat(response.data.remainingCount).isEqualTo(0)
        assertThat(response.data.status).isEqualTo("EXHAUSTED")
        assertThat(logCaptor.value.voucherAction).isEqualTo("USE")
        assertThat(logCaptor.value.memo).isEqualTo("라운지 사용")
    }

    @Test
    fun `restores voucher count with unuse`() {
        val cardRepository = Mockito.mock(CardRepository::class.java)
        val userCardRepository = Mockito.mock(UserCardRepository::class.java)
        val cardVoucherRepository = Mockito.mock(CardVoucherRepository::class.java)
        val userVoucherRepository = Mockito.mock(UserVoucherRepository::class.java)
        val userPerformanceRepository = Mockito.mock(UserPerformanceRepository::class.java)
        val userVoucherLogRepository = Mockito.mock(UserVoucherLogRepository::class.java)
        val service = VoucherService(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userVoucherRepository,
            userPerformanceRepository,
            userVoucherLogRepository,
            objectMapper,
            clock,
        )

        val userVoucher = UserVoucherEntity(
            userVoucherId = 71L,
            userCardId = 11L,
            cardVoucherId = 51L,
            remainingCount = 0,
            totalCount = 2,
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
        )

        stubOwnedVoucher(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userPerformanceRepository,
            userVoucher,
        )
        Mockito.`when`(userVoucherRepository.findById(71L)).thenReturn(Optional.of(userVoucher))
        Mockito.`when`(userVoucherRepository.save(Mockito.any(UserVoucherEntity::class.java)))
            .thenAnswer { it.arguments[0] as UserVoucherEntity }

        val response = service.unuseVoucher(71L, accountId, VoucherActionRequest("실수 복구"))

        val logCaptor = ArgumentCaptor.forClass(UserVoucherLogEntity::class.java)
        Mockito.verify(userVoucherLogRepository).save(logCaptor.capture())
        assertThat(response.data.remainingCount).isEqualTo(1)
        assertThat(response.data.status).isEqualTo("ACTIVE")
        assertThat(logCaptor.value.voucherAction).isEqualTo("CANCEL")
    }

    @Test
    fun `rejects use when remaining count is already zero`() {
        val cardRepository = Mockito.mock(CardRepository::class.java)
        val userCardRepository = Mockito.mock(UserCardRepository::class.java)
        val cardVoucherRepository = Mockito.mock(CardVoucherRepository::class.java)
        val userVoucherRepository = Mockito.mock(UserVoucherRepository::class.java)
        val userPerformanceRepository = Mockito.mock(UserPerformanceRepository::class.java)
        val userVoucherLogRepository = Mockito.mock(UserVoucherLogRepository::class.java)
        val service = VoucherService(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userVoucherRepository,
            userPerformanceRepository,
            userVoucherLogRepository,
            objectMapper,
            clock,
        )

        val userVoucher = UserVoucherEntity(
            userVoucherId = 71L,
            userCardId = 11L,
            cardVoucherId = 51L,
            remainingCount = 0,
            totalCount = 2,
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
        )

        stubOwnedVoucher(
            cardRepository,
            userCardRepository,
            cardVoucherRepository,
            userPerformanceRepository,
            userVoucher,
        )
        Mockito.`when`(userVoucherRepository.findById(71L)).thenReturn(Optional.of(userVoucher))

        assertThatThrownBy { service.useVoucher(71L, accountId, VoucherActionRequest()) }
            .isInstanceOf(BadRequestException::class.java)
            .hasMessageContaining("remaining")
    }

    private fun stubOwnedVoucher(
        cardRepository: CardRepository,
        userCardRepository: UserCardRepository,
        cardVoucherRepository: CardVoucherRepository,
        userPerformanceRepository: UserPerformanceRepository,
        userVoucher: UserVoucherEntity,
    ) {
        val userCard = UserCardEntity(
            userCardId = 11L,
            accountId = accountId,
            cardId = 31L,
            issuedAt = LocalDate.of(2025, 9, 1),
            isActive = true,
        )
        val card = CardEntity(
            cardId = 31L,
            cardName = "Samsung taptap O",
            annualPerfBasis = AnnualPerfBasis.ISSUANCE_MONTH,
            isActive = true,
        )
        val cardVoucher = CardVoucherEntity(
            cardVoucherId = 51L,
            cardId = 31L,
            voucherName = "Airport Lounge",
            voucherType = "LOUNGE",
            periodType = "YEARLY",
            totalCount = 2,
            description = "Lounge pass",
            validFrom = LocalDate.of(2026, 1, 1),
            validUntil = LocalDate.of(2026, 12, 31),
            unlockConditions = "{\"unlock_type\":\"AUTO\"}",
            isActive = true,
        )
        Mockito.`when`(userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(11L, accountId)).thenReturn(userCard)
        Mockito.`when`(cardRepository.findByCardIdAndIsActiveTrue(31L)).thenReturn(card)
        Mockito.`when`(cardVoucherRepository.findById(51L)).thenReturn(Optional.of(cardVoucher))
        Mockito.`when`(userPerformanceRepository.findTopByUserCardIdOrderByYearMonthDesc(11L))
            .thenReturn(UserPerformanceEntity(1L, 11L, "2026-03", 400_000, 400_000))
    }
}
