package com.cardwise.community.repository

import com.cardwise.community.entity.CommunityPostEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

@Repository
interface CommunityPostRepository : JpaRepository<CommunityPostEntity, Long> {
    fun findAllByDeletedAtIsNull(pageable: Pageable): Page<CommunityPostEntity>
    fun findAllByCategoryAndDeletedAtIsNull(category: String, pageable: Pageable): Page<CommunityPostEntity>
    fun findAllByAccountIdAndDeletedAtIsNull(accountId: UUID, pageable: Pageable): Page<CommunityPostEntity>
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
