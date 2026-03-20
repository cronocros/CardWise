package com.cardwise.community.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime
import java.util.UUID

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
    val createdAt: OffsetDateTime?,
    val updatedAt: OffsetDateTime?
)

data class CreateCommentRequest(
    @field:NotBlank
    val content: String
)

data class CommentResponse(
    val commentId: Long,
    val postId: Long,
    val accountId: UUID,
    val content: String,
    val createdAt: OffsetDateTime?,
    val updatedAt: OffsetDateTime?
)

data class ReactionResponse(
    val postId: Long,
    val isActive: Boolean,
    val count: Long
)
