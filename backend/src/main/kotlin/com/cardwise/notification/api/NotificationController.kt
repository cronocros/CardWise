package com.cardwise.notification.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.notification.application.NotificationService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/notifications")
class NotificationController(
    private val notificationService: NotificationService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping("/settings")
    fun getSettings(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<NotificationSettingsResponse> {
        return ApiResponse(
            data = notificationService.getSettings(requestAccountIdResolver.resolve(accountIdHeader)),
        )
    }

    @GetMapping
    fun listNotifications(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @RequestParam(required = false) type: String?,
        @RequestParam(defaultValue = "30") limit: Int,
    ): ApiResponse<List<NotificationItemResponse>> {
        return ApiResponse(
            data = notificationService.listNotifications(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                type = type,
                limit = limit,
            ),
        )
    }

    @GetMapping("/unread-count")
    fun getUnreadCount(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<NotificationUnreadCountResponse> {
        return ApiResponse(
            data = notificationService.getUnreadCount(requestAccountIdResolver.resolve(accountIdHeader)),
        )
    }

    @PatchMapping("/settings")
    fun patchSettings(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: NotificationSettingsPatchRequest,
    ): ApiResponse<NotificationSettingsResponse> {
        return ApiResponse(
            data = notificationService.patchSettings(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                request = request,
            ),
        )
    }

    @PatchMapping("/{notificationId}/read")
    fun markRead(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable notificationId: Long,
    ): ApiResponse<NotificationItemResponse> {
        return ApiResponse(
            data = notificationService.markRead(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                notificationId = notificationId,
            ),
        )
    }

    @PatchMapping("/read-all")
    fun markAllRead(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<NotificationUnreadCountResponse> {
        return ApiResponse(
            data = notificationService.markAllRead(requestAccountIdResolver.resolve(accountIdHeader)),
        )
    }
}
