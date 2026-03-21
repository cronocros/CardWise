package com.cardwise.community.application

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.exception.ForbiddenException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.community.application.port.`in`.CommunityCommentUseCase
import com.cardwise.community.dto.CommentResponse
import com.cardwise.community.dto.CreateCommentRequest
import com.cardwise.community.entity.CommunityCommentEntity
import com.cardwise.community.repository.CommunityCommentRepository
import com.cardwise.community.repository.CommunityPostRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

import com.cardwise.community.repository.CommunityAccountRepository

@Service
@Transactional(readOnly = true)
class CommunityCommentService(
    private val commentRepository: CommunityCommentRepository,
    private val postRepository: CommunityPostRepository,
    private val accountRepository: CommunityAccountRepository
) : CommunityCommentUseCase {
    override fun listComments(postId: Long): ApiResponse<List<CommentResponse>> {
        val comments = commentRepository.findAllByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(postId)
        val authorIds = comments.mapNotNull { it.accountId }.distinct()
        val authorMap = accountRepository.findAuthorProfiles(authorIds)

        val topLevelComments = comments.filter { it.parentId == null }
        val replies = comments.filter { it.parentId != null }.groupBy { it.parentId }

        val responses = topLevelComments.map { comment ->
            val topLevelResponse = toCommentResponse(comment, authorMap[comment.accountId])
            val commentReplies = replies[comment.commentId]?.map { reply -> 
                toCommentResponse(reply, authorMap[reply.accountId]) 
            } ?: emptyList()
            
            topLevelResponse.copy(replies = commentReplies)
        }

        return ApiResponse(data = responses)
    }

    @Transactional
    override fun createComment(postId: Long, accountId: UUID, request: CreateCommentRequest): ApiResponse<CommentResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.deletedAt != null) throw NotFoundException("Post deleted")

        val comment = CommunityCommentEntity().apply {
            this.postId = postId
            this.accountId = accountId
            content = request.content
            parentId = request.parentId
            createdAt = OffsetDateTime.now()
            updatedAt = OffsetDateTime.now()
        }
        val saved = commentRepository.save(comment)
        
        val authorMap = accountRepository.findAuthorProfiles(listOf(accountId))
        return ApiResponse(data = toCommentResponse(saved, authorMap[accountId]))
    }

    @Transactional
    override fun deleteComment(commentId: Long, accountId: UUID): ApiResponse<Unit> {
        val comment = commentRepository.findById(commentId).orElseThrow { NotFoundException("Comment not found") }
        if (comment.accountId != accountId) throw ForbiddenException("Only author can delete")

        comment.deletedAt = OffsetDateTime.now()
        commentRepository.save(comment)
        return ApiResponse(data = Unit)
    }

    private fun toCommentResponse(entity: CommunityCommentEntity, author: com.cardwise.community.dto.AuthorResponse?): CommentResponse {
        return CommentResponse(
            commentId = entity.commentId!!,
            postId = entity.postId!!,
            accountId = entity.accountId!!,
            content = entity.content!!,
            parentId = entity.parentId,
            author = author,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }
}
