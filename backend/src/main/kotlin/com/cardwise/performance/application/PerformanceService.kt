package com.cardwise.performance.application

import com.cardwise.performance.api.AnnualPeriod
import com.cardwise.performance.api.AnnualSummary
import com.cardwise.performance.api.BenefitQualification
import com.cardwise.performance.api.CurrentMonth
import com.cardwise.performance.api.GracePeriod
import com.cardwise.performance.api.MonthlyBreakdownItem
import com.cardwise.performance.api.PerformanceData
import com.cardwise.performance.api.PerformanceResponse
import com.cardwise.performance.api.SpecialPeriod
import com.cardwise.performance.api.TierSummary
import com.cardwise.performance.api.VoucherUnlockSummary
import com.cardwise.performance.domain.AnnualPerfBasis
import com.cardwise.performance.domain.BenefitPeriodLag
import com.cardwise.voucher.domain.VoucherUnlockSupport
import com.cardwise.performance.infrastructure.CardVoucherEntity
import com.cardwise.performance.infrastructure.CardVoucherRepository
import com.cardwise.performance.infrastructure.CardBenefitRepository
import com.cardwise.performance.infrastructure.CardEntity
import com.cardwise.performance.infrastructure.CardRepository
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
import com.cardwise.performance.application.port.`in`.PerformanceQueryUseCase
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Clock
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

private val LAG_LABELS = mapOf(
    BenefitPeriodLag.CURRENT_MONTH to "당월 실적 기준",
    BenefitPeriodLag.PREV_MONTH to "전월 실적 기준",
    BenefitPeriodLag.PREV_PREV_MONTH to "전전월 실적 기준"
)

