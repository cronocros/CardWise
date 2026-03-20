package com.cardwise.community.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.community.application.CommunityCommentService
import com.cardwise.community.application.CommunityPostService
import com.cardwise.community.dto.*
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/community")
class CommunityController(
    private val postService: CommunityPostService,
    private val commentService: CommunityCommentService,
    private val requestAccountIdResolver: RequestAccountIdResolver
) {
    @GetMapping("/posts")
    fun listPosts(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false) category: String?
    ): ApiResponse<List<PostResponse>> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.listPosts(accountId, category)
    }

    @GetMapping("/posts/{postId}")
    fun getPost(
        @PathVariable postId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<PostResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.getPost(postId, accountId)
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    fun createPost(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreatePostRequest
    ): ApiResponse<PostResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.createPost(accountId, request)
    }

    @PatchMapping("/posts/{postId}")
    fun updatePost(
        @PathVariable postId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: UpdatePostRequest
    ): ApiResponse<PostResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.updatePost(postId, accountId, request)
    }

    @DeleteMapping("/posts/{postId}")
    fun deletePost(
        @PathVariable postId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Unit> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.deletePost(postId, accountId)
    }

    @PostMapping("/posts/{postId}/like")
    fun toggleLike(
        @PathVariable postId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<ReactionResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.toggleLike(postId, accountId)
    }

    @PostMapping("/posts/{postId}/bookmark")
    fun toggleBookmark(
        @PathVariable postId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<ReactionResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return postService.toggleBookmark(postId, accountId)
    }

    @GetMapping("/posts/{postId}/comments")
    fun listComments(@PathVariable postId: Long): ApiResponse<List<CommentResponse>> {
        return commentService.listComments(postId)
    }

    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    fun createComment(
        @PathVariable postId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreateCommentRequest
    ): ApiResponse<CommentResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return commentService.createComment(postId, accountId, request)
    }

    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(
        @PathVariable commentId: Long,
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Unit> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        return commentService.deleteComment(commentId, accountId)
    }
}
