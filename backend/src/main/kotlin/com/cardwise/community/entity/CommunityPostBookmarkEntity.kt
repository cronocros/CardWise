package com.cardwise.community.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "community_post_bookmark")
open class CommunityPostBookmarkEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookmark_id")
    var bookmarkId: Long? = null

    @Column(name = "post_id", nullable = false)
    var postId: Long? = null

    @Column(name = "account_id", nullable = false)
    var accountId: UUID? = null

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = null
}
