package com.cardwise.benefit.application.port.`in`

import com.cardwise.benefit.api.BenefitCategoryResponse
import com.cardwise.benefit.api.BenefitRecommendationResponse
import com.cardwise.benefit.api.BenefitSearchItemResponse
import com.cardwise.benefit.api.CardBenefitDetailResponse
import java.util.UUID

interface BenefitQueryUseCase {
    fun getCategories(limit: Int): List<BenefitCategoryResponse>
    fun searchBenefits(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        benefitType: String?,
        myCardsOnly: Boolean,
        limit: Int,
    ): List<BenefitSearchItemResponse>
    fun getRecommendation(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        merchantName: String?,
        benefitType: String?,
    ): BenefitRecommendationResponse
    fun getCardBenefits(accountId: UUID, cardId: Long): CardBenefitDetailResponse
}
