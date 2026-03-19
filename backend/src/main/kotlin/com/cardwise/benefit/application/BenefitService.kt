package com.cardwise.benefit.application

import com.cardwise.benefit.api.BenefitCategoryResponse
import com.cardwise.benefit.api.BenefitRecommendationResponse
import com.cardwise.benefit.api.BenefitSearchItemResponse
import com.cardwise.benefit.api.CardBenefitDetailResponse
import com.cardwise.benefit.infrastructure.BenefitReadRepository
import com.cardwise.benefit.infrastructure.BenefitSearchRow
import com.cardwise.common.exception.NotFoundException
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class BenefitService(
    private val benefitReadRepository: BenefitReadRepository,
) {
    fun getCategories(limit: Int): List<BenefitCategoryResponse> {
        return benefitReadRepository.findCategories(limit).map { row ->
            BenefitCategoryResponse(
                categoryId = row.categoryId,
                categoryName = row.categoryName,
                benefitCount = row.benefitCount,
            )
        }
    }

    fun searchBenefits(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        benefitType: String?,
        myCardsOnly: Boolean,
        limit: Int,
    ): List<BenefitSearchItemResponse> {
        return benefitReadRepository.searchBenefits(
            accountId = accountId,
            query = query,
            categoryId = categoryId,
            benefitType = benefitType?.trim()?.takeIf { it.isNotEmpty() },
            myCardsOnly = myCardsOnly,
            limit = limit.coerceIn(1, 50),
        ).map(::toSearchItemResponse)
    }

    fun getRecommendation(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        merchantName: String?,
        benefitType: String?,
    ): BenefitRecommendationResponse {
        val normalizedQuery = merchantName?.trim()?.takeIf { it.isNotEmpty() } ?: query
        val myCards = searchBenefits(
            accountId = accountId,
            query = normalizedQuery,
            categoryId = categoryId,
            benefitType = benefitType,
            myCardsOnly = true,
            limit = 8,
        )

        if (myCards.isNotEmpty()) {
            val best = myCards.first()
            return BenefitRecommendationResponse(
                scope = "MY_CARDS",
                comparedCount = myCards.size,
                reason = if (best.isEligible) {
                    "현재 보유 카드 중에서 지금 바로 적용 가능한 혜택이 가장 강합니다."
                } else {
                    "보유 카드 기준으로는 이 카드가 가장 유리하지만, 실적을 조금 더 채워야 합니다."
                },
                recommendation = best,
            )
        }

        val allCards = searchBenefits(
            accountId = accountId,
            query = normalizedQuery,
            categoryId = categoryId,
            benefitType = benefitType,
            myCardsOnly = false,
            limit = 8,
        )

        return BenefitRecommendationResponse(
            scope = if (allCards.isEmpty()) "EMPTY" else "ALL_CARDS",
            comparedCount = allCards.size,
            reason = if (allCards.isEmpty()) {
                "조건에 맞는 혜택을 찾지 못했습니다."
            } else {
                "등록 카드에 맞는 추천이 없어 전체 카드 기준 최적 혜택을 보여줍니다."
            },
            recommendation = allCards.firstOrNull(),
        )
    }

    fun getCardBenefits(accountId: UUID, cardId: Long): CardBenefitDetailResponse {
        val header = benefitReadRepository.findCardBenefitHeader(accountId, cardId)
            ?: throw NotFoundException("카드를 찾을 수 없습니다. id=$cardId")
        val benefits = benefitReadRepository.findCardBenefits(accountId, cardId).map(::toSearchItemResponse)

        return CardBenefitDetailResponse(
            cardId = header.cardId,
            cardName = header.cardName,
            cardCompanyName = header.cardCompanyName,
            cardImageUrl = header.cardImageUrl,
            isMyCard = header.userCardId != null,
            userCardId = header.userCardId,
            cardNickname = header.cardNickname,
            currentSpent = header.currentSpent,
            latestPerformanceMonth = header.latestPerformanceMonth,
            benefits = benefits,
        )
    }

    private fun toSearchItemResponse(row: BenefitSearchRow): BenefitSearchItemResponse {
        val matchScore = computeMatchScore(row)
        val benefitTypeLabel = benefitTypeLabel(row.benefitType)
        val targetLabel = row.merchantName ?: row.categoryName ?: "전체 가맹점"
        val benefitLabel = benefitLabel(
            benefitType = row.benefitType,
            discountType = row.discountType,
            discountValue = row.discountValue,
        )

        return BenefitSearchItemResponse(
            cardBenefitId = row.cardBenefitId,
            cardId = row.cardId,
            cardName = row.cardName,
            cardCompanyName = row.cardCompanyName,
            cardImageUrl = row.cardImageUrl,
            benefitType = row.benefitType,
            benefitTypeLabel = benefitTypeLabel,
            discountType = row.discountType,
            discountValue = row.discountValue.toDouble(),
            benefitLabel = benefitLabel,
            targetLabel = targetLabel,
            categoryId = row.categoryId,
            categoryName = row.categoryName,
            merchantId = row.merchantId,
            merchantName = row.merchantName,
            description = row.description,
            monthlyLimitCount = row.monthlyLimitCount,
            monthlyLimitAmount = row.monthlyLimitAmount,
            minPaymentAmount = row.minPaymentAmount,
            performanceTierId = row.performanceTierId,
            tierName = row.tierName,
            requiredPerformanceAmount = row.requiredPerformanceAmount,
            maxPerformanceAmount = row.maxPerformanceAmount,
            isMyCard = row.userCardId != null,
            userCardId = row.userCardId,
            cardNickname = row.cardNickname,
            isEligible = row.userCardId != null && row.isEligible,
            eligibilityLabel = eligibilityLabel(row),
            currentSpent = row.currentSpent,
            latestPerformanceMonth = row.latestPerformanceMonth,
            remainingToEligible = row.remainingToEligible,
            matchScore = matchScore,
        )
    }

    private fun computeMatchScore(row: BenefitSearchRow): Int {
        var score = 52
        if (row.userCardId != null) {
            score += 18
        }
        if (row.userCardId != null && row.isEligible) {
            score += 15
        }

        val discountWeight = when (row.discountType) {
            "RATE" -> row.discountValue.multiply(BigDecimal("2.8"))
            else -> row.discountValue.divide(BigDecimal("2500"), 2, RoundingMode.HALF_UP)
        }
        score += discountWeight.toInt().coerceIn(4, 22)
        if (row.performanceTierId == null) {
            score += 4
        }

        return score.coerceIn(45, 99)
    }

    private fun benefitTypeLabel(benefitType: String): String {
        return when (benefitType) {
            "DISCOUNT" -> "할인"
            "POINT" -> "적립"
            "CASHBACK" -> "캐시백"
            "MILEAGE" -> "마일리지"
            "INTEREST_FREE" -> "무이자"
            else -> benefitType
        }
    }

    private fun benefitLabel(
        benefitType: String,
        discountType: String,
        discountValue: BigDecimal,
    ): String {
        val compactValue = discountValue.stripTrailingZeros().toPlainString()
        return when {
            benefitType == "INTEREST_FREE" && discountType == "FIXED" -> "무이자 ${compactValue}개월"
            benefitType == "INTEREST_FREE" -> "무이자 ${compactValue}%"
            discountType == "RATE" -> "${benefitTypeLabel(benefitType)} ${compactValue}%"
            benefitType == "POINT" -> "적립 ${compactValue}P"
            benefitType == "MILEAGE" -> "적립 ${compactValue}마일"
            else -> "${benefitTypeLabel(benefitType)} ${compactValue}원"
        }
    }

    private fun eligibilityLabel(row: BenefitSearchRow): String {
        if (row.userCardId == null) {
            return "전체 카드 기준"
        }
        if (row.performanceTierId == null) {
            return "실적 조건 없음"
        }
        if (row.isEligible) {
            return "적용 가능"
        }

        val remaining = row.remainingToEligible ?: row.requiredPerformanceAmount
        return if (remaining != null && remaining > 0) {
            "${remaining}원 더 필요"
        } else {
            "실적 미달"
        }
    }
}
