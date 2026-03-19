package com.cardwise.notification.infrastructure

import java.sql.ResultSet
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

data class NotificationRecordRow(
    val notificationId: Long,
    val accountId: UUID,
    val notificationType: String,
    val eventCode: String,
    val title: String,
    val body: String,
    val actionUrl: String?,
    val actionLabel: String?,
    val referenceTable: String?,
    val referenceId: Long?,
    val readAt: OffsetDateTime?,
    val createdAt: OffsetDateTime,
)

data class NotificationInsertCommand(
    val accountId: UUID,
    val notificationType: String,
    val eventCode: String,
    val title: String,
    val body: String,
    val actionUrl: String? = null,
    val actionLabel: String? = null,
    val referenceTable: String? = null,
    val referenceId: Long? = null,
)

@Repository
class NotificationRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) {
    fun list(accountId: UUID, type: String?, limit: Int): List<NotificationRecordRow> {
        val sql = """
            select
                notification_id,
                account_id,
                notification_type,
                event_code,
                title,
                body,
                action_url,
                action_label,
                reference_table,
                reference_id,
                read_at,
                created_at
            from notification
            where account_id = :accountId
              and (:type is null or notification_type = :type)
            order by created_at desc, notification_id desc
            limit :limit
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource()
                .addValue("accountId", accountId)
                .addValue("type", type)
                .addValue("limit", limit),
            ::mapRecord,
        )
    }

    fun countUnread(accountId: UUID): Long {
        val sql = """
            select count(*)
            from notification
            where account_id = :accountId
              and read_at is null
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource().addValue("accountId", accountId),
            Long::class.java,
        ) ?: 0L
    }

    fun insert(command: NotificationInsertCommand): NotificationRecordRow {
        val sql = """
            insert into notification (
                account_id,
                notification_type,
                event_code,
                title,
                body,
                action_url,
                action_label,
                reference_table,
                reference_id
            ) values (
                :accountId,
                :notificationType,
                :eventCode,
                :title,
                :body,
                :actionUrl,
                :actionLabel,
                :referenceTable,
                :referenceId
            )
            returning
                notification_id,
                account_id,
                notification_type,
                event_code,
                title,
                body,
                action_url,
                action_label,
                reference_table,
                reference_id,
                read_at,
                created_at
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource()
                .addValue("accountId", command.accountId)
                .addValue("notificationType", command.notificationType)
                .addValue("eventCode", command.eventCode)
                .addValue("title", command.title)
                .addValue("body", command.body)
                .addValue("actionUrl", command.actionUrl)
                .addValue("actionLabel", command.actionLabel)
                .addValue("referenceTable", command.referenceTable)
                .addValue("referenceId", command.referenceId),
            ::mapRecord,
        ) ?: error("notification insert returned no row")
    }

    fun markRead(accountId: UUID, notificationId: Long): Int {
        val sql = """
            update notification
            set read_at = coalesce(read_at, now())
            where account_id = :accountId
              and notification_id = :notificationId
        """.trimIndent()

        return jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("accountId", accountId)
                .addValue("notificationId", notificationId),
        )
    }

    fun markAllRead(accountId: UUID): Int {
        val sql = """
            update notification
            set read_at = coalesce(read_at, now())
            where account_id = :accountId
              and read_at is null
        """.trimIndent()

        return jdbcTemplate.update(
            sql,
            MapSqlParameterSource().addValue("accountId", accountId),
        )
    }

    fun markReferenceRead(accountId: UUID, referenceTable: String, referenceId: Long): Int {
        val sql = """
            update notification
            set read_at = coalesce(read_at, now())
            where account_id = :accountId
              and reference_table = :referenceTable
              and reference_id = :referenceId
              and read_at is null
        """.trimIndent()

        return jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("accountId", accountId)
                .addValue("referenceTable", referenceTable)
                .addValue("referenceId", referenceId),
        )
    }

    fun findAccountIdByEmail(email: String): UUID? {
        val sql = """
            select account_id
            from account
            where lower(email) = lower(:email)
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("email", email),
        ) { rs, _ -> rs.getObject("account_id", UUID::class.java) }
            .firstOrNull()
    }

    private fun mapRecord(resultSet: ResultSet, rowNum: Int): NotificationRecordRow {
        return NotificationRecordRow(
            notificationId = resultSet.getLong("notification_id"),
            accountId = resultSet.getObject("account_id", UUID::class.java),
            notificationType = resultSet.getString("notification_type"),
            eventCode = resultSet.getString("event_code"),
            title = resultSet.getString("title"),
            body = resultSet.getString("body"),
            actionUrl = resultSet.getString("action_url"),
            actionLabel = resultSet.getString("action_label"),
            referenceTable = resultSet.getString("reference_table"),
            referenceId = resultSet.getLong("reference_id").takeUnless { resultSet.wasNull() },
            readAt = resultSet.getObject("read_at", OffsetDateTime::class.java),
            createdAt = resultSet.getObject("created_at", OffsetDateTime::class.java),
        )
    }
}
