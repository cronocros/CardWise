package com.cardwise.common.web

import java.util.UUID
import org.springframework.stereotype.Component

@Component
class RequestAccountIdResolver {
    private val defaultAccountId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")

    fun resolve(headerValue: String?): UUID {
        return headerValue
            ?.takeIf { it.isNotBlank() }
            ?.let(UUID::fromString)
            ?: defaultAccountId
    }
}
