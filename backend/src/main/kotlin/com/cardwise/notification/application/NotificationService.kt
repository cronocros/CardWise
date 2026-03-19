package com.cardwise.notification.application

import com.cardwise.common.exception.BadRequestException
import com.cardwise.notification.api.NotificationSettingsPatchRequest
import com.cardwise.notification.api.NotificationSettingsResponse
import com.cardwise.notification.infrastructure.NotificationSettingRepository
import com.cardwise.notification.infrastructure.NotificationSettingRow
import java.util.UUID
import org.springframework.stereotype.Service

@Service
class NotificationService(
    private val repository: NotificationSettingRepository,
) {
    fun getSettings(accountId: UUID): NotificationSettingsResponse {
        return repository.findOrCreateDefault(accountId).toResponse()
    }

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

        val current = repository.findOrCreateDefault(accountId)
        val updated = repository.save(
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
}
