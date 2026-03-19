package com.cardwise.performance

import com.cardwise.performance.application.PerformanceService
import com.cardwise.performance.domain.AnnualPerfBasis
import com.cardwise.performance.domain.BenefitPeriodLag
import com.cardwise.performance.infrastructure.CardBenefitEntity
import com.cardwise.performance.infrastructure.CardBenefitRepository
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.CardRepository
import com.cardwise.performance.infrastructure.CardVoucherEntity
import com.cardwise.performance.infrastructure.CardVoucherRepository
import com.cardwise.performance.infrastructure.PerformanceTierEntity
import com.cardwise.performance.infrastructure.PerformanceTierRepository
import com.cardwise.performance.infrastructure.SpecialPerformancePeriodEntity
import com.cardwise.performance.infrastructure.SpecialPerformancePeriodRepository
import com.cardwise.performance.infrastructure.UserCardEntity
import com.cardwise.performance.infrastructure.UserCardRepository
import com.cardwise.performance.infrastructure.UserVoucherEntity
import com.cardwise.performance.infrastructure.UserVoucherRepository
import com.cardwise.performance.infrastructure.UserPerformanceEntity
import com.cardwise.performance.infrastructure.UserPerformanceRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import java.math.BigDecimal
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

class PerformanceServiceTest {
    private val defaultAccountId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")
    private val clock: Clock = Clock.fixed(Instant.parse("2026-03-19T00:00:00Z"), ZoneId.of("Asia/Seoul"))
    private val objectMapper = ObjectMapper()

