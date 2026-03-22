package com.cardwise.card.adapter.`in`.web

import com.cardwise.card.application.port.`in`.CardCommandUseCase
import com.cardwise.card.application.port.`in`.CardQueryUseCase
import com.cardwise.card.application.dto.*
import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@Tag(name = "Card: Management", description = "카드 관리 API: 연동 카드 목록, 신규 카드 등록, 카드 메타데이터(발급사, 브랜드) 관리를 지원합니다.")
@RestController
@RequestMapping("/api/v1")
class CardController(
    private val cardQueryUseCase: CardQueryUseCase,
    private val cardCommandUseCase: CardCommandUseCase,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @Operation(summary = "카드 메타데이터 조회", description = "시스템에서 지원하는 전체 카드사 및 브랜드 리스트를 조회합니다.")
    @SwApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/cards/metadata")
    fun getCardMetadata(): ApiResponse<CardMetadataResponse> =
        cardQueryUseCase.getCardMetadata()

    @Operation(summary = "연동된 사용자 카드 목록 조회", description = "현재 사용자가 서비스에 등록(연동)한 모든 카드 리스트를 조회합니다.")
    @SwApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/user-cards")
    fun listUserCards(
        @Parameter(description = "계정 ID (헤더)") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<List<UserCardResponse>> =
        cardQueryUseCase.listUserCards(requestAccountIdResolver.resolve(accountIdHeader))

    @Operation(summary = "카드 간편 등록", description = "카드 ID와 발급일만으로 카드를 시스템에 등록합니다.")
    @SwApiResponse(responseCode = "201", description = "등록 성공")
    @PostMapping("/user-cards")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCard(
        @Parameter(description = "계정 ID (헤더)") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardRequest
    ): ApiResponse<UserCardResponse> =
        cardCommandUseCase.registerCard(requestAccountIdResolver.resolve(accountIdHeader), request)

    @Operation(summary = "카드 상세 정보 등록", description = "카드 번호, 유효 기간 등 상세 정보를 포함하여 카드를 등록합니다.")
    @SwApiResponse(responseCode = "201", description = "등록 성공")
    @PostMapping("/user-cards/detailed")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerCardDetailed(
        @Parameter(description = "계정 ID (헤더)") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: RegisterCardDetailedRequest
    ): ApiResponse<UserCardResponse> =
        cardCommandUseCase.registerCardDetailed(requestAccountIdResolver.resolve(accountIdHeader), request)

    @Operation(summary = "카드 해지(비활성화)", description = "등록된 카드를 비활성화 처리하여 목록에서 제외합니다.")
    @SwApiResponse(responseCode = "200", description = "해지 성공")
    @DeleteMapping("/user-cards/{userCardId}")
    fun deactivateUserCard(
        @Parameter(description = "해지할 사용자 카드 ID") @PathVariable userCardId: Long,
        @Parameter(description = "계정 ID (헤더)") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Unit> {
        cardCommandUseCase.deactivateUserCard(requestAccountIdResolver.resolve(accountIdHeader), userCardId)
        return ApiResponse(data = Unit)
    }
}
