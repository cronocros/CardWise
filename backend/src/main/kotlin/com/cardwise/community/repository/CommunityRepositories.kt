package com.cardwise.community.repository

import com.cardwise.community.entity.CommunityPostEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CommunityPostRepository : JpaRepository<CommunityPostEntity, Long> {
    fun findAllByDeletedAtIsNullOrderByCreatedAtDesc(): List<CommunityPostEntity>
    fun findAllByAccountIdAndDeletedAtIsNullOrderByCreatedAtDesc(accountId: UUID): List<CommunityPostEntity>
}

@Repository
interface CommunityCommentRepository : JpaRepository<com.cardwise.community.entity.CommunityCommentEntity, Long> {
    fun findAllByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(postId: Long): List<com.cardwise.community.entity.CommunityCommentEntity>
}

@Repository
interface CommunityPostLikeRepository : JpaRepository<com.cardwise.community.entity.CommunityPostLikeEntity, Long> {
    fun findByPostIdAndAccountId(postId: Long, accountId: UUID): com.cardwise.community.entity.CommunityPostLikeEntity?
    fun countByPostId(postId: Long): Long
}

@Repository
interface CommunityPostBookmarkRepository : JpaRepository<com.cardwise.community.entity.CommunityPostBookmarkEntity, Long> {
    fun findByPostIdAndAccountId(postId: Long, accountId: UUID): com.cardwise.community.entity.CommunityPostBookmarkEntity?
    fun countByPostId(postId: Long): Long
}
