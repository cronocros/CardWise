package com.cardwise.performance.api

import java.math.BigDecimal

data class PerformanceResponse(
    val data: PerformanceData
)

data class PerformanceData(
    val userCardId: Long,
    val cardName: String,
    val annualPeriod: AnnualPeriod,
    val currentMonth: CurrentMonth,
    val annual: AnnualSummary,
    val benefitQualification: BenefitQualification,
    val specialPeriod: SpecialPeriod,
    val voucherUnlocks: List<VoucherUnlockSummary>,
    val monthlyBreakdown: List<MonthlyBreakdownItem>
)

data class AnnualPeriod(
    val from: String,
    val to: String,
    val issuedAt: String,
    val basis: String
)

data class CurrentMonth(
    val yearMonth: String,
    val monthlySpent: Long,
    val previousMonthSpent: Long?,
    val changeRate: BigDecimal?
)

data class AnnualSummary(
    val accumulated: Long,
    val currentTier: TierSummary?,
    val nextTier: TierSummary?
)

data class TierSummary(
    val tierName: String,
    val minAmount: Long,
    val maxAmount: Long?,
    val achievedAt: String?,
    val remainingAmount: Long?
)

data class BenefitQualification(
    val periodLag: String,
    val periodLagLabel: String,
    val referenceMonth: String,
    val referenceMonthSpent: Long,
    val qualifiedTierName: String?,
    val gracePeriod: GracePeriod
)

data class GracePeriod(
    val active: Boolean,
    val expiresAt: String?,
    val remainingDays: Long?,
    val minSpendPerMonth: Long
)

data class SpecialPeriod(
    val active: Boolean,
    val name: String?,
    val from: String?,
    val to: String?,
    val creditMultiplier: BigDecimal?
)

data class VoucherUnlockSummary(
    val voucherName: String,
    val unlockType: String,
    val unlockState: String,
    val requiredAnnualPerformance: Long?,
    val currentAnnualPerformance: Long,
    val remainingAmount: Long?,
    val availableAt: String?,
    val remainingCount: Int?,
    val totalCount: Int?,
    val validUntil: String?,
    val notes: String?,
)

data class MonthlyBreakdownItem(
    val yearMonth: String,
    val spent: Long
)
