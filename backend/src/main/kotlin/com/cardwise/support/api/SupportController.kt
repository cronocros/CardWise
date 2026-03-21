package com.cardwise.support.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.support.application.SupportService
import com.cardwise.support.dto.FaqResponse
import com.cardwise.support.dto.InquiryRequest
import com.cardwise.support.dto.InquiryResponse
import com.cardwise.support.dto.NoticeResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/support")
class SupportController(
    private val supportService: SupportService,
    private val requestAccountIdResolver: RequestAccountIdResolver
) {
    @GetMapping("/notices")
    fun listNotices(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ApiResponse<List<NoticeResponse>> {
        return supportService.listNotices(page, size)
    }

    @GetMapping("/faqs")
    fun listFaqs(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): ApiResponse<List<FaqResponse>> {
        return supportService.listFaqs(page, size)
    }

    @GetMapping("/inquiries")
    fun listMyInquiries(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ApiResponse<List<InquiryResponse>> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalArgumentException("Account ID required")
        return supportService.listMyInquiries(accountId.toString(), page, size)
    }

    @PostMapping("/inquiries")
    @ResponseStatus(HttpStatus.CREATED)
    fun createInquiry(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: InquiryRequest
    ): ApiResponse<InquiryResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalArgumentException("Account ID required")
        return supportService.createInquiry(accountId.toString(), request)
    }
}
