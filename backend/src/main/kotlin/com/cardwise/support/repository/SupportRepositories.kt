package com.cardwise.support.repository

import com.cardwise.support.entity.Faq
import com.cardwise.support.entity.Inquiry
import com.cardwise.support.entity.Notice
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface NoticeRepository : JpaRepository<Notice, Long> {
    fun findAllByDeletedAtIsNull(pageable: Pageable): Page<Notice>
}

@Repository
interface FaqRepository : JpaRepository<Faq, Long>

@Repository
interface InquiryRepository : JpaRepository<Inquiry, Long> {
    fun findAllByAccountIdAndDeletedAtIsNull(accountId: UUID, pageable: Pageable): Page<Inquiry>
}
