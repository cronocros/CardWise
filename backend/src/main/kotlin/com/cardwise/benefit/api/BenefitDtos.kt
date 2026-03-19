package com.cardwise.benefit.api

data class BenefitCategoryResponse(
    val categoryId: Long,
    val categoryName: String,
    val benefitCount: Int,
)

data class BenefitSearchItemResponse(
    val cardBenefitId: Long,
    val cardId: Long,
    val cardName: String,
    val cardCompanyName: String,
    val cardImageUrl: String?,
    val benefitType: String,
    val benefitTypeLabel: String,
    val discountType: String,
    val discountValue: Double,
    val benefitLabel: String,
    val targetLabel: String,
    val categoryId: Long?,
    val categoryName: String?,
    val merchantId: Long?,
    val merchantName: String?,
    val description: String?,
    val monthlyLimitCount: Int?,
    val monthlyLimitAmount: Long?,
    val minPaymentAmount: Long?,
    val performanceTierId: Long?,
    val tierName: String?,
    val requiredPerformanceAmount: Long?,
    val maxPerformanceAmount: Long?,
    val isMyCard: Boolean,
    val userCardId: Long?,
    val cardNickname: String?,
    val isEligible: Boolean,
    val eligibilityLabel: String,
    val currentSpent: Long?,
    val latestPerformanceMonth: String?,
    val remainingToEligible: Long?,
    val matchScore: Int,
)

data class BenefitRecommendationResponse(
    val scope: String,
    val comparedCount: Int,
    val reason: String,
    val recommendation: BenefitSearchItemResponse?,
)

data class CardBenefitDetailResponse(
    val cardId: Long,
    val cardName: String,
    val cardCompanyName: String,
    val cardImageUrl: String?,
    val isMyCard: Boolean,
    val userCardId: Long?,
    val cardNickname: String?,
    val currentSpent: Long?,
    val latestPerformanceMonth: String?,
    val benefits: List<BenefitSearchItemResponse>,
)
