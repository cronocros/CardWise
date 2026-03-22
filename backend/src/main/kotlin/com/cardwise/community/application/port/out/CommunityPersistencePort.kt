package com.cardwise.community.application.port.out

import com.cardwise.community.application.dto.*
import com.cardwise.community.adapter.out.persistence.entity.*
import java.util.UUID

interface CommunityPersistencePort {
    fun findAllPosts(category: String?, keyword: String?, limit: Int): List<CommunityPostEntity>
    fun findPostById(postId: Long): CommunityPostEntity?
    fun savePost(post: CommunityPostEntity): CommunityPostEntity
    fun deletePost(postId: Long)
    
    fun findCommentsByPostId(postId: Long): List<CommunityCommentEntity>
    fun findCommentById(commentId: Long): CommunityCommentEntity?
    fun saveComment(comment: CommunityCommentEntity): CommunityCommentEntity
    fun deleteComment(commentId: Long)
    
    fun findLikeByPostAndAccount(postId: Long, accountId: UUID): CommunityPostLikeEntity?
    fun saveLike(like: CommunityPostLikeEntity): CommunityPostLikeEntity
    fun deleteLike(postId: Long, accountId: UUID)
    fun countLikesByPostId(postId: Long): Int
    
    fun findBookmarkByPostAndAccount(postId: Long, accountId: UUID): CommunityPostBookmarkEntity?
    fun saveBookmark(bookmark: CommunityPostBookmarkEntity): CommunityPostBookmarkEntity
    fun deleteBookmark(postId: Long, accountId: UUID)
    fun countBookmarksByPostId(postId: Long): Int
    
    fun findAuthorProfiles(accountIds: Set<UUID>): Map<UUID, AuthorResponse>
}
