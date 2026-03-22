package com.cardwise.community.application.port.`in`

import com.cardwise.community.application.dto.*
import java.util.UUID

interface CommunityCommentCommandUseCase {
    fun createComment(accountId: UUID, request: CreateCommentRequest): CommentResponse
    fun deleteComment(accountId: UUID, commentId: Long)
}
