package com.cardwise.benefit.api

import com.cardwise.benefit.application.BenefitService
import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1")
class BenefitController(
    private val benefitService: BenefitService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/benefits/search")
    fun searchBenefits(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false, name = "q") query: String?,
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false, name = "type") benefitType: String?,
        @RequestParam(defaultValue = "false") myCardsOnly: Boolean,
        @RequestParam(defaultValue = "20") limit: Int,
    ): ApiResponse<List<BenefitSearchItemResponse>> {
        return ApiResponse(
            data = benefitService.searchBenefits(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                query = query,
                categoryId = categoryId,
                benefitType = benefitType,
                myCardsOnly = myCardsOnly,
                limit = limit,
            ),
        )
    }

    @GetMapping("/benefits/recommend")
    fun recommendBenefit(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false, name = "q") query: String?,
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false) merchantName: String?,
        @RequestParam(required = false, name = "type") benefitType: String?,
    ): ApiResponse<BenefitRecommendationResponse> {
        return ApiResponse(
            data = benefitService.getRecommendation(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                query = query,
                categoryId = categoryId,
                merchantName = merchantName,
                benefitType = benefitType,
            ),
        )
    }

    @GetMapping("/cards/{cardId}/benefits")
    fun getCardBenefits(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable cardId: Long,
    ): ApiResponse<CardBenefitDetailResponse> {
        return ApiResponse(
            data = benefitService.getCardBenefits(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                cardId = cardId,
            ),
        )
    }

    @GetMapping("/categories")
    fun getCategories(
        @RequestParam(defaultValue = "16") limit: Int,
    ): ApiResponse<List<BenefitCategoryResponse>> {
        return ApiResponse(data = benefitService.getCategories(limit.coerceIn(1, 40)))
    }
}
