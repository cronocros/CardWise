package com.cardwise.ledger.application.service

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.api.CountResponse
import com.cardwise.common.api.PaginationMeta
import com.cardwise.common.exception.NotFoundException
import com.cardwise.ledger.application.port.`in`.PendingActionUseCase
import com.cardwise.ledger.application.port.out.PaymentPersistencePort
import com.cardwise.ledger.application.dto.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import java.util.*

@Service
@Transactional(readOnly = true)
class PendingActionApplicationService(
    private val persistencePort: PaymentPersistencePort
) : PendingActionUseCase {

    override fun listPendingActions(
        accountId: UUID,
        status: PendingActionStatus?,
        priority: Priority?,
        limit: Int
    ): ApiResponse<List<PendingActionResponse>> {
        val normalizedLimit = limit.coerceIn(1, 100)
        val domainRows = persistencePort.findPendingActions(accountId, normalizedLimit + 1)
        
        val hasMore = domainRows.size > normalizedLimit
        val visible = domainRows.take(normalizedLimit).map { it.toResponse() }
        val nextCursor = if (hasMore) visible.lastOrNull()?.pendingActionId?.toString() else null

        return ApiResponse(
            data = visible,
            meta = mapOf("pagination" to PaginationMeta(nextCursor = nextCursor, hasMore = hasMore, limit = normalizedLimit)),
        )
    }

    override fun countPendingActions(accountId: UUID, status: PendingActionStatus?): ApiResponse<CountResponse> {
        val count = persistencePort.countPendingActions(accountId)
        return ApiResponse(data = CountResponse(count))
    }

    @Transactional
    override fun resolvePendingAction(
        pendingActionId: Long,
        accountId: UUID,
        request: ResolvePendingActionRequest
    ): ApiResponse<PendingActionResponse> {
        val existing = persistencePort.findPendingActionById(pendingActionId, accountId)
            ?: throw NotFoundException("Pending action not found")
        
        // Logical check and resolution logic
        val resolved = existing.copy(
            status = com.cardwise.ledger.domain.model.PendingActionStatus.RESOLVED,
            resolvedAt = OffsetDateTime.now()
        )
        
        val saved = persistencePort.savePendingAction(resolved)
        return ApiResponse(data = saved.toResponse())
    }

    @Transactional
    override fun dismissPendingAction(pendingActionId: Long, accountId: UUID): ApiResponse<PendingActionResponse> {
        val existing = persistencePort.findPendingActionById(pendingActionId, accountId)
            ?: throw NotFoundException("Pending action not found")
        
        val dismissed = existing.copy(
            status = com.cardwise.ledger.domain.model.PendingActionStatus.DISMISSED,
            resolvedAt = OffsetDateTime.now()
        )
        
        val saved = persistencePort.savePendingAction(dismissed)
        return ApiResponse(data = saved.toResponse())
    }

    // Mapper helper
    private fun com.cardwise.ledger.domain.model.PendingAction.toResponse() = PendingActionResponse(
        pendingActionId = pendingActionId!!,
        actionType = PendingActionType.valueOf(actionType),
        referenceTable = referenceTable,
        referenceId = referenceId,
        title = title,
        description = description,
        status = PendingActionStatus.valueOf(status.name),
        priority = Priority.valueOf(priority.name),
        createdAt = createdAt,
        resolvedAt = resolvedAt
    )
}
