package com.cardwise.community.application.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.community.dto.CommentResponse
import com.cardwise.community.dto.CreateCommentRequest
import java.util.UUID

interface CommunityCommentUseCase {
    fun listComments(postId: Long): ApiResponse<List<CommentResponse>>
    fun createComment(postId: Long, accountId: UUID, request: CreateCommentRequest): ApiResponse<CommentResponse>
    fun deleteComment(commentId: Long, accountId: UUID): ApiResponse<Unit>
}
