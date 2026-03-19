package com.cardwise.notification.api

import java.time.OffsetDateTime

data class NotificationItemResponse(
    val notificationId: Long,
    val notificationType: String,
    val eventCode: String,
    val title: String,
    val body: String,
    val actionUrl: String?,
    val actionLabel: String?,
    val referenceTable: String?,
    val referenceId: Long?,
    val isRead: Boolean,
    val readAt: OffsetDateTime?,
    val createdAt: OffsetDateTime,
)

data class NotificationUnreadCountResponse(
    val unreadCount: Long,
)

data class NotificationSettingsResponse(
    val notificationSettingId: Long,
    val accountId: String,
    val voucherExpiryAlert: Boolean,
    val performanceReminder: Boolean,
    val paymentConfirmAlert: Boolean,
    val emailNotification: Boolean,
    val pushNotification: Boolean,
    val updatedAt: OffsetDateTime,
)

data class NotificationSettingsPatchRequest(
    val voucherExpiryAlert: Boolean? = null,
    val performanceReminder: Boolean? = null,
    val paymentConfirmAlert: Boolean? = null,
    val emailNotification: Boolean? = null,
    val pushNotification: Boolean? = null,
)
