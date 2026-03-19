package com.cardwise.group.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.group.application.GroupService
import jakarta.validation.Valid
import java.time.LocalDate
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/groups")
class GroupController(
    private val groupService: GroupService,
    private val requestAccountIdResolver: RequestAccountIdResolver,
) {
    @PostMapping
    fun createGroup(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @Valid @RequestBody request: CreateGroupRequest,
    ): ApiResponse<GroupSummaryResponse> {
        return ApiResponse(
            data = groupService.createGroup(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                request = request,
            ),
        )
    }

    @GetMapping
    fun getGroups(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<GroupSummaryResponse>> {
        return ApiResponse(
            data = groupService.getGroups(requestAccountIdResolver.resolve(accountIdHeader)),
        )
    }

    @GetMapping("/invitations")
    fun getInvitations(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
    ): ApiResponse<List<GroupInvitationResponse>> {
        return ApiResponse(
            data = groupService.getInvitations(requestAccountIdResolver.resolve(accountIdHeader)),
        )
    }

    @PostMapping("/invitations/{invitationId}/accept")
    fun acceptInvitation(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable invitationId: Long,
    ): ApiResponse<GroupInvitationResponse> {
        return ApiResponse(
            data = groupService.acceptInvitation(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                invitationId = invitationId,
            ),
        )
    }

    @PostMapping("/invitations/{invitationId}/decline")
    fun declineInvitation(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable invitationId: Long,
    ): ApiResponse<GroupInvitationResponse> {
        return ApiResponse(
            data = groupService.declineInvitation(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                invitationId = invitationId,
            ),
        )
    }

    @GetMapping("/{groupId}/invitations")
    fun getGroupInvitations(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
    ): ApiResponse<List<GroupInvitationResponse>> {
        return ApiResponse(
            data = groupService.getGroupInvitations(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
            ),
        )
    }

    @PostMapping("/{groupId}/invite")
    fun inviteGroupMember(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: InviteGroupMemberRequest,
    ): ApiResponse<GroupInvitationResponse> {
        return ApiResponse(
            data = groupService.inviteMember(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                request = request,
            ),
        )
    }

    @GetMapping("/{groupId}/payments")
    fun getGroupPayments(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate?,
        @RequestParam(defaultValue = "40") limit: Int,
    ): ApiResponse<List<GroupPaymentResponse>> {
        return ApiResponse(
            data = groupService.getGroupPayments(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                from = from,
                to = to,
                limit = limit,
            ),
        )
    }

    @GetMapping("/{groupId}/stats")
    fun getGroupStats(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate?,
    ): ApiResponse<GroupStatsResponse> {
        return ApiResponse(
            data = groupService.getGroupStats(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                from = from,
                to = to,
            ),
        )
    }
}
