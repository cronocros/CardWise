package com.cardwise.community.application

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.exception.ForbiddenException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.community.dto.*
import com.cardwise.community.entity.CommunityCommentEntity
import com.cardwise.community.entity.CommunityPostBookmarkEntity
import com.cardwise.community.entity.CommunityPostEntity
import com.cardwise.community.entity.CommunityPostLikeEntity
import com.cardwise.community.repository.CommunityCommentRepository
import com.cardwise.community.repository.CommunityPostBookmarkRepository
import com.cardwise.community.repository.CommunityPostLikeRepository
import com.cardwise.community.repository.CommunityPostRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CommunityPostService(
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository,
    private val likeRepository: CommunityPostLikeRepository,
    private val bookmarkRepository: CommunityPostBookmarkRepository,
    private val objectMapper: ObjectMapper
) {
    fun listPosts(accountId: UUID, category: String?): ApiResponse<List<PostResponse>> {
        val posts = if (category != null) {
            // TODO: 필터링 구현 (현재는 전체)
            postRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
        } else {
            postRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
        }
        
        val data = posts.map { toPostResponse(it, accountId) }
        return ApiResponse(data = data)
    }

    @Transactional
    fun getPost(postId: Long, accountId: UUID): ApiResponse<PostResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.deletedAt != null) throw NotFoundException("Post deleted")
        
        post.viewCount += 1
        postRepository.save(post)
        
        return ApiResponse(data = toPostResponse(post, accountId))
    }

    @Transactional
    fun createPost(accountId: UUID, request: CreatePostRequest): ApiResponse<PostResponse> {
        val post = CommunityPostEntity().apply {
            this.accountId = accountId
            category = request.category
            title = request.title
            content = request.content
            imageUrl = request.imageUrl
            tags = objectMapper.valueToTree(request.tags)
            createdAt = OffsetDateTime.now()
            updatedAt = OffsetDateTime.now()
        }
        val saved = postRepository.save(post)
        return ApiResponse(data = toPostResponse(saved, accountId))
    }

    @Transactional
    fun updatePost(postId: Long, accountId: UUID, request: UpdatePostRequest): ApiResponse<PostResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.accountId != accountId) throw ForbiddenException("Only author can update")
        
        post.title = request.title
        post.content = request.content
        if (request.imageUrl != null) post.imageUrl = request.imageUrl
        if (request.tags != null) post.tags = objectMapper.valueToTree(request.tags)
        post.updatedAt = OffsetDateTime.now()
        
        val saved = postRepository.save(post)
        return ApiResponse(data = toPostResponse(saved, accountId))
    }

    @Transactional
    fun deletePost(postId: Long, accountId: UUID): ApiResponse<Unit> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.accountId != accountId) throw ForbiddenException("Only author can delete")
        
        post.deletedAt = OffsetDateTime.now()
        postRepository.save(post)
        return ApiResponse(data = Unit)
    }

    @Transactional
    fun toggleLike(postId: Long, accountId: UUID): ApiResponse<ReactionResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        val existing = likeRepository.findByPostIdAndAccountId(postId, accountId)
        
        val active = if (existing != null) {
            likeRepository.delete(existing)
            false
        } else {
            likeRepository.save(CommunityPostLikeEntity().apply {
                this.postId = postId
                this.accountId = accountId
                createdAt = OffsetDateTime.now()
            })
            true
        }
        
        return ApiResponse(data = ReactionResponse(postId, active, likeRepository.countByPostId(postId)))
    }

    @Transactional
    fun toggleBookmark(postId: Long, accountId: UUID): ApiResponse<ReactionResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        val existing = bookmarkRepository.findByPostIdAndAccountId(postId, accountId)
        
        val active = if (existing != null) {
            bookmarkRepository.delete(existing)
            false
        } else {
            bookmarkRepository.save(CommunityPostBookmarkEntity().apply {
                this.postId = postId
                this.accountId = accountId
                createdAt = OffsetDateTime.now()
            })
            true
        }
        
        return ApiResponse(data = ReactionResponse(postId, active, bookmarkRepository.countByPostId(postId)))
    }

    fun toPostResponse(entity: CommunityPostEntity, accountId: UUID): PostResponse {
        val tagsNode = entity.tags
        val tags = if (tagsNode != null && tagsNode.isArray) {
            tagsNode.map { it.asText() }
        } else emptyList()
        
        return PostResponse(
            postId = entity.postId!!,
            accountId = entity.accountId!!,
            category = entity.category!!,
            title = entity.title!!,
            content = entity.content!!,
            imageUrl = entity.imageUrl,
            tags = tags,
            viewCount = entity.viewCount,
            likeCount = likeRepository.countByPostId(entity.postId!!),
            commentCount = commentRepository.findAllByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(entity.postId!!).size.toLong(),
            isLiked = likeRepository.findByPostIdAndAccountId(entity.postId!!, accountId) != null,
            isBookmarked = bookmarkRepository.findByPostIdAndAccountId(entity.postId!!, accountId) != null,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt
        )
    }
}
