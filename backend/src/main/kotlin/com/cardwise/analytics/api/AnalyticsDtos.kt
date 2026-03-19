package com.cardwise.analytics.api

data class DashboardMonthlySummaryResponse(
    val yearMonth: String,
    val totalSpent: Long,
    val totalBenefit: Long,
    val paymentCount: Int,
    val previousYearMonth: String?,
    val previousSpent: Long,
    val changeAmount: Long,
    val changeRate: Double?,
)

data class DashboardCardSummaryResponse(
    val userCardId: Long,
    val cardName: String,
    val spentAmount: Long,
    val benefitAmount: Long,
    val paymentCount: Int,
    val annualAccumulated: Long?,
    val currentTierName: String?,
)

data class DashboardCategorySummaryResponse(
    val categoryId: Long,
    val categoryName: String,
    val spentAmount: Long,
    val benefitAmount: Long,
    val paymentCount: Int,
    val sharePercent: Double,
)

data class DashboardTagSummaryResponse(
    val tagId: Long,
    val tagName: String,
    val spentAmount: Long,
    val paymentCount: Int,
    val sharePercent: Double,
)

data class DashboardTrendPointResponse(
    val yearMonth: String,
    val totalSpent: Long,
    val totalBenefit: Long,
    val paymentCount: Int,
)

data class TagCrossSelectionResponse(
    val tagId: Long,
    val tagName: String,
)

data class TagCrossBreakdownResponse(
    val label: String,
    val amount: Long,
    val paymentCount: Int,
)

data class TagCrossStatsResponse(
    val crossType: String,
    val selectedTags: List<TagCrossSelectionResponse>,
    val totalSpent: Long,
    val paymentCount: Int,
    val breakdown: List<TagCrossBreakdownResponse>,
)
