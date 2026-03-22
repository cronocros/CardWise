package com.cardwise.community.adapter.`in`.web

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.community.application.port.`in`.CommunityCommentCommandUseCase
import com.cardwise.community.application.port.`in`.CommunityCommentQueryUseCase
import com.cardwise.community.application.port.`in`.CommunityPostCommandUseCase
import com.cardwise.community.application.port.`in`.CommunityPostQueryUseCase
import com.cardwise.community.application.dto.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@Tag(name = "Community", description = "커뮤니티 관련 API")
@RestController
@RequestMapping("/api/v1/community")
class CommunityController(
    private val postCommandUseCase: CommunityPostCommandUseCase,
    private val postQueryUseCase: CommunityPostQueryUseCase,
    private val commentCommandUseCase: CommunityCommentCommandUseCase,
    private val commentQueryUseCase: CommunityCommentQueryUseCase,
    private val requestAccountIdResolver: RequestAccountIdResolver
) {
    @Operation(summary = "게시글 목록 조회")
    @GetMapping("/posts")
    fun listPosts(
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Parameter(description = "카테고리 필터") @RequestParam(required = false) category: String?,
        @Parameter(description = "검색어 필터") @RequestParam(required = false) keyword: String?,
        @Parameter(description = "조회 제한 개수") @RequestParam(defaultValue = "10") limit: Int
    ): ApiResponse<List<CommunityPostResponse>> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader)
        val filter = PostFilterRequest(category = category, keyword = keyword, accountId = accountId, limit = limit)
        return ApiResponse(data = postQueryUseCase.listPosts(filter))
    }

    @Operation(summary = "게시글 상세 조회")
    @GetMapping("/posts/{postId}")
    fun getPost(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<CommunityPostResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        return ApiResponse(data = postQueryUseCase.getPost(accountId, postId))
    }

    @Operation(summary = "게시글 작성")
    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    fun createPost(
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreatePostRequest
    ): ApiResponse<CommunityPostResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        return ApiResponse(data = postCommandUseCase.createPost(accountId, request))
    }

    @Operation(summary = "게시글 수정")
    @PatchMapping("/posts/{postId}")
    fun updatePost(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: UpdatePostRequest
    ): ApiResponse<CommunityPostResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        return ApiResponse(data = postCommandUseCase.updatePost(accountId, postId, request))
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/posts/{postId}")
    fun deletePost(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Unit> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        postCommandUseCase.deletePost(accountId, postId)
        return ApiResponse(data = Unit)
    }

    @Operation(summary = "게시글 좋아요 토글")
    @PostMapping("/posts/{postId}/like")
    fun toggleLike(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Boolean> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        return ApiResponse(data = postCommandUseCase.toggleLike(accountId, postId))
    }

    @Operation(summary = "게시글 북마크 토글")
    @PostMapping("/posts/{postId}/bookmark")
    fun toggleBookmark(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Boolean> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        return ApiResponse(data = postCommandUseCase.toggleBookmark(accountId, postId))
    }

    @Operation(summary = "댓글 목록 조회")
    @GetMapping("/posts/{postId}/comments")
    fun listComments(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long
    ): ApiResponse<List<CommentResponse>> {
        return ApiResponse(data = commentQueryUseCase.listComments(postId))
    }

    @Operation(summary = "댓글 작성")
    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    fun createComment(
        @Parameter(description = "게시글 ID") @PathVariable postId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreateCommentRequest
    ): ApiResponse<CommentResponse> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        return ApiResponse(data = commentCommandUseCase.createComment(accountId, request))
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(
        @Parameter(description = "댓글 ID") @PathVariable commentId: Long,
        @Parameter(description = "계정 ID 헤더") @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?
    ): ApiResponse<Unit> {
        val accountId = requestAccountIdResolver.resolve(accountIdHeader) ?: throw IllegalStateException("계정 정보가 필요합니다.")
        commentCommandUseCase.deleteComment(accountId, commentId)
        return ApiResponse(data = Unit)
    }
}
