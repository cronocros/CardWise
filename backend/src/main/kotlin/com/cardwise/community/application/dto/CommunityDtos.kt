package com.cardwise.community.application.dto

import java.time.OffsetDateTime
import java.util.UUID

data class AuthorResponse(
    val accountId: UUID,
    val nickname: String,
    val profileImageUrl: String? = null
)

data class PostResponse(
    val postId: Long,
    val title: String,
    val content: String,
    val category: String,
    val author: AuthorResponse,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val isLiked: Boolean = false,
    val isBookmarked: Boolean = false,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

// Alias for migration
typealias CommunityPostResponse = PostResponse

data class CreatePostRequest(
    val title: String,
    val content: String,
    val category: String
)

data class UpdatePostRequest(
    val title: String? = null,
    val content: String? = null,
    val category: String? = null
)

data class PostFilterRequest(
    val category: String? = null,
    val keyword: String? = null,
    val accountId: UUID? = null,
    val limit: Int = 20
)

data class CreateCommentRequest(
    val postId: Long,
    val content: String
)

data class CommentResponse(
    val commentId: Long,
    val postId: Long,
    val author: AuthorResponse,
    val content: String,
    val createdAt: OffsetDateTime
)

data class ReactionResponse(
    val active: Boolean,
    val count: Int
)
