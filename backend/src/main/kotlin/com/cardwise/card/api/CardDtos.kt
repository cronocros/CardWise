package com.cardwise.card.api

import java.time.LocalDate

data class RegisterCardRequest(
    val cardId: Long,
    val issuedAt: LocalDate,
    val cardNickname: String? = null,
)

data class RegisterCardDetailedRequest(
    val cardNickname: String,
    val issuerId: String,
    val brandId: String,
    val cardType: String,
    val cardNumberFirstFour: String,
    val cardNumberLastFour: String,
    val expiryMonth: String,
    val expiryYear: String,
    val monthlyTargetAmount: Long,
    val annualTargetAmount: Long,
    val features: List<String>,
    val isNotificationEnabled: Boolean,
    val isMain: Boolean,
    val isPinned: Boolean,
    val imageUrl: String? = null
)

data class CardMetadataResponse(
    val issuers: List<IssuerDto>,
    val brands: List<BrandDto>
)

data class IssuerDto(
    val id: String,
    val name: String,
    val logoUrl: String? = null
)

data class BrandDto(
    val id: String,
    val name: String,
    val logoUrl: String? = null
)

data class CardSummaryDto(
    val cardId: Long,
    val cardName: String,
    val issuerId: String,
    val brandId: String,
    val cardType: String,
    val features: List<String> = emptyList(),
    val imageUrl: String? = null
)

data class UpdateCardRequest(
    val cardNickname: String? = null,
    val issuedAt: LocalDate? = null,
)

data class UserCardSummaryResponse(
    val userCardId: Long,
    val cardId: Long?,
    val cardName: String,
    val cardNickname: String?,
    val issuedAt: LocalDate,
    val isActive: Boolean,
    val imageUrl: String? = null
)

data class UserCardDetailResponse(
    val userCardId: Long,
    val cardId: Long?,
    val cardName: String,
    val cardNickname: String?,
    val issuedAt: LocalDate,
    val expiryMonth: String?,
    val expiryYear: String?,
)

data class DeleteCardResponse(
    val userCardId: Long,
    val message: String,
)
