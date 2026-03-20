package com.cardwise.card.api

import java.time.LocalDate

data class RegisterCardRequest(
    val cardId: Long,
    val issuedAt: LocalDate,
    val cardNickname: String? = null,
)

data class UpdateCardRequest(
    val cardNickname: String? = null,
    val issuedAt: LocalDate? = null,
)

data class UserCardSummaryResponse(
    val userCardId: Long,
    val cardId: Long,
    val cardName: String,
    val cardNickname: String?,
    val issuedAt: LocalDate,
    val isActive: Boolean,
)

data class UserCardDetailResponse(
    val userCardId: Long,
    val cardId: Long,
    val cardName: String,
    val cardNickname: String?,
    val issuedAt: LocalDate,
)

data class DeleteCardResponse(
    val userCardId: Long,
    val message: String,
)
