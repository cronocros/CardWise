package com.cardwise.card.api

import com.cardwise.card.application.CardService
import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
class CardController(
    private val cardService: CardService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    /** 카드 메타데이터 조회 (카드사, 브랜드) */
    @GetMapping("/cards/metadata")
    fun getCardMetadata(): ApiResponse<CardMetadataResponse> {
        return cardService.getMetadata()
    }

    /** 카드 목록 조회 (필터링 및 검색) */
    @GetMapping("/cards")
    fun getCards(
        @RequestParam(required = false) issuerId: String?,
        @RequestParam(required = false) brandId: String?,
        @RequestParam(required = false) keyword: String?
    ): ApiResponse<List<CardSummaryDto>> {
        return cardService.getCards(issuerId, brandId, keyword)
    }

    /** 내 카드 목록 조회 */
    @GetMapping("/my-cards")
    fun listMyCards(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<UserCardSummaryResponse>> {
        return cardService.listMyCards(requestAccountIdResolver.resolve(accountIdHeader))
    }

    /** 내 카드 상세 조회 */
    @GetMapping("/my-cards/{userCardId}")
    fun getMyCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.getMyCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId)
    }

    /** 카드 기본 등록 (템플릿 기반) */
    @PostMapping("/my-cards")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCard(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardRequest,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.registerCard(requestAccountIdResolver.resolve(accountIdHeader), request)
    }

    /** 카드 상세 등록 (사용자 입력 기반) */
    @PostMapping("/my-cards/detailed")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCardDetailed(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardDetailedRequest,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.registerCardDetailed(requestAccountIdResolver.resolve(accountIdHeader), request)
    }

    /** 카드 수정 */
    @PatchMapping("/my-cards/{userCardId}")
    fun updateCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: UpdateCardRequest,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.updateCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId, request)
    }

    /** 카드 삭제 */
    @DeleteMapping("/my-cards/{userCardId}")
    fun deleteCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<DeleteCardResponse> {
        return cardService.deleteCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId)
    }
}
