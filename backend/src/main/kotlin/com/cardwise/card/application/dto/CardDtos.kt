package com.cardwise.card.application.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDate

@Schema(description = "카드 간편 등록 요청")
data class RegisterCardRequest(
    @field:Schema(description = "원본 카드 ID (템플릿 ID)")
    @field:NotNull
    val cardId: Long,
    @field:Schema(description = "카드 발급일")
    @field:NotNull
    val issuedAt: LocalDate,
    @field:Schema(description = "카드 별칭 (필수 아님)")
    val nickname: String? = null
)

@Schema(description = "카드 상세 정보 등록 요청")
data class RegisterCardDetailedRequest(
    @field:Schema(description = "카드 별칭")
    @field:NotBlank
    val cardNickname: String,
    @field:Schema(description = "카드사 ID")
    @field:NotBlank
    val issuerId: String,
    @field:Schema(description = "카드 브랜드 ID")
    @field:NotBlank
    val brandId: String,
    @field:Schema(description = "카드 유형 (CREDIT, DEBIT)")
    @field:NotBlank
    val cardType: String,
    @field:Schema(description = "카드 번호 앞 4자리")
    val cardNumberFirstFour: String? = null,
    @field:Schema(description = "카드 번호 뒤 4자리")
    val cardNumberLastFour: String? = null,
    @field:Schema(description = "유효 월")
    val expiryMonth: String? = null,
    @field:Schema(description = "유효 년")
    val expiryYear: String? = null,
    @field:Schema(description = "월간 목표 금액")
    val monthlyTargetAmount: Long = 300000,
    @field:Schema(description = "연간 목표 금액")
    val annualTargetAmount: Long = 10000000,
    @field:Schema(description = "알림 설정 여부")
    val isNotificationEnabled: Boolean = true,
    @field:Schema(description = "대표 카드 설정 여부")
    val isMain: Boolean = false,
    @field:Schema(description = "즐겨찾기 카드 여부")
    val isPinned: Boolean = false,
    @field:Schema(description = "카드 부가 기능 정보")
    val features: Map<String, Any>? = null,
    @field:Schema(description = "카드 이미지 URL")
    val imageUrl: String? = null
)

@Schema(description = "카드 정보 응답")
data class UserCardResponse(
    val userCardId: Long,
    val cardId: Long?,
    val cardName: String,
    val cardNickname: String?,
    val issuerName: String,
    val brandName: String,
    val imageUrl: String?,
    val monthlyTargetAmount: Long,
    val isMain: Boolean,
    val isPinned: Boolean,
    val features: Map<String, Any>? = null
)

@Schema(description = "카드사 정보")
data class CardIssuerResponse(
    val issuerId: String,
    val name: String,
    val logoUrl: String?
)

@Schema(description = "카드 브랜드 정보")
data class CardBrandResponse(
    val brandId: String,
    val name: String,
    val logoUrl: String?
)

@Schema(description = "시스템 보유 카드 메타데이터 목록")
data class CardMetadataResponse(
    val issuers: List<CardIssuerResponse>,
    val brands: List<CardBrandResponse>
)
