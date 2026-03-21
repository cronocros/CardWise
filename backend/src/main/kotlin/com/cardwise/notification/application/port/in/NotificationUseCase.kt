package com.cardwise.notification.application.port.`in`

import com.cardwise.notification.api.NotificationItemResponse
import com.cardwise.notification.api.NotificationSettingsPatchRequest
import com.cardwise.notification.api.NotificationSettingsResponse
import com.cardwise.notification.api.NotificationUnreadCountResponse
import com.cardwise.notification.infrastructure.NotificationInsertCommand
import java.util.UUID

interface NotificationUseCase {
    fun getSettings(accountId: UUID): NotificationSettingsResponse
    fun patchSettings(accountId: UUID, request: NotificationSettingsPatchRequest): NotificationSettingsResponse
    fun listNotifications(accountId: UUID, type: String?, limit: Int): List<NotificationItemResponse>
    fun getUnreadCount(accountId: UUID): NotificationUnreadCountResponse
    fun markRead(accountId: UUID, notificationId: Long): NotificationItemResponse
    fun markAllRead(accountId: UUID): NotificationUnreadCountResponse
    fun createNotification(command: NotificationInsertCommand): NotificationItemResponse
    fun createNotificationIfAccountExists(command: NotificationInsertCommand): NotificationItemResponse?
    fun createNotificationForEmail(
        email: String,
        notificationType: String,
        eventCode: String,
        title: String,
        body: String,
        actionUrl: String? = null,
        actionLabel: String? = null,
        referenceTable: String? = null,
        referenceId: Long? = null,
    ): NotificationItemResponse?
    fun markReferenceRead(accountId: UUID, referenceTable: String, referenceId: Long)
}
