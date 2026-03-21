package com.cardwise.card.api

import com.cardwise.card.application.port.`in`.CardCommandUseCase
import com.cardwise.card.application.port.`in`.CardQueryUseCase
import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
class CardController(
    private val cardQueryUseCase: CardQueryUseCase,
    private val cardCommandUseCase: CardCommandUseCase,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    /** 카드 메타데이터 조회 (카드사, 브랜드) */
    @GetMapping("/cards/metadata")
    fun getCardMetadata(): ApiResponse<CardMetadataResponse> =
        ApiResponse(data = cardQueryUseCase.getMetadata())

    /** 카드 목록 조회 (필터링 및 검색) */
    @GetMapping("/cards")
    fun getCards(
        @RequestParam(required = false) issuerId: String?,
        @RequestParam(required = false) brandId: String?,
        @RequestParam(required = false) keyword: String?,
    ): ApiResponse<List<CardSummaryDto>> =
        ApiResponse(data = cardQueryUseCase.getCards(issuerId, brandId, keyword))

    /** 내 카드 목록 조회 */
    @GetMapping("/my-cards")
    fun listMyCards(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<UserCardSummaryResponse>> =
        ApiResponse(data = cardQueryUseCase.listMyCards(requestAccountIdResolver.resolve(accountIdHeader)))

    /** 내 카드 상세 조회 */
    @GetMapping("/my-cards/{userCardId}")
    fun getMyCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<UserCardDetailResponse> =
        ApiResponse(data = cardQueryUseCase.getMyCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId))

    /** 카드 기본 등록 (템플릿 기반) */
    @PostMapping("/my-cards")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCard(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardRequest,
    ): ApiResponse<UserCardDetailResponse> =
        ApiResponse(data = cardCommandUseCase.registerCard(requestAccountIdResolver.resolve(accountIdHeader), request))

    /** 카드 상세 등록 (사용자 입력 기반) */
    @PostMapping("/my-cards/detailed")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCardDetailed(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardDetailedRequest,
    ): ApiResponse<UserCardDetailResponse> =
        ApiResponse(data = cardCommandUseCase.registerCardDetailed(requestAccountIdResolver.resolve(accountIdHeader), request))

    /** 카드 수정 */
    @PatchMapping("/my-cards/{userCardId}")
    fun updateCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: UpdateCardRequest,
    ): ApiResponse<UserCardDetailResponse> =
        ApiResponse(data = cardCommandUseCase.updateCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId, request))

    /** 카드 삭제 */
    @DeleteMapping("/my-cards/{userCardId}")
    fun deleteCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<DeleteCardResponse> =
        ApiResponse(data = cardCommandUseCase.deleteCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId))
}
