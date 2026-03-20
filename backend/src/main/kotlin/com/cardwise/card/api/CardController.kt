package com.cardwise.card.api

import com.cardwise.card.application.CardService
import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/my-cards")
class CardController(
    private val cardService: CardService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    /** 내 카드 목록 조회 */
    @GetMapping
    fun listMyCards(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<UserCardSummaryResponse>> {
        return cardService.listMyCards(requestAccountIdResolver.resolve(accountIdHeader))
    }

    /** 내 카드 상세 조회 */
    @GetMapping("/{userCardId}")
    fun getMyCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.getMyCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId)
    }

    /** 카드 등록 */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCard(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardRequest,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.registerCard(requestAccountIdResolver.resolve(accountIdHeader), request)
    }

    /** 카드 별칭/발급일 수정 */
    @PatchMapping("/{userCardId}")
    fun updateCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: UpdateCardRequest,
    ): ApiResponse<UserCardDetailResponse> {
        return cardService.updateCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId, request)
    }

    /** 카드 삭제 (비활성화) */
    @DeleteMapping("/{userCardId}")
    fun deleteCard(
        @PathVariable userCardId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<DeleteCardResponse> {
        return cardService.deleteCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId)
    }
}
