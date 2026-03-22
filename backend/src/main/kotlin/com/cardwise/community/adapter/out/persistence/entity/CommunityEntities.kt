package com.cardwise.community.adapter.out.persistence.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "community_post")
open class CommunityPostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    var postId: Long? = null,

    @Column(name = "account_id")
    var accountId: UUID? = null,

    @Column(name = "title")
    var title: String? = null,

    @Column(name = "content", columnDefinition = "text")
    var content: String? = null,

    @Column(name = "category")
    var category: String? = null,

    @Column(name = "view_count")
    var viewCount: Int? = 0,

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = OffsetDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: OffsetDateTime? = OffsetDateTime.now(),

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null
)

@Entity
@Table(name = "community_comment")
open class CommunityCommentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    var commentId: Long? = null,

    @Column(name = "post_id")
    var postId: Long? = null,

    @Column(name = "account_id")
    var accountId: UUID? = null,

    @Column(name = "content", columnDefinition = "text")
    var content: String? = null,

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = OffsetDateTime.now(),

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null
)

@Entity
@Table(name = "community_post_like")
open class CommunityPostLikeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var likeId: Long? = null,

    @Column(name = "post_id")
    var postId: Long? = null,

    @Column(name = "account_id")
    var accountId: UUID? = null,

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = OffsetDateTime.now()
)

@Entity
@Table(name = "community_post_bookmark")
open class CommunityPostBookmarkEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var bookmarkId: Long? = null,

    @Column(name = "post_id")
    var postId: Long? = null,

    @Column(name = "account_id")
    var accountId: UUID? = null,

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = OffsetDateTime.now()
)
