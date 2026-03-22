package com.cardwise.support.application.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.support.dto.FaqResponse
import com.cardwise.support.dto.InquiryRequest
import com.cardwise.support.dto.InquiryResponse
import com.cardwise.support.dto.NoticeResponse

interface SupportUseCase {
    fun listNotices(page: Int, size: Int): ApiResponse<List<NoticeResponse>>
    fun listFaqs(page: Int, size: Int): ApiResponse<List<FaqResponse>>
    fun listMyInquiries(accountId: String, page: Int, size: Int): ApiResponse<List<InquiryResponse>>
    fun createInquiry(accountId: String, request: InquiryRequest): ApiResponse<InquiryResponse>
}
