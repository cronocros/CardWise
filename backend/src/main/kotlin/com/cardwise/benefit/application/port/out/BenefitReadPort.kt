package com.cardwise.benefit.application.port.out

import com.cardwise.benefit.infrastructure.BenefitCategoryRow
import com.cardwise.benefit.infrastructure.BenefitSearchRow
import com.cardwise.benefit.infrastructure.CardBenefitHeaderRow
import java.util.UUID

interface BenefitReadPort {
    fun findCategories(limit: Int): List<BenefitCategoryRow>
    fun searchBenefits(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        benefitType: String?,
        myCardsOnly: Boolean,
        limit: Int,
    ): List<BenefitSearchRow>
    fun findCardBenefitHeader(accountId: UUID, cardId: Long): CardBenefitHeaderRow?
    fun findCardBenefits(accountId: UUID, cardId: Long): List<BenefitSearchRow>
}
