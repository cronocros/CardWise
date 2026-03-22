package com.cardwise.support.entity

import jakarta.persistence.*
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "notice")
class Notice(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    val noticeId: Long? = null,

    @Column(nullable = false)
    val title: String,

    @Column(nullable = false)
    val content: String,

    @Column(name = "is_critical")
    val isCritical: Boolean = false,

    @Column(name = "view_count")
    val viewCount: Int = 0,

    @Column(name = "created_at")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "deleted_at")
    val deletedAt: OffsetDateTime? = null
)

@Entity
@Table(name = "faq")
class Faq(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_id")
    val faqId: Long? = null,

    @Column(nullable = false)
    val category: String,

    @Column(nullable = false)
    val question: String,

    @Column(nullable = false, length = 2000)
    val answer: String,

    @Column(nullable = false)
    val priority: Int = 0,

    @Column(name = "created_at")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: OffsetDateTime = OffsetDateTime.now()
)

@Entity
@Table(name = "inquiry")
class Inquiry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    val inquiryId: Long? = null,

    @Column(name = "account_id", nullable = false)
    val accountId: UUID,

    @Column(name = "category", nullable = false)
    val inquiryCategory: String,

    @Column(nullable = false)
    val title: String,

    @Column(nullable = false, length = 2000)
    val content: String,

    @Column(length = 2000)
    val answer: String? = null,

    @Column(nullable = false)
    val status: String = "PENDING",

    @Column(name = "created_at")
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "answered_at")
    val answeredAt: OffsetDateTime? = null,

    @Column(name = "deleted_at")
    val deletedAt: OffsetDateTime? = null
)
