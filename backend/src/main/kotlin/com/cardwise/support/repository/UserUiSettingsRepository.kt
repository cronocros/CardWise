package com.cardwise.support.repository

import com.cardwise.support.entity.UserUiSettings
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserUiSettingsRepository : JpaRepository<UserUiSettings, Long> {
    fun findByAccountIdAndCategory(accountId: UUID, category: String): UserUiSettings?
}
