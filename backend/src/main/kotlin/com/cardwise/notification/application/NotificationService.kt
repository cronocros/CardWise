package com.cardwise.notification.application

import com.cardwise.common.exception.BadRequestException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.notification.api.NotificationItemResponse
import com.cardwise.notification.api.NotificationSettingsPatchRequest
import com.cardwise.notification.api.NotificationSettingsResponse
import com.cardwise.notification.api.NotificationUnreadCountResponse
import com.cardwise.notification.infrastructure.NotificationInsertCommand
import com.cardwise.notification.infrastructure.NotificationRecordRow
import com.cardwise.notification.infrastructure.NotificationRepository
import com.cardwise.notification.infrastructure.NotificationSettingRepository
import com.cardwise.notification.infrastructure.NotificationSettingRow
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val notificationSettingRepository: NotificationSettingRepository,
    private val notificationRepository: NotificationRepository,
) {
    fun getSettings(accountId: UUID): NotificationSettingsResponse {
        return notificationSettingRepository.findOrCreateDefault(accountId).toResponse()
    }

    @Transactional
    fun patchSettings(accountId: UUID, request: NotificationSettingsPatchRequest): NotificationSettingsResponse {
        val hasAtLeastOneField =
            request.voucherExpiryAlert != null ||
                request.performanceReminder != null ||
                request.paymentConfirmAlert != null ||
                request.emailNotification != null ||
                request.pushNotification != null

        if (!hasAtLeastOneField) {
            throw BadRequestException("수정할 알림 설정이 없습니다.")
        }

        val current = notificationSettingRepository.findOrCreateDefault(accountId)
        val updated = notificationSettingRepository.save(
            accountId = accountId,
            settings = current.copy(
                voucherExpiryAlert = request.voucherExpiryAlert ?: current.voucherExpiryAlert,
                performanceReminder = request.performanceReminder ?: current.performanceReminder,
                paymentConfirmAlert = request.paymentConfirmAlert ?: current.paymentConfirmAlert,
                emailNotification = request.emailNotification ?: current.emailNotification,
                pushNotification = request.pushNotification ?: current.pushNotification,
            ),
        )

        return updated.toResponse()
    }

    fun listNotifications(accountId: UUID, type: String?, limit: Int): List<NotificationItemResponse> {
        val normalizedType = type?.trim()?.uppercase()?.takeIf { it in setOf("VOUCHER", "PERFORMANCE", "GROUP", "SYSTEM") }
        return notificationRepository.list(accountId, normalizedType, limit.coerceIn(1, 100)).map(::toItemResponse)
    }

    fun getUnreadCount(accountId: UUID): NotificationUnreadCountResponse {
        return NotificationUnreadCountResponse(unreadCount = notificationRepository.countUnread(accountId))
    }

    @Transactional
    fun markRead(accountId: UUID, notificationId: Long): NotificationItemResponse {
        val updated = notificationRepository.markRead(accountId, notificationId)
        if (updated != 1) {
            throw NotFoundException("알림을 찾을 수 없습니다.")
        }
        return notificationRepository.list(accountId, null, 100)
            .firstOrNull { it.notificationId == notificationId }
            ?.let(::toItemResponse)
            ?: throw NotFoundException("알림을 찾을 수 없습니다.")
    }

    @Transactional
    fun markAllRead(accountId: UUID): NotificationUnreadCountResponse {
        notificationRepository.markAllRead(accountId)
        return getUnreadCount(accountId)
    }

    @Transactional
    fun createNotification(command: NotificationInsertCommand): NotificationItemResponse {
        return notificationRepository.insert(command).let(::toItemResponse)
    }

    @Transactional
    fun createNotificationIfAccountExists(command: NotificationInsertCommand): NotificationItemResponse? {
        return if (notificationRepository.findAccountIdByEmail(command.accountId.toString()) != null) {
            createNotification(command)
        } else {
            null
        }
    }

    @Transactional
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
    ): NotificationItemResponse? {
        val accountId = notificationRepository.findAccountIdByEmail(email) ?: return null
        return createNotification(
            NotificationInsertCommand(
                accountId = accountId,
                notificationType = notificationType,
                eventCode = eventCode,
                title = title,
                body = body,
                actionUrl = actionUrl,
                actionLabel = actionLabel,
                referenceTable = referenceTable,
                referenceId = referenceId,
            ),
        )
    }

    @Transactional
    fun markReferenceRead(accountId: UUID, referenceTable: String, referenceId: Long) {
        notificationRepository.markReferenceRead(accountId, referenceTable, referenceId)
    }

    private fun NotificationSettingRow.toResponse(): NotificationSettingsResponse {
        return NotificationSettingsResponse(
            notificationSettingId = notificationSettingId,
            accountId = accountId.toString(),
            voucherExpiryAlert = voucherExpiryAlert,
            performanceReminder = performanceReminder,
            paymentConfirmAlert = paymentConfirmAlert,
            emailNotification = emailNotification,
            pushNotification = pushNotification,
            updatedAt = updatedAt,
        )
    }

    private fun toItemResponse(row: NotificationRecordRow): NotificationItemResponse {
        return NotificationItemResponse(
            notificationId = row.notificationId,
            notificationType = row.notificationType,
            eventCode = row.eventCode,
            title = row.title,
            body = row.body,
            actionUrl = row.actionUrl,
            actionLabel = row.actionLabel,
            referenceTable = row.referenceTable,
            referenceId = row.referenceId,
            isRead = row.readAt != null,
            readAt = row.readAt,
            createdAt = row.createdAt,
        )
    }
}
