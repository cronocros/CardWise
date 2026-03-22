package com.cardwise.support.dto

import com.cardwise.support.entity.Faq
import com.cardwise.support.entity.Inquiry
import com.cardwise.support.entity.Notice
import java.time.OffsetDateTime
import java.util.UUID

data class NoticeResponse(
    val noticeId: Long,
    val title: String,
    val content: String,
    val isCritical: Boolean,
    val viewCount: Int,
    val createdAt: OffsetDateTime
) {
    companion object {
        fun from(entity: Notice) = NoticeResponse(
            noticeId = entity.noticeId!!,
            title = entity.title,
            content = entity.content,
            isCritical = entity.isCritical,
            viewCount = entity.viewCount,
            createdAt = entity.createdAt
        )
    }
}

data class FaqResponse(
    val faqId: Long,
    val category: String,
    val question: String,
    val answer: String,
    val priority: Int,
    val createdAt: OffsetDateTime
) {
    companion object {
        fun from(entity: Faq) = FaqResponse(
            faqId = entity.faqId!!,
            category = entity.category,
            question = entity.question,
            answer = entity.answer,
            priority = entity.priority,
            createdAt = entity.createdAt
        )
    }
}

data class InquiryResponse(
    val inquiryId: Long,
    val accountId: UUID,
    val category: String,
    val title: String,
    val content: String,
    val answer: String?,
    val status: String,
    val createdAt: OffsetDateTime,
    val answeredAt: OffsetDateTime?
) {
    companion object {
        fun from(entity: Inquiry) = InquiryResponse(
            inquiryId = entity.inquiryId!!,
            accountId = entity.accountId,
            category = entity.inquiryCategory,
            title = entity.title,
            content = entity.content,
            answer = entity.answer,
            status = entity.status,
            createdAt = entity.createdAt,
            answeredAt = entity.answeredAt
        )
    }
}

data class InquiryRequest(
    val category: String,
    val title: String,
    val content: String
)
