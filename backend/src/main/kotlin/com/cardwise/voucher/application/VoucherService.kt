package com.cardwise.voucher.application

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.exception.BadRequestException
import com.cardwise.common.exception.NotFoundException
import com.cardwise.card.adapter.out.persistence.entity.CardEntity
import com.cardwise.card.adapter.out.persistence.repository.CardRepository
import com.cardwise.voucher.adapter.out.persistence.entity.CardVoucherEntity
import com.cardwise.voucher.adapter.out.persistence.repository.CardVoucherRepository
import com.cardwise.card.adapter.out.persistence.entity.UserCardEntity
import com.cardwise.card.adapter.out.persistence.repository.UserCardRepository
import com.cardwise.performance.infrastructure.UserPerformanceRepository
import com.cardwise.voucher.adapter.out.persistence.entity.UserVoucherEntity
import com.cardwise.voucher.adapter.out.persistence.repository.UserVoucherRepository
import com.cardwise.voucher.api.VoucherActionRequest
import com.cardwise.voucher.api.VoucherHistoryResponse
import com.cardwise.voucher.api.VoucherSummaryResponse
import com.cardwise.voucher.domain.VoucherUnlockSupport
import com.cardwise.voucher.application.port.`in`.VoucherCommandUseCase
import com.cardwise.voucher.application.port.`in`.VoucherQueryUseCase
import com.cardwise.voucher.infrastructure.UserVoucherLogEntity
import com.cardwise.voucher.infrastructure.UserVoucherLogRepository
import com.fasterxml.jackson.databind.ObjectMapper
import java.time.Clock
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

private enum class VoucherQueryStatus {
    ACTIVE,
    EXPIRED,
    ALL,
}

private data class OwnedVoucherContext(
    val userCard: UserCardEntity,
    val card: CardEntity,
    val cardVoucher: CardVoucherEntity,
    val userVoucher: UserVoucherEntity?,
    val annualAccumulated: Long,
)

