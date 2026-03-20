package com.cardwise.community.application

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.exception.ForbiddenException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.community.dto.CommentResponse
import com.cardwise.community.dto.CreateCommentRequest
import com.cardwise.community.entity.CommunityCommentEntity
import com.cardwise.community.repository.CommunityCommentRepository
import com.cardwise.community.repository.CommunityPostRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CommunityCommentService(
    private val commentRepository: CommunityCommentRepository,
    private val postRepository: CommunityPostRepository
) {
    fun listComments(postId: Long): ApiResponse<List<CommentResponse>> {
        val comments = commentRepository.findAllByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(postId)
        return ApiResponse(data = comments.map(::toCommentResponse))
    }

    @Transactional
    fun createComment(postId: Long, accountId: UUID, request: CreateCommentRequest): ApiResponse<CommentResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.deletedAt != null) throw NotFoundException("Post deleted")

        val comment = CommunityCommentEntity().apply {
            this.postId = postId
            this.accountId = accountId
            content = request.content
            createdAt = OffsetDateTime.now()
            updatedAt = OffsetDateTime.now()
        }
        val saved = commentRepository.save(comment)
        return ApiResponse(data = toCommentResponse(saved))
    }

    @Transactional
    fun deleteComment(commentId: Long, accountId: UUID): ApiResponse<Unit> {
        val comment = commentRepository.findById(commentId).orElseThrow { NotFoundException("Comment not found") }
        if (comment.accountId != accountId) throw ForbiddenException("Only author can delete")

        comment.deletedAt = OffsetDateTime.now()
        commentRepository.save(comment)
        return ApiResponse(data = Unit)
    }

    private fun toCommentResponse(entity: CommunityCommentEntity): CommentResponse {
        return CommentResponse(
            commentId = entity.commentId!!,
            postId = entity.postId!!,
            accountId = entity.accountId!!,
            content = entity.content!!,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }
}
