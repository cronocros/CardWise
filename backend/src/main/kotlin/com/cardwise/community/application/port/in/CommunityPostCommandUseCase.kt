package com.cardwise.community.application.port.`in`

import com.cardwise.community.application.dto.*
import java.util.UUID

interface CommunityPostCommandUseCase {
    fun createPost(accountId: UUID, request: CreatePostRequest): PostResponse
    fun updatePost(accountId: UUID, postId: Long, request: UpdatePostRequest): PostResponse
    fun deletePost(accountId: UUID, postId: Long)
    fun toggleLike(accountId: UUID, postId: Long): Boolean
    fun toggleBookmark(accountId: UUID, postId: Long): Boolean
    fun seedData()
}
