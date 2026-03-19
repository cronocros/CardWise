package com.cardwise.ledger.entity

import java.time.OffsetDateTime
import java.util.UUID
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "user_pending_action")
open class PendingActionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pending_action_id")
    var pendingActionId: Long? = null

    @Column(name = "account_id", nullable = false)
    var accountId: UUID? = null

    @Column(name = "action_type", nullable = false)
    var actionType: String? = null

    @Column(name = "reference_table")
    var referenceTable: String? = null

    @Column(name = "reference_id")
    var referenceId: Long? = null

    @Column(name = "title", nullable = false)
    var title: String? = null

    @Column(name = "description")
    var description: String? = null

    @Column(name = "status", nullable = false)
    var status: String? = null

    @Column(name = "priority", nullable = false)
    var priority: String? = null

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = null

    @Column(name = "resolved_at")
    var resolvedAt: OffsetDateTime? = null
}
