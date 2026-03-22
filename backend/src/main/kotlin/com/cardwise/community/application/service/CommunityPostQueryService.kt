package com.cardwise.community.application.service

import com.cardwise.community.application.dto.*
import com.cardwise.community.application.port.`in`.CommunityPostQueryUseCase
import com.cardwise.community.application.port.out.CommunityPersistencePort
import com.cardwise.community.adapter.out.persistence.entity.CommunityPostEntity
import com.cardwise.common.exception.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional(readOnly = true)
class CommunityPostQueryService(
    private val persistencePort: CommunityPersistencePort
) : CommunityPostQueryUseCase {

    override fun listPosts(filter: PostFilterRequest): List<CommunityPostResponse> {
        val posts = persistencePort.findAllPosts(filter.category, filter.keyword, filter.limit)
        val authorIds = posts.mapNotNull { it.accountId }.toSet()
        val authorMap = persistencePort.findAuthorProfiles(authorIds)

        return posts.map { toResponse(it, authorMap[it.accountId], filter.accountId) }
    }

    override fun getPost(accountId: UUID, postId: Long): CommunityPostResponse {
        val post = persistencePort.findPostById(postId) ?: throw NotFoundException("게시글을 찾을 수 없습니다.")
        val authorMap = persistencePort.findAuthorProfiles(setOf(post.accountId!!))
        
        // Increase view count
        post.viewCount = (post.viewCount ?: 0) + 1
        persistencePort.savePost(post)

        return toResponse(post, authorMap[post.accountId], accountId)
    }

    private fun toResponse(entity: CommunityPostEntity, author: AuthorResponse?, currentAccountId: UUID?): CommunityPostResponse {
        val isLiked = currentAccountId?.let { 
            persistencePort.findLikeByPostAndAccount(entity.postId!!, it) != null 
        } ?: false
        val isBookmarked = currentAccountId?.let { 
            persistencePort.findBookmarkByPostAndAccount(entity.postId!!, it) != null 
        } ?: false

        return CommunityPostResponse(
            postId = entity.postId!!,
            title = entity.title ?: "제목 없음",
            content = entity.content ?: "",
            category = entity.category ?: "일반",
            author = author ?: AuthorResponse(entity.accountId!!, "알 수 없는 사용자"),
            viewCount = entity.viewCount ?: 0,
            likeCount = persistencePort.countLikesByPostId(entity.postId!!),
            commentCount = persistencePort.findCommentsByPostId(entity.postId!!).size,
            isLiked = isLiked,
            isBookmarked = isBookmarked,
            createdAt = entity.createdAt ?: java.time.OffsetDateTime.now(),
            updatedAt = entity.updatedAt ?: java.time.OffsetDateTime.now()
        )
    }
}