@Service
@Transactional(readOnly = true)
class VoucherService(
    private val cardRepository: CardRepository,
    private val userCardRepository: UserCardRepository,
    private val cardVoucherRepository: CardVoucherRepository,
    private val userVoucherRepository: UserVoucherRepository,
    private val userPerformanceRepository: UserPerformanceRepository,
    private val userVoucherLogRepository: UserVoucherLogRepository,
    private val objectMapper: ObjectMapper,
    private val clock: Clock,
) : VoucherQueryUseCase, VoucherCommandUseCase {
    override fun listUserCardVouchers(
        userCardId: Long,
        accountId: UUID,
    ): ApiResponse<List<VoucherSummaryResponse>> {
        val userCard = userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
        if (userCard == null) {
            throw NotFoundException("User card not found")
        }
        val contexts = loadContexts(accountId)

        val today = LocalDate.now(clock)
        return ApiResponse(
            data = contexts
                .filter { it.userCard.userCardId == userCardId }
                .map { toSummary(it, today) }
                .sortedBy { it.voucherName.lowercase() },
        )
    }

    override fun listVouchers(
        accountId: UUID,
        status: String?,
    ): ApiResponse<List<VoucherSummaryResponse>> {
        val filter = parseStatus(status)
        val today = LocalDate.now(clock)
        val items = loadContexts(accountId)
            .map { toSummary(it, today) }
            .filter { matchesFilter(it, filter) }
            .sortedWith(compareBy<VoucherSummaryResponse>({ it.daysUntilExpiry ?: Long.MAX_VALUE }, { it.voucherName.lowercase() }))
        return ApiResponse(data = items)
    }

    override fun listExpiringVouchers(
        accountId: UUID,
        days: Int,
    ): ApiResponse<List<VoucherSummaryResponse>> {
        val normalizedDays = days.coerceIn(1, 60)
        val today = LocalDate.now(clock)
        val items = loadContexts(accountId)
            .map { toSummary(it, today) }
            .filter { item ->
                val expiry = item.daysUntilExpiry
                item.validUntil != null &&
                    expiry != null &&
                    expiry in 0..normalizedDays.toLong() &&
                    item.status != "EXPIRED"
            }
            .sortedWith(compareBy<VoucherSummaryResponse>({ it.daysUntilExpiry ?: Long.MAX_VALUE }, { it.voucherName.lowercase() }))
        return ApiResponse(data = items)
    }

    @Transactional
    override fun useVoucher(
        userVoucherId: Long,
        accountId: UUID,
        request: VoucherActionRequest,
    ): ApiResponse<VoucherSummaryResponse> {
        val context = requireOwnedContext(userVoucherId, accountId)
        val userVoucher = context.userVoucher ?: throw NotFoundException("User voucher not found")
        val today = LocalDate.now(clock)
        val summary = toSummary(context, today)

        if (summary.status == "EXPIRED") {
            throw BadRequestException("Expired voucher cannot be used")
        }
        if (summary.unlockState != "UNLOCKED") {
            throw BadRequestException("Locked or manual voucher cannot be used yet")
        }

        val remaining = userVoucher.remainingCount ?: 0
        if (remaining <= 0) {
            throw BadRequestException("No remaining count for this voucher")
        }

        userVoucher.remainingCount = remaining - 1
        userVoucher.updatedAt = OffsetDateTime.now(clock)
        val saved = userVoucherRepository.save(userVoucher)
        writeLog(saved.userVoucherId ?: userVoucherId, "USE", request.memo)
        return ApiResponse(data = toSummary(context.copy(userVoucher = saved), today))
    }

    @Transactional
    override fun unuseVoucher(
        userVoucherId: Long,
        accountId: UUID,
        request: VoucherActionRequest,
    ): ApiResponse<VoucherSummaryResponse> {
        val context = requireOwnedContext(userVoucherId, accountId)
        val userVoucher = context.userVoucher ?: throw NotFoundException("User voucher not found")
        val total = userVoucher.totalCount ?: 0
        val remaining = userVoucher.remainingCount ?: 0
        if (remaining >= total) {
            throw BadRequestException("Voucher is already fully restored")
        }

        userVoucher.remainingCount = remaining + 1
        userVoucher.updatedAt = OffsetDateTime.now(clock)
        val saved = userVoucherRepository.save(userVoucher)
        writeLog(saved.userVoucherId ?: userVoucherId, "CANCEL", request.memo)
        return ApiResponse(data = toSummary(context.copy(userVoucher = saved), LocalDate.now(clock)))
    }

    override fun listVoucherHistory(
        userVoucherId: Long,
        accountId: UUID,
    ): ApiResponse<List<VoucherHistoryResponse>> {
        requireOwnedContext(userVoucherId, accountId)
        val history = userVoucherLogRepository.findAllByUserVoucherIdOrderByCreatedAtDesc(userVoucherId)
            .map { log ->
                VoucherHistoryResponse(
                    voucherHistoryId = log.userVoucherLogId ?: 0L,
                    action = log.voucherAction ?: "USE",
                    memo = log.memo,
                    createdAt = log.createdAt ?: OffsetDateTime.now(clock),
                )
            }
        return ApiResponse(data = history)
    }

    private fun loadContexts(accountId: UUID): List<OwnedVoucherContext> {
        val userCards = userCardRepository.findAllByAccountIdAndIsActiveTrue(accountId)
            .filter { it.userCardId != null && it.cardId != null }
        if (userCards.isEmpty()) {
            return emptyList()
        }

        val userCardIds = userCards.mapNotNull { it.userCardId }
        val cardIds = userCards.mapNotNull { it.cardId }.distinct()
        val cardsById = cardRepository.findAllByCardIdInAndIsActiveTrue(cardIds)
            .associateBy { requireNotNull(it.cardId) }
        val cardVouchersByCardId = cardVoucherRepository.findAllByCardIdInAndIsActiveTrue(cardIds)
            .groupBy { requireNotNull(it.cardId) }
        val userVouchers = userVoucherRepository.findAllByUserCardIdIn(userCardIds)
        val userVoucherByKey = userVouchers.associateBy { requireNotNull(it.userCardId) to requireNotNull(it.cardVoucherId) }
        val annualByUserCardId = userCardIds.associateWith { userCardId ->
            userPerformanceRepository.findTopByUserCardIdOrderByYearMonthDesc(userCardId)?.annualAccumulated ?: 0L
        }

        return userCards.flatMap { userCard ->
            val userCardId = requireNotNull(userCard.userCardId)
            val cardId = requireNotNull(userCard.cardId)
            val card = cardsById[cardId] ?: return@flatMap emptyList()
            val annualAccumulated = annualByUserCardId[userCardId] ?: 0L
            cardVouchersByCardId[cardId].orEmpty()
                .sortedBy { it.voucherName.lowercase() }
                .map { cardVoucher ->
                    OwnedVoucherContext(
                        userCard = userCard,
                        card = card,
                        cardVoucher = cardVoucher,
                        userVoucher = userVoucherByKey[userCardId to requireNotNull(cardVoucher.cardVoucherId)],
                        annualAccumulated = annualAccumulated,
                    )
                }
                .filter { it.userVoucher?.userVoucherId != null }
        }
    }

    private fun requireOwnedContext(
        userVoucherId: Long,
        accountId: UUID,
    ): OwnedVoucherContext {
        val userVoucher = userVoucherRepository.findById(userVoucherId)
            .orElseThrow { NotFoundException("User voucher not found") }
        val userCardId = userVoucher.userCardId ?: throw NotFoundException("User card not found")
        val userCard = userCardRepository.findByUserCardIdAndAccountIdAndIsActiveTrue(userCardId, accountId)
            ?: throw NotFoundException("User voucher not found")
        val cardId = userCard.cardId ?: throw NotFoundException("Card not found")
        val card = cardRepository.findByCardIdAndIsActiveTrue(cardId)
            ?: throw NotFoundException("Card not found")
        val cardVoucherId = userVoucher.cardVoucherId ?: throw NotFoundException("Card voucher not found")
        val cardVoucher = cardVoucherRepository.findById(cardVoucherId)
            .orElseThrow { NotFoundException("Card voucher not found") }
        val annualAccumulated = userPerformanceRepository.findTopByUserCardIdOrderByYearMonthDesc(userCardId)?.annualAccumulated ?: 0L
        return OwnedVoucherContext(
            userCard = userCard,
            card = card,
            cardVoucher = cardVoucher,
            userVoucher = userVoucher,
            annualAccumulated = annualAccumulated,
        )
    }

    private fun toSummary(
        context: OwnedVoucherContext,
        today: LocalDate,
    ): VoucherSummaryResponse {
        val userVoucher = context.userVoucher
        val evaluation = VoucherUnlockSupport.evaluate(
            objectMapper = objectMapper,
            unlockConditions = context.cardVoucher.unlockConditions,
            issuedAt = context.userCard.issuedAt,
            annualAccumulated = context.annualAccumulated,
            today = today,
            isAssigned = userVoucher != null,
        )
        val validFrom = userVoucher?.validFrom ?: context.cardVoucher.validFrom
        val validUntil = userVoucher?.validUntil ?: context.cardVoucher.validUntil
        val remainingCount = userVoucher?.remainingCount ?: context.cardVoucher.totalCount
        val totalCount = userVoucher?.totalCount ?: context.cardVoucher.totalCount
        val status = resolveDisplayStatus(
            unlockState = evaluation.unlockState,
            remainingCount = remainingCount,
            validUntil = validUntil,
            today = today,
        )
        val daysUntilExpiry = validUntil?.let {
            if (it.isBefore(today)) 0L else ChronoUnit.DAYS.between(today, it)
        }

        return VoucherSummaryResponse(
            userVoucherId = requireNotNull(userVoucher?.userVoucherId),
            cardVoucherId = requireNotNull(context.cardVoucher.cardVoucherId),
            userCardId = requireNotNull(context.userCard.userCardId),
            cardId = requireNotNull(context.card.cardId),
            cardName = context.card.cardName,
            cardNickname = context.userCard.cardNickname,
            cardLabel = context.userCard.cardNickname?.takeIf { it.isNotBlank() } ?: context.card.cardName,
            voucherName = context.cardVoucher.voucherName,
            voucherType = context.cardVoucher.voucherType,
            periodType = context.cardVoucher.periodType,
            status = status,
            unlockType = evaluation.unlockType,
            unlockState = evaluation.unlockState,
            remainingCount = remainingCount,
            totalCount = totalCount,
            validFrom = validFrom,
            validUntil = validUntil,
            daysUntilExpiry = daysUntilExpiry,
            description = context.cardVoucher.description,
            requiredAnnualPerformance = evaluation.requiredAnnualPerformance,
            currentAnnualPerformance = context.annualAccumulated,
            remainingAmount = evaluation.remainingAmount,
            availableAt = evaluation.availableAt,
            notes = evaluation.notes ?: context.cardVoucher.description,
            canUse = status == "ACTIVE",
        )
    }

    private fun resolveDisplayStatus(
        unlockState: String,
        remainingCount: Int?,
        validUntil: LocalDate?,
        today: LocalDate,
    ): String {
        if (validUntil != null && validUntil.isBefore(today)) {
            return "EXPIRED"
        }
        if (remainingCount != null && remainingCount <= 0) {
            return "EXHAUSTED"
        }
        return when (unlockState) {
            "LOCKED" -> "LOCKED"
            "ELIGIBLE" -> "ELIGIBLE"
            else -> "ACTIVE"
        }
    }

    private fun parseStatus(raw: String?): VoucherQueryStatus {
        if (raw.isNullOrBlank()) {
            return VoucherQueryStatus.ALL
        }
        return runCatching { VoucherQueryStatus.valueOf(raw.trim().uppercase()) }
            .getOrElse { throw BadRequestException("Unsupported voucher status filter: $raw") }
    }

    private fun matchesFilter(
        item: VoucherSummaryResponse,
        status: VoucherQueryStatus,
    ): Boolean {
        return when (status) {
            VoucherQueryStatus.ALL -> true
            VoucherQueryStatus.ACTIVE -> item.status != "EXPIRED"
            VoucherQueryStatus.EXPIRED -> item.status == "EXPIRED"
        }
    }

    private fun writeLog(
        userVoucherId: Long,
        action: String,
        memo: String?,
    ) {
        val entity = UserVoucherLogEntity().apply {
            this.userVoucherId = userVoucherId
            voucherAction = action
            this.memo = memo?.trim()?.takeIf { it.isNotEmpty() }
            createdAt = OffsetDateTime.now(clock)
        }
        userVoucherLogRepository.save(entity)
    }
}
