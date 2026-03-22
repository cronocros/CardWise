package com.cardwise.community.adapter.out.persistence

import com.cardwise.community.application.port.out.CommunityPersistencePort
import com.cardwise.community.application.dto.*
import com.cardwise.community.adapter.out.persistence.entity.*
import com.cardwise.community.adapter.out.persistence.repository.*
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class CommunityPersistenceAdapter(
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository,
    private val likeRepository: CommunityPostLikeRepository,
    private val bookmarkRepository: CommunityPostBookmarkRepository,
    private val accountRepository: CommunityAccountRepository
) : CommunityPersistencePort {

    override fun findAllPosts(category: String?, keyword: String?, limit: Int): List<CommunityPostEntity> {
        return if (category != null) {
            postRepository.findAllByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(category)
        } else if (keyword != null) {
            postRepository.findAllByTitleContainingIgnoreCaseAndDeletedAtIsNullOrderByCreatedAtDesc(keyword)
        } else {
            postRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
        }
    }

    override fun findPostById(postId: Long): CommunityPostEntity? = postRepository.findById(postId).orElse(null)

    override fun savePost(post: CommunityPostEntity): CommunityPostEntity = postRepository.save(post)

    override fun deletePost(postId: Long) = postRepository.deleteById(postId)

    override fun findCommentsByPostId(postId: Long): List<CommunityCommentEntity> = commentRepository.findAllByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(postId)

    override fun findCommentById(commentId: Long): CommunityCommentEntity? = commentRepository.findById(commentId).orElse(null)

    override fun saveComment(comment: CommunityCommentEntity): CommunityCommentEntity = commentRepository.save(comment)

    override fun deleteComment(commentId: Long) = commentRepository.deleteById(commentId)

    override fun findLikeByPostAndAccount(postId: Long, accountId: UUID): CommunityPostLikeEntity? =
        likeRepository.findByPostIdAndAccountId(postId, accountId)

    override fun saveLike(like: CommunityPostLikeEntity): CommunityPostLikeEntity = likeRepository.save(like)

    override fun deleteLike(postId: Long, accountId: UUID) {
        likeRepository.deleteByPostIdAndAccountId(postId, accountId)
    }

    override fun countLikesByPostId(postId: Long): Int = likeRepository.countByPostId(postId).toInt()

    override fun findBookmarkByPostAndAccount(postId: Long, accountId: UUID): CommunityPostBookmarkEntity? =
        bookmarkRepository.findByPostIdAndAccountId(postId, accountId)

    override fun saveBookmark(bookmark: CommunityPostBookmarkEntity): CommunityPostBookmarkEntity = bookmarkRepository.save(bookmark)

    override fun deleteBookmark(postId: Long, accountId: UUID) {
        bookmarkRepository.deleteByPostIdAndAccountId(postId, accountId)
    }

    override fun countBookmarksByPostId(postId: Long): Int = bookmarkRepository.countByPostId(postId).toInt()

    override fun findAuthorProfiles(accountIds: Set<UUID>): Map<UUID, AuthorResponse> {
        return accountRepository.findAuthorProfiles(accountIds)
    }
}
