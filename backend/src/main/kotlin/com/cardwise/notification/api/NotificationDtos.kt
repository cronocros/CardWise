package com.cardwise.notification.api

import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime

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
