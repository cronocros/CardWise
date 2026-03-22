package com.cardwise.ledger.application.port.`in`

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.api.CountResponse
import com.cardwise.ledger.application.dto.*
import java.util.UUID

interface PendingActionUseCase {
    fun listPendingActions(accountId: UUID, status: PendingActionStatus?, priority: Priority?, limit: Int): ApiResponse<List<PendingActionResponse>>
    fun countPendingActions(accountId: UUID, status: PendingActionStatus?): ApiResponse<CountResponse>
    fun resolvePendingAction(pendingActionId: Long, accountId: UUID, request: ResolvePendingActionRequest): ApiResponse<PendingActionResponse>
    fun dismissPendingAction(pendingActionId: Long, accountId: UUID): ApiResponse<PendingActionResponse>
}
