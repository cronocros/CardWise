package com.cardwise.support.application

import com.cardwise.common.api.ApiResponse
import com.cardwise.support.dto.FaqResponse
import com.cardwise.support.dto.InquiryRequest
import com.cardwise.support.dto.InquiryResponse
import com.cardwise.support.dto.NoticeResponse
import com.cardwise.support.entity.Faq
import com.cardwise.support.entity.Inquiry
import com.cardwise.support.repository.FaqRepository
import com.cardwise.support.repository.InquiryRepository
import com.cardwise.support.repository.NoticeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class SupportService(
    private val noticeRepository: NoticeRepository,
    private val faqRepository: FaqRepository,
    private val inquiryRepository: InquiryRepository
) {
    @Transactional(readOnly = true)
    fun listNotices(page: Int, size: Int): ApiResponse<List<NoticeResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "isCritical", "createdAt"))
        val notices = noticeRepository.findAllByDeletedAtIsNull(pageable)
            .map { NoticeResponse.from(it) }
        return ApiResponse(data = notices.content)
    }

    @Transactional(readOnly = true)
    fun listFaqs(page: Int, size: Int): ApiResponse<List<FaqResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "priority", "createdAt"))
        val faqs = faqRepository.findAll(pageable)
            .map { FaqResponse.from(it) }
        return ApiResponse(data = faqs.content)
    }

    @Transactional(readOnly = true)
    fun listMyInquiries(accountId: String, page: Int, size: Int): ApiResponse<List<InquiryResponse>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val inquiries = inquiryRepository.findAllByAccountIdAndDeletedAtIsNull(UUID.fromString(accountId), pageable)
            .map { InquiryResponse.from(it) }
        return ApiResponse(data = inquiries.content)
    }

    @Transactional
    fun createInquiry(accountId: String, request: InquiryRequest): ApiResponse<InquiryResponse> {
        val inquiry = Inquiry(
            accountId = UUID.fromString(accountId),
            inquiryCategory = request.category,
            title = request.title,
            content = request.content
        )
        val saved = inquiryRepository.save(inquiry)
        return ApiResponse(data = InquiryResponse.from(saved))
    }
}
