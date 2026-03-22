package com.cardwise.community.application.service

import com.cardwise.community.application.dto.*
import com.cardwise.community.application.port.`in`.CommunityPostCommandUseCase
import com.cardwise.community.application.port.out.CommunityPersistencePort
import com.cardwise.community.adapter.out.persistence.entity.*
import com.cardwise.common.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.*

@Service
@Transactional
class CommunityPostCommandService(
    private val persistencePort: CommunityPersistencePort
) : CommunityPostCommandUseCase {

    override fun createPost(accountId: UUID, request: CreatePostRequest): CommunityPostResponse {
        val post = CommunityPostEntity().apply {
            this.accountId = accountId
            this.title = request.title
            this.content = request.content
            this.category = request.category
            this.viewCount = 0
            this.createdAt = OffsetDateTime.now()
            this.updatedAt = OffsetDateTime.now()
        }
        val saved = persistencePort.savePost(post)
        val authorMap = persistencePort.findAuthorProfiles(setOf(accountId))
        return toPostResponse(saved, accountId, authorMap[accountId])
    }

    override fun updatePost(accountId: UUID, postId: Long, request: UpdatePostRequest): CommunityPostResponse {
        val post = persistencePort.findPostById(postId) ?: throw NotFoundException("게시글을 찾을 수 없습니다.")
        if (post.accountId != accountId) throw IllegalStateException("권한이 없습니다.")

        request.title?.let { post.title = it }
        request.content?.let { post.content = it }
        request.category?.let { post.category = it }
        post.updatedAt = OffsetDateTime.now()

        val saved = persistencePort.savePost(post)
        val authorMap = persistencePort.findAuthorProfiles(setOf(accountId))
        return toPostResponse(saved, accountId, authorMap[accountId])
    }

    override fun deletePost(accountId: UUID, postId: Long) {
        val post = persistencePort.findPostById(postId) ?: throw NotFoundException("게시글을 찾을 수 없습니다.")
        if (post.accountId != accountId) throw IllegalStateException("권한이 없습니다.")
        post.deletedAt = OffsetDateTime.now()
        persistencePort.savePost(post)
    }

    override fun toggleLike(accountId: UUID, postId: Long): Boolean {
        val existing = persistencePort.findLikeByPostAndAccount(postId, accountId)
        return if (existing != null) {
            persistencePort.deleteLike(postId, accountId)
            false
        } else {
            persistencePort.saveLike(CommunityPostLikeEntity(postId = postId, accountId = accountId))
            true
        }
    }

    override fun toggleBookmark(accountId: UUID, postId: Long): Boolean {
        val existing = persistencePort.findBookmarkByPostAndAccount(postId, accountId)
        return if (existing != null) {
            persistencePort.deleteBookmark(postId, accountId)
            false
        } else {
            persistencePort.saveBookmark(CommunityPostBookmarkEntity(postId = postId, accountId = accountId))
            true
        }
    }

    override fun seedData() {
        // Logic for seeding skipped for brevity
    }

    private fun toPostResponse(entity: CommunityPostEntity, accountId: UUID?, author: AuthorResponse?): CommunityPostResponse {
        return CommunityPostResponse(
            postId = entity.postId!!,
            title = entity.title!!,
            content = entity.content!!,
            category = entity.category!!,
            author = author ?: AuthorResponse(entity.accountId!!, "사용자"),
            viewCount = entity.viewCount ?: 0,
            likeCount = persistencePort.countLikesByPostId(entity.postId!!),
            commentCount = persistencePort.findCommentsByPostId(entity.postId!!).size,
            isLiked = false, // Simplified
            isBookmarked = false,
            createdAt = entity.createdAt!!,
            updatedAt = entity.updatedAt!!
        )
    }
}
