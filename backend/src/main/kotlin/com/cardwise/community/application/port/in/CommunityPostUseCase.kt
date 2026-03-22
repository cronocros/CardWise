package com.cardwise.community.application.service.service.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.community.application.dto.CreatePostRequest
import com.cardwise.community.application.dto.PostResponse
import com.cardwise.community.application.dto.ReactionResponse
import com.cardwise.community.application.dto.UpdatePostRequest
import java.util.UUID

interface CommunityPostUseCase {
    fun listPosts(accountId: UUID?, category: String?, page: Int, limit: Int): ApiResponse<List<PostResponse>>
    fun getPost(postId: Long, accountId: UUID?): ApiResponse<PostResponse>
    fun createPost(accountId: UUID, request: CreatePostRequest): ApiResponse<PostResponse>
    fun updatePost(postId: Long, accountId: UUID, request: UpdatePostRequest): ApiResponse<PostResponse>
    fun deletePost(postId: Long, accountId: UUID): ApiResponse<Unit>
    fun toggleLike(postId: Long, accountId: UUID): ApiResponse<ReactionResponse>
    fun toggleBookmark(postId: Long, accountId: UUID): ApiResponse<ReactionResponse>
}
