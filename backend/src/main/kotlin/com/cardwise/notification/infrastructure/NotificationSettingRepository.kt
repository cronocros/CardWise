package com.cardwise.notification.infrastructure

import java.sql.ResultSet
import java.time.OffsetDateTime
import java.util.UUID
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

data class NotificationSettingRow(
    val notificationSettingId: Long,
    val accountId: UUID,
    val voucherExpiryAlert: Boolean,
    val performanceReminder: Boolean,
    val paymentConfirmAlert: Boolean,
    val groupInviteAlert: Boolean,
    val groupActivityAlert: Boolean,
    val emailNotification: Boolean,
    val pushNotification: Boolean,
    val updatedAt: OffsetDateTime,
)

@Repository
class NotificationSettingRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) {
    fun findOrCreateDefault(accountId: UUID): NotificationSettingRow {
        ensureDefault(accountId)
        return findByAccountId(accountId) ?: error("notification_setting row must exist after ensureDefault")
    }

    fun findByAccountId(accountId: UUID): NotificationSettingRow? {
        val sql = """
            select
                notification_setting_id,
                account_id,
                voucher_expiry_alert,
                performance_reminder,
                payment_confirm_alert,
                group_invite_alert,
                group_activity_alert,
                email_notification,
                push_notification,
                updated_at
            from notification_setting
            where account_id = :accountId
        """.trimIndent()

        val params = MapSqlParameterSource().addValue("accountId", accountId)
        return try {
            jdbcTemplate.queryForObject(sql, params, ::mapRow)
        } catch (ex: EmptyResultDataAccessException) {
            null
        }
    }

    fun save(accountId: UUID, settings: NotificationSettingRow): NotificationSettingRow {
        val sql = """
            insert into notification_setting (
                account_id,
                voucher_expiry_alert,
                performance_reminder,
                payment_confirm_alert,
                group_invite_alert,
                group_activity_alert,
                email_notification,
                push_notification,
                updated_at
            ) values (
                :accountId,
                :voucherExpiryAlert,
                :performanceReminder,
                :paymentConfirmAlert,
                :groupInviteAlert,
                :groupActivityAlert,
                :emailNotification,
                :pushNotification,
                now()
            )
            on conflict (account_id) do update
            set voucher_expiry_alert = excluded.voucher_expiry_alert,
                performance_reminder = excluded.performance_reminder,
                payment_confirm_alert = excluded.payment_confirm_alert,
                group_invite_alert = excluded.group_invite_alert,
                group_activity_alert = excluded.group_activity_alert,
                email_notification = excluded.email_notification,
                push_notification = excluded.push_notification,
                updated_at = now()
            returning
                notification_setting_id,
                account_id,
                voucher_expiry_alert,
                performance_reminder,
                payment_confirm_alert,
                group_invite_alert,
                group_activity_alert,
                email_notification,
                push_notification,
                updated_at
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            buildParams(accountId, settings),
            ::mapRow,
        ) ?: error("notification_setting upsert returned no row")
    }

    private fun ensureDefault(accountId: UUID) {
        val sql = """
            insert into notification_setting (
                account_id,
                voucher_expiry_alert,
                performance_reminder,
                payment_confirm_alert,
                group_invite_alert,
                group_activity_alert,
                email_notification,
                push_notification
            ) values (
                :accountId,
                true,
                true,
                true,
                true,
                true,
                false,
                true
            )
            on conflict (account_id) do nothing
        """.trimIndent()

        jdbcTemplate.update(sql, MapSqlParameterSource().addValue("accountId", accountId))
    }

    private fun buildParams(accountId: UUID, settings: NotificationSettingRow): MapSqlParameterSource {
        return MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("voucherExpiryAlert", settings.voucherExpiryAlert)
            .addValue("performanceReminder", settings.performanceReminder)
            .addValue("paymentConfirmAlert", settings.paymentConfirmAlert)
            .addValue("groupInviteAlert", settings.groupInviteAlert)
            .addValue("groupActivityAlert", settings.groupActivityAlert)
            .addValue("emailNotification", settings.emailNotification)
            .addValue("pushNotification", settings.pushNotification)
    }

    private fun mapRow(resultSet: ResultSet, rowNum: Int): NotificationSettingRow {
        return NotificationSettingRow(
            notificationSettingId = resultSet.getLong("notification_setting_id"),
            accountId = resultSet.getObject("account_id", UUID::class.java),
            voucherExpiryAlert = resultSet.getBoolean("voucher_expiry_alert"),
            performanceReminder = resultSet.getBoolean("performance_reminder"),
            paymentConfirmAlert = resultSet.getBoolean("payment_confirm_alert"),
            groupInviteAlert = resultSet.getBoolean("group_invite_alert"),
            groupActivityAlert = resultSet.getBoolean("group_activity_alert"),
            emailNotification = resultSet.getBoolean("email_notification"),
            pushNotification = resultSet.getBoolean("push_notification"),
            updatedAt = resultSet.getObject("updated_at", OffsetDateTime::class.java),
        )
    }
}
