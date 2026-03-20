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
@Table(name = "community_comment")
open class CommunityCommentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    var commentId: Long? = null

    @Column(name = "post_id", nullable = false)
    var postId: Long? = null

    @Column(name = "account_id", nullable = false)
    var accountId: UUID? = null

    @Column(name = "content", nullable = false)
    var content: String? = null

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = null

    @Column(name = "updated_at")
    var updatedAt: OffsetDateTime? = null

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null
}
