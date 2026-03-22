package com.cardwise.community.application.service

import com.cardwise.community.application.dto.*
import com.cardwise.community.application.port.`in`.CommunityCommentCommandUseCase
import com.cardwise.community.application.port.out.CommunityPersistencePort
import com.cardwise.community.adapter.out.persistence.entity.CommunityCommentEntity
import com.cardwise.common.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
@Transactional
class CommunityCommentCommandService(
    private val persistencePort: CommunityPersistencePort
) : CommunityCommentCommandUseCase {

    override fun createComment(accountId: UUID, request: CreateCommentRequest): CommentResponse {
        val post = persistencePort.findPostById(request.postId) ?: throw NotFoundException("게시글을 찾을 수 없습니다.")

        val comment = CommunityCommentEntity().apply {
            this.postId = request.postId
            this.accountId = accountId
            this.content = request.content
            this.createdAt = OffsetDateTime.now()
        }
        val saved = persistencePort.saveComment(comment)
        val authorMap = persistencePort.findAuthorProfiles(setOf(accountId))
        return toCommentResponse(saved, authorMap[accountId])
    }

    override fun deleteComment(accountId: UUID, commentId: Long) {
        val comment = persistencePort.findCommentById(commentId) ?: throw NotFoundException("댓글을 찾을 수 없습니다.")
        if (comment.accountId != accountId) throw IllegalStateException("권한이 없습니다.")
        comment.deletedAt = OffsetDateTime.now()
        persistencePort.saveComment(comment)
    }

    private fun toCommentResponse(entity: CommunityCommentEntity, author: AuthorResponse?): CommentResponse {
        return CommentResponse(
            commentId = entity.commentId!!,
            postId = entity.postId!!,
            author = author ?: AuthorResponse(entity.accountId!!, "사용자"),
            content = entity.content ?: "",
            createdAt = entity.createdAt ?: OffsetDateTime.now()
        )
    }
}
