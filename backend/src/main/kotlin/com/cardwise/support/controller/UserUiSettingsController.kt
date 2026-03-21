package com.cardwise.support.controller

import com.cardwise.support.entity.UserUiSettings
import com.cardwise.support.repository.UserUiSettingsRepository
import org.springframework.web.bind.annotation.*
import java.time.OffsetDateTime
import java.util.UUID

@RestController
@RequestMapping("/api/v1/user-settings")
class UserUiSettingsController(
    private val repository: UserUiSettingsRepository
) {
    @GetMapping("/{accountId}/{category}")
    fun getSettings(
        @PathVariable accountId: UUID,
        @PathVariable category: String
    ): Map<String, Any>? {
        return repository.findByAccountIdAndCategory(accountId, category)?.settingsJson
    }

    @PutMapping("/{accountId}/{category}")
    fun saveSettings(
        @PathVariable accountId: UUID,
        @PathVariable category: String,
        @RequestBody settings: Map<String, Any>
    ): Map<String, Any> {
        val existing = repository.findByAccountIdAndCategory(accountId, category)
        val saved = if (existing != null) {
            existing.settingsJson = settings
            existing.updatedAt = OffsetDateTime.now()
            repository.save(existing)
        } else {
            val newSettings = UserUiSettings(
                accountId = accountId,
                category = category,
                settingsJson = settings
            )
            repository.save(newSettings)
        }
        return saved.settingsJson
    }
}