@Service
@Transactional(readOnly = true)
class PerformanceService(
    private val cardRepository: CardRepository,
    private val userCardRepository: UserCardRepository,
    private val userPerformanceRepository: UserPerformanceRepository,
    private val performanceTierRepository: PerformanceTierRepository,
    private val cardBenefitRepository: CardBenefitRepository,
    private val specialPerformancePeriodRepository: SpecialPerformancePeriodRepository,
    private val cardVoucherRepository: CardVoucherRepository,
    private val userVoucherRepository: UserVoucherRepository,
    private val objectMapper: ObjectMapper,
    private val clock: Clock
) : PerformanceQueryUseCase {
    override fun getPerformance(userCardId: Long, accountId: java.util.UUID): PerformanceResponse {
        val userCard = userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "User card not found")

        val cardId = requireNotNull(userCard.cardId) { "User card is missing card id" }
        val card = cardRepository.findByCardIdAndIsActiveTrue(cardId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found")

        val today = LocalDate.now(clock)
        val annualPeriod = buildAnnualPeriod(card, userCard.issuedAt)
        val annualStartMonth = YearMonth.from(annualPeriod.startDate)
        val annualEndMonth = YearMonth.from(annualPeriod.endDate)
        val currentMonth = YearMonth.from(today)
        val reportingMonth = clampMonth(currentMonth, annualStartMonth, annualEndMonth)

        val performanceRows = userPerformanceRepository
            .findAllByUserCardIdAndYearMonthBetweenOrderByYearMonthAsc(
                userCardId,
                annualStartMonth.toString(),
                reportingMonth.toString()
            )
            .associateBy { YearMonth.parse(it.yearMonth) }

        val monthlyStats = buildMonthlyStats(annualStartMonth, reportingMonth, performanceRows)
        val currentMonthStat = monthlyStats.lastOrNull()
        val currentMonthSpent = currentMonthStat?.spent ?: 0L
        val previousMonthSpent = monthlyStats.dropLast(1).lastOrNull()?.spent

        val currentMonthRow = performanceRows[reportingMonth]
        val annualAccumulated = currentMonthRow?.annualAccumulated ?: monthlyStats.sumOf { it.spent }

        val tiers = if (card.hasPerformanceTier) {
            performanceTierRepository.findAllByCardIdOrderBySortOrderAsc(cardId)
                .sortedBy { it.minAmount }
        } else {
            emptyList()
        }

        val currentTier = resolveCurrentTier(tiers, annualAccumulated, monthlyStats)
        val nextTier = resolveNextTier(tiers, annualAccumulated)
        val lag = resolveCommonLag(cardId)
        val referenceMonth = resolveReferenceMonth(reportingMonth, lag)
        val referenceMonthSpent = monthlyStats.firstOrNull { it.yearMonth == referenceMonth }?.spent
            ?: performanceRows[referenceMonth]?.monthlySpent
            ?: 0L
        val referenceTier = resolveTierForAmount(tiers, referenceMonthSpent)
        val gracePeriod = resolveGracePeriod(card, userCard, today, currentMonthSpent)
        val specialPeriod = resolveSpecialPeriod(cardId, today)
        val voucherUnlocks = resolveVoucherUnlocks(
            cardId = cardId,
            userCardId = userCardId,
            issuedAt = userCard.issuedAt,
            annualAccumulated = annualAccumulated,
            today = today
        )

        return PerformanceResponse(
            data = PerformanceData(
                userCardId = userCardId,
                cardName = card.cardName,
                annualPeriod = AnnualPeriod(
                    from = annualPeriod.startLabel,
                    to = annualPeriod.endLabel,
                    issuedAt = userCard.issuedAt.toString(),
                    basis = card.annualPerfBasis.name
                ),
                currentMonth = CurrentMonth(
                    yearMonth = reportingMonth.toString(),
                    monthlySpent = currentMonthSpent,
                    previousMonthSpent = previousMonthSpent,
                    changeRate = calculateChangeRate(currentMonthSpent, previousMonthSpent)
                ),
                annual = AnnualSummary(
                    accumulated = annualAccumulated,
                    currentTier = currentTier,
                    nextTier = nextTier
                ),
                benefitQualification = BenefitQualification(
                    periodLag = lag.name,
                    periodLagLabel = LAG_LABELS[lag] ?: lag.name,
                    referenceMonth = referenceMonth.toString(),
                    referenceMonthSpent = referenceMonthSpent,
                    qualifiedTierName = referenceTier?.tierName,
                    gracePeriod = gracePeriod
                ),
                specialPeriod = specialPeriod,
                voucherUnlocks = voucherUnlocks,
                monthlyBreakdown = monthlyStats.map { MonthlyBreakdownItem(it.yearMonth.toString(), it.spent) }
            )
        )
    }

    private data class AnnualPeriodWindow(
        val startDate: LocalDate,
        val endDate: LocalDate,
        val startLabel: String,
        val endLabel: String
    )

    private data class MonthlyStat(
        val yearMonth: YearMonth,
        val spent: Long
    )

    private fun buildAnnualPeriod(card: CardEntity, issuedAt: LocalDate): AnnualPeriodWindow {
        return when (card.annualPerfBasis) {
            AnnualPerfBasis.ISSUANCE_MONTH -> {
                val start = issuedAt.withDayOfMonth(1)
                val end = start.plusMonths(12).minusDays(1)
                AnnualPeriodWindow(
                    startDate = start,
                    endDate = end,
                    startLabel = YearMonth.from(start).toString(),
                    endLabel = YearMonth.from(end).toString()
                )
            }
            AnnualPerfBasis.ISSUANCE_DATE -> {
                val start = issuedAt
                val end = issuedAt.plusYears(1).minusDays(1)
                AnnualPeriodWindow(
                    startDate = start,
                    endDate = end,
                    startLabel = start.toString(),
                    endLabel = end.toString()
                )
            }
        }
    }

    private fun clampMonth(target: YearMonth, start: YearMonth, end: YearMonth): YearMonth {
        return when {
            target.isBefore(start) -> start
            target.isAfter(end) -> end
            else -> target
        }
    }

    private fun buildMonthlyStats(
        startMonth: YearMonth,
        endMonth: YearMonth,
        performanceRows: Map<YearMonth, UserPerformanceEntity>
    ): List<MonthlyStat> {
        val stats = mutableListOf<MonthlyStat>()
        var month = startMonth
        while (!month.isAfter(endMonth)) {
            val spent = performanceRows[month]?.monthlySpent ?: 0L
            stats += MonthlyStat(month, spent)
            month = month.plusMonths(1)
        }
        return stats
    }

    private fun resolveCurrentTier(
        tiers: List<PerformanceTierEntity>,
        annualAccumulated: Long,
        stats: List<MonthlyStat>
    ): TierSummary? {
        val tier = resolveTierForAmount(tiers, annualAccumulated) ?: return null
        val achievedAt = resolveAchievedAt(stats, tier)
        return tier.toSummary(achievedAt = achievedAt)
    }

    private fun resolveNextTier(
        tiers: List<PerformanceTierEntity>,
        annualAccumulated: Long
    ): TierSummary? {
        val tier = tiers.firstOrNull { it.minAmount > annualAccumulated } ?: return null
        return tier.toSummary(
            achievedAt = null,
            remainingAmount = (tier.minAmount - annualAccumulated).coerceAtLeast(0L)
        )
    }

    private fun resolveTierForAmount(
        tiers: List<PerformanceTierEntity>,
        amount: Long
    ): PerformanceTierEntity? {
        return tiers
            .filter { tier ->
                val maxAmount = tier.maxAmount
                tier.minAmount <= amount && (maxAmount == null || amount <= maxAmount)
            }
            .maxByOrNull { it.minAmount }
    }

    private fun resolveAchievedAt(stats: List<MonthlyStat>, tier: PerformanceTierEntity): String? {
        var cumulative = 0L
        for (stat in stats) {
            cumulative += stat.spent
            if (cumulative >= tier.minAmount) {
                return stat.yearMonth.atEndOfMonth().toString()
            }
        }
        return null
    }

    private fun PerformanceTierEntity.toSummary(
        achievedAt: String?,
        remainingAmount: Long? = null
    ): TierSummary {
        return TierSummary(
            tierName = tierName,
            minAmount = minAmount,
            maxAmount = maxAmount,
            achievedAt = achievedAt,
            remainingAmount = remainingAmount
        )
    }

    private fun resolveCommonLag(cardId: Long): BenefitPeriodLag {
        val benefits = cardBenefitRepository.findAllByCardId(cardId)
        if (benefits.isEmpty()) {
            return BenefitPeriodLag.PREV_MONTH
        }

        val order = listOf(
            BenefitPeriodLag.PREV_MONTH,
            BenefitPeriodLag.CURRENT_MONTH,
            BenefitPeriodLag.PREV_PREV_MONTH
        )

        return benefits
            .groupingBy { it.performancePeriodLag }
            .eachCount()
            .entries
            .sortedWith(
                compareByDescending<Map.Entry<BenefitPeriodLag, Int>> { it.value }
                    .thenBy { order.indexOf(it.key) }
            )
            .first()
            .key
    }

    private fun resolveReferenceMonth(reportingMonth: YearMonth, lag: BenefitPeriodLag): YearMonth {
        return when (lag) {
            BenefitPeriodLag.CURRENT_MONTH -> reportingMonth
            BenefitPeriodLag.PREV_MONTH -> reportingMonth.minusMonths(1)
            BenefitPeriodLag.PREV_PREV_MONTH -> reportingMonth.minusMonths(2)
        }
    }

    private data class GracePeriodConfig(
        val active: Boolean,
        val expiresAt: String?,
        val remainingDays: Long?,
        val minSpendPerMonth: Long
    )

    private fun resolveGracePeriod(
        card: CardEntity,
        userCard: UserCardEntity,
        today: LocalDate,
        currentMonthSpent: Long
    ): GracePeriod {
        val root = parseCardRules(card.cardRules)
        val graceNode = root?.path("grace_period") ?: root?.path("gracePeriod")
        val enabled = graceNode?.path("enabled")?.asBoolean(false) ?: false
        val months = graceNode?.path("months")?.asInt(0) ?: 0
        val minSpend = graceNode?.path("min_spend_per_month")?.asLong(
            graceNode?.path("minSpendPerMonth")?.asLong(0) ?: 0L
        ) ?: 0L

        val expiresAt = if (enabled && months > 0) {
            userCard.issuedAt.plusMonths(months.toLong()).minusDays(1)
        } else {
            null
        }

        val active = expiresAt != null && !today.isAfter(expiresAt) && currentMonthSpent >= minSpend
        val remainingDays = expiresAt?.let {
            if (today.isAfter(it)) 0L else ChronoUnit.DAYS.between(today, it.plusDays(1))
        }

        return GracePeriod(
            active = active,
            expiresAt = expiresAt?.toString(),
            remainingDays = remainingDays,
            minSpendPerMonth = minSpend
        )
    }

    private fun parseCardRules(cardRules: String?): JsonNode? {
        if (cardRules.isNullOrBlank()) {
            return null
        }

        return runCatching { objectMapper.readTree(cardRules) }.getOrNull()
    }

    private fun resolveSpecialPeriod(cardId: Long, today: LocalDate): SpecialPeriod {
        val activePeriod = specialPerformancePeriodRepository
            .findAllByCardIdAndIsActiveTrue(cardId)
            .filter { !today.isBefore(it.startDate) && !today.isAfter(it.endDate) }
            .sortedWith(
                compareByDescending<SpecialPerformancePeriodEntity> { it.creditMultiplier }
                    .thenBy { it.startDate }
                    .thenBy { it.periodName }
            )
            .firstOrNull()

        return if (activePeriod == null) {
            SpecialPeriod(
                active = false,
                name = null,
                from = null,
                to = null,
                creditMultiplier = null
            )
        } else {
            SpecialPeriod(
                active = true,
                name = activePeriod.periodName,
                from = activePeriod.startDate.toString(),
                to = activePeriod.endDate.toString(),
                creditMultiplier = activePeriod.creditMultiplier
            )
        }
    }

    private fun resolveVoucherUnlocks(
        cardId: Long,
        userCardId: Long,
        issuedAt: LocalDate,
        annualAccumulated: Long,
        today: LocalDate,
    ): List<VoucherUnlockSummary> {
        val vouchers = cardVoucherRepository.findAllByCardIdAndIsActiveTrue(cardId)
            .sortedBy { it.voucherName.lowercase() }
        if (vouchers.isEmpty()) {
            return emptyList()
        }

        val userVouchers = userVoucherRepository.findAllByUserCardId(userCardId)
            .associateBy { it.cardVoucherId }

        return vouchers.map { voucher ->
            val userVoucher = userVouchers[voucher.cardVoucherId]
            val evaluation = VoucherUnlockSupport.evaluate(
                objectMapper = objectMapper,
                unlockConditions = voucher.unlockConditions,
                issuedAt = issuedAt,
                annualAccumulated = annualAccumulated,
                today = today,
                isAssigned = userVoucher != null,
            )
            VoucherUnlockSummary(
                voucherName = voucher.voucherName,
                unlockType = evaluation.unlockType,
                unlockState = evaluation.unlockState,
                requiredAnnualPerformance = evaluation.requiredAnnualPerformance,
                currentAnnualPerformance = annualAccumulated,
                remainingAmount = evaluation.remainingAmount,
                availableAt = evaluation.availableAt?.toString(),
                remainingCount = userVoucher?.remainingCount,
                totalCount = userVoucher?.totalCount ?: voucher.totalCount,
                validUntil = userVoucher?.validUntil?.toString() ?: voucher.validUntil?.toString(),
                notes = evaluation.notes ?: voucher.description,
            )
        }
    }

    private fun calculateChangeRate(current: Long, previous: Long?): BigDecimal? {
        if (previous == null || previous == 0L) {
            return null
        }

        val rate = ((current - previous).toBigDecimal()
            .divide(previous.toBigDecimal(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal(100)))
        return rate.setScale(1, RoundingMode.HALF_UP)
    }
}
