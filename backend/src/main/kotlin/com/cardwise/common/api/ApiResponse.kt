package com.cardwise.common.api

data class ApiResponse<T>(
    val data: T,
    val meta: Map<String, Any?>? = null,
)

data class CountResponse(
    val count: Long,
)

data class PaginationMeta(
    val nextCursor: String? = null,
    val hasMore: Boolean = false,
    val limit: Int,
)