    @Test
    fun `builds performance response from current schema data`() {
        val cardRepository = Mockito.mock(CardRepository::class.java)
        val userCardRepository = Mockito.mock(UserCardRepository::class.java)
        val userPerformanceRepository = Mockito.mock(UserPerformanceRepository::class.java)
        val performanceTierRepository = Mockito.mock(PerformanceTierRepository::class.java)
        val cardBenefitRepository = Mockito.mock(CardBenefitRepository::class.java)
        val specialPerformancePeriodRepository = Mockito.mock(SpecialPerformancePeriodRepository::class.java)
        val cardVoucherRepository = Mockito.mock(CardVoucherRepository::class.java)
        val userVoucherRepository = Mockito.mock(UserVoucherRepository::class.java)

        val service = PerformanceService(
            cardRepository,
            userCardRepository,
            userPerformanceRepository,
            performanceTierRepository,
            cardBenefitRepository,
            specialPerformancePeriodRepository,
            cardVoucherRepository,
            userVoucherRepository,
            objectMapper,
            clock
        )

        val userCard = UserCardEntity(
            userCardId = 1L,
            accountId = defaultAccountId,
            cardId = 10L,
            issuedAt = LocalDate.of(2025, 6, 15),
            isActive = true
        )
        val card = CardEntity(
            cardId = 10L,
            cardName = "Samsung taptap O",
            annualPerfBasis = AnnualPerfBasis.ISSUANCE_MONTH,
            cardRules = "{\"grace_period\":{\"enabled\":true,\"months\":3,\"min_spend_per_month\":0}}",
            hasPerformanceTier = true,
            isActive = true
        )

        Mockito.`when`(userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(1L, defaultAccountId))
            .thenReturn(userCard)
        Mockito.`when`(cardRepository.findByCardIdAndIsActiveTrue(10L)).thenReturn(card)
        Mockito.`when`(performanceTierRepository.findAllByCardIdOrderBySortOrderAsc(10L)).thenReturn(
            listOf(
                PerformanceTierEntity(1L, 10L, "300K", 300000, 599999, 1),
                PerformanceTierEntity(2L, 10L, "500K", 500000, 999999, 2),
                PerformanceTierEntity(3L, 10L, "1M", 1000000, null, 3)
            )
        )
        Mockito.`when`(cardBenefitRepository.findAllByCardId(10L)).thenReturn(
            listOf(
                CardBenefitEntity(1L, 10L, BenefitPeriodLag.PREV_MONTH),
                CardBenefitEntity(2L, 10L, BenefitPeriodLag.PREV_MONTH),
                CardBenefitEntity(3L, 10L, BenefitPeriodLag.CURRENT_MONTH)
            )
        )
        Mockito.`when`(specialPerformancePeriodRepository.findAllByCardIdAndIsActiveTrue(10L)).thenReturn(
            listOf(
                SpecialPerformancePeriodEntity(
                    specialPeriodId = 1L,
                    cardId = 10L,
                    periodName = "Spring Spend Boost",
                    startDate = LocalDate.of(2026, 3, 1),
                    endDate = LocalDate.of(2026, 3, 31),
                    creditMultiplier = BigDecimal("1.50"),
                    isActive = true,
                    description = "Spring bonus"
                )
            )
        )
        Mockito.`when`(cardVoucherRepository.findAllByCardIdAndIsActiveTrue(10L)).thenReturn(
            listOf(
                CardVoucherEntity(
                    cardVoucherId = 10L,
                    cardId = 10L,
                    voucherName = "Airport Lounge",
                    totalCount = 2,
                    description = "Lounge benefit",
                    validUntil = LocalDate.of(2026, 12, 31),
                    unlockConditions = "{\"requires_annual_performance\":3000000,\"unlock_type\":\"AUTO\",\"available_after_months\":6}",
                    isActive = true
                )
            )
        )
        Mockito.`when`(userVoucherRepository.findAllByUserCardId(1L)).thenReturn(
            listOf(
                UserVoucherEntity(
                    userVoucherId = 1L,
                    userCardId = 1L,
                    cardVoucherId = 10L,
                    remainingCount = 2,
                    totalCount = 2,
                    validUntil = LocalDate.of(2026, 12, 31)
                )
            )
        )
        Mockito.`when`(userPerformanceRepository.findAllByUserCardIdAndYearMonthBetweenOrderByYearMonthAsc(1L, "2025-06", "2026-03"))
            .thenReturn(
                listOf(
                    performanceRow(1L, 1L, "2025-06", 45_000, 45_000),
                    performanceRow(2L, 1L, "2025-07", 92_000, 137_000),
                    performanceRow(3L, 1L, "2025-08", 78_000, 215_000),
                    performanceRow(4L, 1L, "2025-09", 110_000, 325_000),
                    performanceRow(5L, 1L, "2025-10", 65_000, 390_000),
                    performanceRow(6L, 1L, "2025-11", 40_000, 430_000),
                    performanceRow(7L, 1L, "2025-12", 0, 430_000),
                    performanceRow(8L, 1L, "2026-01", 0, 430_000),
                    performanceRow(9L, 1L, "2026-02", 180_000, 610_000),
                    performanceRow(10L, 1L, "2026-03", 210_000, 820_000)
                )
            )
        Mockito.`when`(userPerformanceRepository.findByUserCardIdAndYearMonth(1L, "2026-03"))
            .thenReturn(performanceRow(10L, 1L, "2026-03", 210_000, 820_000))

        val result = service.getPerformance(1L, defaultAccountId).data

        assertThat(result.userCardId).isEqualTo(1L)
        assertThat(result.cardName).isEqualTo("Samsung taptap O")
        assertThat(result.annualPeriod.from).isEqualTo("2025-06")
        assertThat(result.annualPeriod.to).isEqualTo("2026-05")
        assertThat(result.currentMonth.yearMonth).isEqualTo("2026-03")
        assertThat(result.currentMonth.monthlySpent).isEqualTo(210_000)
        assertThat(result.currentMonth.previousMonthSpent).isEqualTo(180_000)
        assertThat(result.currentMonth.changeRate).isEqualByComparingTo("16.7")
        assertThat(result.annual.accumulated).isEqualTo(820_000)
        assertThat(result.annual.currentTier?.tierName).isEqualTo("500K")
        assertThat(result.annual.currentTier?.achievedAt).isEqualTo("2026-02-28")
        assertThat(result.annual.nextTier?.tierName).isEqualTo("1M")
        assertThat(result.annual.nextTier?.remainingAmount).isEqualTo(180_000)
        assertThat(result.benefitQualification.periodLag).isEqualTo("PREV_MONTH")
        assertThat(result.benefitQualification.referenceMonth).isEqualTo("2026-02")
        assertThat(result.benefitQualification.referenceMonthSpent).isEqualTo(180_000)
        assertThat(result.benefitQualification.qualifiedTierName).isNull()
        assertThat(result.benefitQualification.gracePeriod.active).isFalse()
        assertThat(result.specialPeriod.active).isTrue()
        assertThat(result.specialPeriod.name).isEqualTo("Spring Spend Boost")
        assertThat(result.specialPeriod.creditMultiplier).isEqualByComparingTo("1.50")
        assertThat(result.voucherUnlocks).hasSize(1)
        assertThat(result.voucherUnlocks.first().voucherName).isEqualTo("Airport Lounge")
        assertThat(result.voucherUnlocks.first().unlockState).isEqualTo("UNLOCKED")
        assertThat(result.voucherUnlocks.first().remainingCount).isEqualTo(2)
        assertThat(result.monthlyBreakdown).hasSize(10)
        assertThat(result.monthlyBreakdown.first().yearMonth).isEqualTo("2025-06")
        assertThat(result.monthlyBreakdown.last().spent).isEqualTo(210_000)
    }

