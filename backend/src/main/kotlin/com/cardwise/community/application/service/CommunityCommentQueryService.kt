package com.cardwise.community.application.service

import com.cardwise.community.application.dto.*
import com.cardwise.community.application.port.`in`.CommunityCommentQueryUseCase
import com.cardwise.community.application.port.out.CommunityPersistencePort
import com.cardwise.community.adapter.out.persistence.entity.CommunityCommentEntity
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CommunityCommentQueryService(
    private val persistencePort: CommunityPersistencePort
) : CommunityCommentQueryUseCase {

    override fun listComments(postId: Long): List<CommentResponse> {
        val comments = persistencePort.findCommentsByPostId(postId)
        if (comments.isEmpty()) return emptyList()

        val authorIds = comments.mapNotNull { it.accountId }.toSet()
        val authorMap = persistencePort.findAuthorProfiles(authorIds)

        return comments.map { toCommentResponse(it, authorMap[it.accountId]) }
    }

    private fun toCommentResponse(entity: CommunityCommentEntity, author: AuthorResponse?): CommentResponse {
        return CommentResponse(
            commentId = entity.commentId!!,
            postId = entity.postId!!,
            author = author ?: AuthorResponse(entity.accountId!!, "사용자"),
            content = entity.content ?: "",
            createdAt = entity.createdAt ?: java.time.OffsetDateTime.now()
        )
    }
}
