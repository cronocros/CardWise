package com.cardwise.ledger.repository

import com.cardwise.ledger.entity.PendingActionEntity
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PendingActionRepository : JpaRepository<PendingActionEntity, Long> {
    fun findByPendingActionIdAndAccountId(
        pendingActionId: Long,
        accountId: UUID,
    ): PendingActionEntity?

    @Query(
        value = """
            select
              pending_action_id as pendingActionId,
              account_id as accountId,
              action_type as actionType,
              reference_table as referenceTable,
              reference_id as referenceId,
              title,
              description,
              status,
              priority,
              created_at as createdAt,
              resolved_at as resolvedAt
            from user_pending_action
            where account_id = :accountId
              and (:status is null or status = :status)
              and (:priority is null or priority = :priority)
            order by created_at desc, pending_action_id desc
            limit :limit
        """,
        nativeQuery = true,
    )
    fun findByAccountIdWithFilters(
        @Param("accountId") accountId: UUID,
        @Param("status") status: String?,
        @Param("priority") priority: String?,
        @Param("limit") limit: Int,
    ): List<PendingActionProjection>

    @Query(
        value = """
            select count(*)
            from user_pending_action
            where account_id = :accountId
              and (:status is null or status = :status)
        """,
        nativeQuery = true,
    )
    fun countByAccountIdAndStatus(
        @Param("accountId") accountId: UUID,
        @Param("status") status: String?,
    ): Long
}