    @Test
    fun `applies issuance date annual basis and grace period`() {
        val cardRepository = Mockito.mock(CardRepository::class.java)
        val userCardRepository = Mockito.mock(UserCardRepository::class.java)
        val userPerformanceRepository = Mockito.mock(UserPerformanceRepository::class.java)
        val performanceTierRepository = Mockito.mock(PerformanceTierRepository::class.java)
        val cardBenefitRepository = Mockito.mock(CardBenefitRepository::class.java)
        val specialPerformancePeriodRepository = Mockito.mock(SpecialPerformancePeriodRepository::class.java)
        val cardVoucherRepository = Mockito.mock(CardVoucherRepository::class.java)
        val userVoucherRepository = Mockito.mock(UserVoucherRepository::class.java)

        val service = PerformanceService(
            cardRepository,
            userCardRepository,
            userPerformanceRepository,
            performanceTierRepository,
            cardBenefitRepository,
            specialPerformancePeriodRepository,
            cardVoucherRepository,
            userVoucherRepository,
            objectMapper,
            clock
        )

        val userCard = UserCardEntity(
            userCardId = 2L,
            accountId = defaultAccountId,
            cardId = 20L,
            issuedAt = LocalDate.of(2026, 1, 15),
            isActive = true
        )
        val card = CardEntity(
            cardId = 20L,
            cardName = "Shinhan Deep Dream",
            annualPerfBasis = AnnualPerfBasis.ISSUANCE_DATE,
            cardRules = "{\"grace_period\":{\"enabled\":true,\"months\":3,\"min_spend_per_month\":0}}",
            hasPerformanceTier = true,
            isActive = true
        )

        Mockito.`when`(userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(2L, defaultAccountId))
            .thenReturn(userCard)
        Mockito.`when`(cardRepository.findByCardIdAndIsActiveTrue(20L)).thenReturn(card)
        Mockito.`when`(performanceTierRepository.findAllByCardIdOrderBySortOrderAsc(20L)).thenReturn(
            listOf(PerformanceTierEntity(1L, 20L, "300K", 300000, 599999, 1))
        )
        Mockito.`when`(cardBenefitRepository.findAllByCardId(20L)).thenReturn(
            listOf(CardBenefitEntity(1L, 20L, BenefitPeriodLag.CURRENT_MONTH))
        )
        Mockito.`when`(specialPerformancePeriodRepository.findAllByCardIdAndIsActiveTrue(20L)).thenReturn(emptyList())
        Mockito.`when`(cardVoucherRepository.findAllByCardIdAndIsActiveTrue(20L)).thenReturn(
            listOf(
                CardVoucherEntity(
                    cardVoucherId = 20L,
                    cardId = 20L,
                    voucherName = "Coffee Coupon",
                    totalCount = 1,
                    description = "Monthly coffee coupon",
                    validUntil = LocalDate.of(2026, 12, 31),
                    unlockConditions = "{\"unlock_type\":\"MANUAL\",\"requires_annual_performance\":200000,\"available_after_months\":1}",
                    isActive = true
                )
            )
        )
        Mockito.`when`(userVoucherRepository.findAllByUserCardId(2L)).thenReturn(emptyList())
        Mockito.`when`(userPerformanceRepository.findAllByUserCardIdAndYearMonthBetweenOrderByYearMonthAsc(2L, "2026-01", "2026-03"))
            .thenReturn(
                listOf(
                    performanceRow(11L, 2L, "2026-01", 50_000, 50_000),
                    performanceRow(12L, 2L, "2026-02", 75_000, 125_000),
                    performanceRow(13L, 2L, "2026-03", 90_000, 215_000)
                )
            )
        Mockito.`when`(userPerformanceRepository.findByUserCardIdAndYearMonth(2L, "2026-03"))
            .thenReturn(performanceRow(13L, 2L, "2026-03", 90_000, 215_000))

        val result = service.getPerformance(2L, defaultAccountId).data

        assertThat(result.annualPeriod.from).isEqualTo("2026-01-15")
        assertThat(result.annualPeriod.to).isEqualTo("2027-01-14")
        assertThat(result.benefitQualification.periodLag).isEqualTo("CURRENT_MONTH")
        assertThat(result.benefitQualification.gracePeriod.active).isTrue()
        assertThat(result.benefitQualification.gracePeriod.expiresAt).isEqualTo("2026-04-14")
        assertThat(result.benefitQualification.gracePeriod.remainingDays).isEqualTo(27)
        assertThat(result.specialPeriod.active).isFalse()
        assertThat(result.voucherUnlocks).hasSize(1)
        assertThat(result.voucherUnlocks.first().unlockState).isEqualTo("ELIGIBLE")
        assertThat(result.voucherUnlocks.first().remainingAmount).isEqualTo(0)
    }

    private fun performanceRow(
        id: Long,
        userCardId: Long,
        yearMonth: String,
        monthlySpent: Long,
        annualAccumulated: Long
    ): UserPerformanceEntity {
        return UserPerformanceEntity(
            userPerformanceId = id,
            userCardId = userCardId,
            yearMonth = yearMonth,
            monthlySpent = monthlySpent,
            annualAccumulated = annualAccumulated
        )
    }
}
