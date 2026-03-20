package com.cardwise.ledger.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.ledger.entity.TagEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import java.util.UUID

@Repository
interface TagRepository : JpaRepository<TagEntity, Long> {
    fun findAllByAccountIdOrderByTagNameAsc(accountId: UUID): List<TagEntity>
}

data class TagResponse(
    val tagId: Long,
    val tagName: String,
)

@Service
class TagService(
    private val tagRepository: TagRepository,
) {
    fun listTags(accountId: UUID): List<TagResponse> {
        return tagRepository.findAllByAccountIdOrderByTagNameAsc(accountId).map {
            TagResponse(it.tagId!!, it.tagName!!)
        }
    }
}

@RestController
@RequestMapping("/api/v1/tags")
class TagController(
    private val tagService: TagService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @GetMapping
    fun listTags(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<TagResponse>> {
        return ApiResponse(data = tagService.listTags(requestAccountIdResolver.resolve(accountIdHeader)))
    }
}
