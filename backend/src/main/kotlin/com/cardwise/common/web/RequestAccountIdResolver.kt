package com.cardwise.common.web

import java.util.UUID
import org.springframework.stereotype.Component

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

@Component
class RequestAccountIdResolver {
    private val defaultAccountId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")

    fun resolve(headerValue: String?): UUID {
        val auth = SecurityContextHolder.getContext().authentication
        if (auth is JwtAuthenticationToken) {
            val sub = auth.name
            try {
                return UUID.fromString(sub)
            } catch (e: Exception) {
                // Return default on error or let it fallback
            }
        }
        return headerValue
            ?.takeIf { it.isNotBlank() }
            ?.let(UUID::fromString)
            ?: defaultAccountId
    }
}
