package com.cardwise.community.application.port.`in`

import com.cardwise.community.application.dto.*
import java.util.UUID

interface CommunityPostQueryUseCase {
    fun listPosts(filter: PostFilterRequest): List<PostResponse>
    fun getPost(accountId: UUID, postId: Long): PostResponse
}
