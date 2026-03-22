package com.cardwise.community.application.port.`in`

import com.cardwise.community.application.dto.*
import java.util.UUID

interface CommunityCommentQueryUseCase {
    fun listComments(postId: Long): List<CommentResponse>
}
