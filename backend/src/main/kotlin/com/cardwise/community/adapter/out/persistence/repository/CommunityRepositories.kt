package com.cardwise.community.adapter.out.persistence.repository

import com.cardwise.community.adapter.out.persistence.entity.*
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface CommunityPostRepository : JpaRepository<CommunityPostEntity, Long> {
    fun findAllByCategoryAndDeletedAtIsNullOrderByCreatedAtDesc(category: String): List<CommunityPostEntity>
    fun findAllByTitleContainingIgnoreCaseAndDeletedAtIsNullOrderByCreatedAtDesc(keyword: String): List<CommunityPostEntity>
    fun findAllByDeletedAtIsNullOrderByCreatedAtDesc(): List<CommunityPostEntity>
}

interface CommunityCommentRepository : JpaRepository<CommunityCommentEntity, Long> {
    fun findAllByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(postId: Long): List<CommunityCommentEntity>
}

interface CommunityPostLikeRepository : JpaRepository<CommunityPostLikeEntity, Long> {
    fun findByPostIdAndAccountId(postId: Long, accountId: UUID): CommunityPostLikeEntity?
    fun deleteByPostIdAndAccountId(postId: Long, accountId: UUID)
    fun countByPostId(postId: Long): Long
}

interface CommunityPostBookmarkRepository : JpaRepository<CommunityPostBookmarkEntity, Long> {
    fun findByPostIdAndAccountId(postId: Long, accountId: UUID): CommunityPostBookmarkEntity?
    fun deleteByPostIdAndAccountId(postId: Long, accountId: UUID)
    fun countByPostId(postId: Long): Long
}
