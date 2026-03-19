package com.cardwise.group.api

import com.cardwise.common.api.ApiResponse
import com.cardwise.common.web.RequestAccountIdResolver
import com.cardwise.group.application.GroupService
import jakarta.validation.Valid
import java.time.LocalDate
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
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

    @GetMapping("/{groupId}")
    fun getGroupDetail(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
    ): ApiResponse<GroupDetailResponse> {
        return ApiResponse(
            data = groupService.getGroupDetail(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
            ),
        )
    }

    @PatchMapping("/{groupId}")
    fun updateGroup(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: UpdateGroupRequest,
    ): ApiResponse<GroupDetailResponse> {
        return ApiResponse(
            data = groupService.updateGroup(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                request = request,
            ),
        )
    }

    @DeleteMapping("/{groupId}")
    fun deleteGroup(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
    ): ApiResponse<GroupActionResponse> {
        return ApiResponse(
            data = groupService.deleteGroup(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
            ),
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

    @DeleteMapping("/{groupId}/invitations/{invitationId}")
    fun cancelInvitation(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @PathVariable invitationId: Long,
    ): ApiResponse<GroupActionResponse> {
        return ApiResponse(
            data = groupService.cancelInvitation(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                invitationId = invitationId,
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

    @PostMapping("/{groupId}/payments")
    fun createGroupPayment(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: CreateGroupPaymentRequest,
    ): ApiResponse<GroupPaymentResponse> {
        return ApiResponse(
            data = groupService.createGroupPayment(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                request = request,
            ),
        )
    }

    @PatchMapping("/{groupId}/payments/{paymentId}")
    fun updateGroupPayment(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @PathVariable paymentId: Long,
        @Valid @RequestBody request: UpdateGroupPaymentRequest,
    ): ApiResponse<GroupPaymentResponse> {
        return ApiResponse(
            data = groupService.updateGroupPayment(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                paymentId = paymentId,
                request = request,
            ),
        )
    }

    @DeleteMapping("/{groupId}/payments/{paymentId}")
    fun deleteGroupPayment(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @PathVariable paymentId: Long,
    ): ApiResponse<GroupActionResponse> {
        return ApiResponse(
            data = groupService.deleteGroupPayment(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                paymentId = paymentId,
            ),
        )
    }

    @DeleteMapping("/{groupId}/members/{memberAccountId}")
    fun removeMember(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @PathVariable memberAccountId: String,
    ): ApiResponse<GroupActionResponse> {
        return ApiResponse(
            data = groupService.removeMember(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                memberAccountId = memberAccountId,
            ),
        )
    }

    @PostMapping("/{groupId}/leave")
    fun leaveGroup(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
    ): ApiResponse<GroupActionResponse> {
        return ApiResponse(
            data = groupService.leaveGroup(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
            ),
        )
    }

    @PostMapping("/{groupId}/transfer-ownership")
    fun transferOwnership(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: TransferOwnershipRequest,
    ): ApiResponse<GroupDetailResponse> {
        return ApiResponse(
            data = groupService.transferOwnership(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                request = request,
            ),
        )
    }

    @GetMapping("/{groupId}/tags")
    fun getGroupTags(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
    ): ApiResponse<List<GroupTagResponse>> {
        return ApiResponse(
            data = groupService.getGroupTags(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
            ),
        )
    }

    @PostMapping("/{groupId}/tags")
    fun createGroupTag(
        @RequestHeader(name = "X-Account-Id", required = false) accountIdHeader: String?,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: CreateGroupTagRequest,
    ): ApiResponse<GroupTagResponse> {
        return ApiResponse(
            data = groupService.createGroupTag(
                accountId = requestAccountIdResolver.resolve(accountIdHeader),
                groupId = groupId,
                request = request,
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
