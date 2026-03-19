package com.cardwise.voucher.domain

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import java.time.LocalDate

data class VoucherUnlockView(
    val unlockType: String,
    val unlockState: String,
    val requiredAnnualPerformance: Long?,
    val remainingAmount: Long?,
    val availableAt: LocalDate?,
    val notes: String?,
)

object VoucherUnlockSupport {
    fun evaluate(
        objectMapper: ObjectMapper,
        unlockConditions: String?,
        issuedAt: LocalDate,
        annualAccumulated: Long,
        today: LocalDate,
        isAssigned: Boolean,
    ): VoucherUnlockView {
        val root = parseJson(objectMapper, unlockConditions)
        val unlockType = root?.path("unlock_type")?.asText()?.uppercase()?.ifBlank { null } ?: "NONE"
        val requiredAnnualPerformance = root?.path("requires_annual_performance")
            ?.takeIf { !it.isMissingNode && !it.isNull }
            ?.asLong()
        val availableAfterMonths = root?.path("available_after_months")
            ?.takeIf { !it.isMissingNode && !it.isNull }
            ?.asLong()
        val availableAt = availableAfterMonths?.let { issuedAt.plusMonths(it) }
        val notes = root?.path("notes")
            ?.takeIf { !it.isMissingNode && !it.isNull }
            ?.asText()

        val performanceMet = requiredAnnualPerformance == null || annualAccumulated >= requiredAnnualPerformance
        val timingMet = availableAt == null || !today.isBefore(availableAt)
        val conditionsMet = performanceMet && timingMet
        val remainingAmount = requiredAnnualPerformance?.let { (it - annualAccumulated).coerceAtLeast(0L) }

        val unlockState = when {
            isAssigned -> "UNLOCKED"
            !conditionsMet -> "LOCKED"
            unlockType == "MANUAL" || unlockType == "ADMIN" -> "ELIGIBLE"
            else -> "UNLOCKED"
        }

        return VoucherUnlockView(
            unlockType = unlockType,
            unlockState = unlockState,
            requiredAnnualPerformance = requiredAnnualPerformance,
            remainingAmount = remainingAmount,
            availableAt = availableAt,
            notes = notes,
        )
    }

    private fun parseJson(
        objectMapper: ObjectMapper,
        raw: String?,
    ): JsonNode? {
        if (raw.isNullOrBlank()) {
            return null
        }
        return runCatching { objectMapper.readTree(raw) }.getOrNull()
    }
}
