package com.cardwise.community.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime
import java.util.UUID

data class AuthorResponse(
    val accountId: UUID,
    val displayName: String?,
    val level: Int,
    val tierName: String?
)

data class CreatePostRequest(
    @field:NotBlank
    val category: String,
    @field:NotBlank
    val title: String,
    @field:NotBlank
    val content: String,
    val imageUrl: String? = null,
    val tags: List<String> = emptyList()
)

data class UpdatePostRequest(
    @field:NotBlank
    val title: String,
    @field:NotBlank
    val content: String,
    val imageUrl: String? = null,
    val tags: List<String>? = null
)

data class PostResponse(
    val postId: Long,
    val accountId: UUID,
    val category: String,
    val title: String,
    val content: String,
    val imageUrl: String?,
    val tags: List<String>,
    val viewCount: Int,
    val likeCount: Long,
    val commentCount: Long,
    val isLiked: Boolean = false,
    val isBookmarked: Boolean = false,
    val author: AuthorResponse? = null,
    val createdAt: OffsetDateTime?,
    val updatedAt: OffsetDateTime?
)

data class CreateCommentRequest(
    @field:NotBlank
    val content: String,
    val parentId: Long? = null
)

data class CommentResponse(
    val commentId: Long,
    val postId: Long,
    val accountId: UUID,
    val content: String,
    val parentId: Long? = null,
    val author: AuthorResponse? = null,
    val replies: List<CommentResponse> = emptyList(),
    val createdAt: OffsetDateTime?,
    val updatedAt: OffsetDateTime?
)

data class ReactionResponse(
    val postId: Long,
    val isActive: Boolean,
    val count: Long
)
