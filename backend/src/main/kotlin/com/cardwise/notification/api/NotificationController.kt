package com.cardwise.notification.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.notification.application.NotificationService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
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
}
