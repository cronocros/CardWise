package com.cardwise.group.infrastructure

import java.sql.ResultSet
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.YearMonth
import java.util.UUID
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

data class CurrentAccountRow(
    val accountId: UUID,
    val email: String,
    val displayName: String,
)

data class GroupMembershipRow(
    val groupId: Long,
    val groupName: String,
    val description: String?,
    val role: String,
    val ownerAccountId: UUID,
    val maxMembers: Int,
)

data class GroupConfigRow(
    val groupId: Long,
    val groupName: String,
    val description: String?,
    val ownerAccountId: UUID,
    val maxMembers: Int,
)

data class GroupSummaryRow(
    val groupId: Long,
    val groupName: String,
    val description: String?,
    val role: String,
    val memberCount: Int,
    val currentMonthSpent: Long,
    val maxMembers: Int,
)

data class GroupInvitationRow(
    val invitationId: Long,
    val groupId: Long,
    val groupName: String,
    val inviterId: UUID,
    val inviterName: String,
    val inviteeEmail: String,
    val invitationStatus: String,
    val expiresAt: OffsetDateTime,
    val createdAt: OffsetDateTime,
)

data class GroupPaymentRow(
    val paymentId: Long,
    val accountId: UUID,
    val userCardId: Long,
    val payerName: String,
    val merchantName: String,
    val amount: Long,
    val paidAt: OffsetDateTime,
    val currency: String,
    val memo: String?,
)

data class GroupMemberDetailRow(
    val accountId: UUID,
    val email: String,
    val displayName: String,
    val role: String,
    val joinedAt: OffsetDateTime,
)

data class GroupTagRow(
    val tagId: Long,
    val tagName: String,
    val color: String?,
)

data class GroupMemberStatsRow(
    val accountId: UUID,
    val displayName: String,
    val spentAmount: Long,
    val paymentCount: Int,
)

data class GroupTagStatsRow(
    val tagName: String,
    val spentAmount: Long,
    val paymentCount: Int,
)

data class GroupTrendRow(
    val yearMonth: String,
    val totalSpent: Long,
    val paymentCount: Int,
)

@Repository
class GroupRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) {
    fun findCurrentAccount(accountId: UUID): CurrentAccountRow? {
        val sql = """
            select
                a.account_id,
                a.email,
                coalesce(ap.display_name, a.email) as display_name
            from account a
            left join account_profile ap on ap.account_id = a.account_id
            where a.account_id = :accountId
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("accountId", accountId),
            ::mapCurrentAccount,
        ).firstOrNull()
    }

    fun createGroup(
        ownerAccountId: UUID,
        groupName: String,
        description: String?,
    ): Long {
        val sql = """
            insert into ledger_group (group_name, description, owner_account_id)
            values (:groupName, :description, :ownerAccountId)
            returning group_id
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource()
                .addValue("groupName", groupName)
                .addValue("description", description)
                .addValue("ownerAccountId", ownerAccountId),
            Long::class.java,
        )!!
    }

    fun updateGroup(groupId: Long, groupName: String?, description: String?) {
        val sql = """
            update ledger_group
            set group_name = coalesce(:groupName, group_name),
                description = coalesce(:description, description),
                updated_at = now()
            where group_id = :groupId
              and deleted_at is null
        """.trimIndent()

        jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("groupName", groupName)
                .addValue("description", description),
        )
    }

    fun softDeleteGroup(groupId: Long) {
        val sql = """
            update ledger_group
            set deleted_at = now(),
                updated_at = now()
            where group_id = :groupId
              and deleted_at is null
        """.trimIndent()

        jdbcTemplate.update(sql, MapSqlParameterSource().addValue("groupId", groupId))
    }

    fun insertGroupMember(groupId: Long, accountId: UUID, role: String) {
        val sql = """
            insert into group_member (group_id, account_id, role)
            values (:groupId, :accountId, cast(:role as group_role_enum))
            on conflict (group_id, account_id) do nothing
        """.trimIndent()

        jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("accountId", accountId)
                .addValue("role", role),
        )
    }

    fun updateMemberRole(groupId: Long, accountId: UUID, role: String) {
        val sql = """
            update group_member
            set role = cast(:role as group_role_enum)
            where group_id = :groupId
              and account_id = :accountId
        """.trimIndent()

        jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("accountId", accountId)
                .addValue("role", role),
        )
    }

    fun updateGroupOwner(groupId: Long, ownerAccountId: UUID) {
        val sql = """
            update ledger_group
            set owner_account_id = :ownerAccountId,
                updated_at = now()
            where group_id = :groupId
              and deleted_at is null
        """.trimIndent()

        jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("ownerAccountId", ownerAccountId),
        )
    }

    fun deleteGroupMember(groupId: Long, accountId: UUID): Int {
        val sql = """
            delete from group_member
            where group_id = :groupId
              and account_id = :accountId
        """.trimIndent()

        return jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("accountId", accountId),
        )
    }

    fun findGroups(accountId: UUID, month: YearMonth): List<GroupSummaryRow> {
        val start = month.atDay(1).atStartOfDay().atOffset(java.time.ZoneOffset.UTC)
        val end = month.plusMonths(1).atDay(1).atStartOfDay().atOffset(java.time.ZoneOffset.UTC)

        val sql = """
            select
                g.group_id,
                g.group_name,
                g.description,
                gm.role::text as role,
                member_counts.member_count,
                coalesce(month_spend.current_month_spent, 0) as current_month_spent,
                g.max_members
            from group_member gm
            join ledger_group g on g.group_id = gm.group_id
            join (
                select group_id, count(*)::int as member_count
                from group_member
                group by group_id
            ) member_counts on member_counts.group_id = g.group_id
            left join (
                select
                    p.group_id,
                    sum(coalesce(p.final_krw_amount, p.krw_amount)) as current_month_spent
                from payment p
                where p.deleted_at is null
                  and p.group_id is not null
                  and p.paid_at >= :fromInclusive
                  and p.paid_at < :toExclusive
                group by p.group_id
            ) month_spend on month_spend.group_id = g.group_id
            where gm.account_id = :accountId
            order by current_month_spent desc, g.group_name asc
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource()
                .addValue("accountId", accountId)
                .addValue("fromInclusive", start)
                .addValue("toExclusive", end),
            ::mapGroupSummary,
        )
    }

    fun findMembership(groupId: Long, accountId: UUID): GroupMembershipRow? {
        val sql = """
            select
                g.group_id,
                g.group_name,
                g.description,
                gm.role::text as role,
                g.owner_account_id,
                g.max_members
            from group_member gm
            join ledger_group g on g.group_id = gm.group_id
            where gm.group_id = :groupId
              and gm.account_id = :accountId
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("accountId", accountId),
            ::mapMembership,
        ).firstOrNull()
    }

    fun findGroupConfig(groupId: Long): GroupConfigRow? {
        val sql = """
            select
                g.group_id,
                g.group_name,
                g.description,
                g.owner_account_id,
                g.max_members
            from ledger_group g
            where g.group_id = :groupId
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("groupId", groupId),
            ::mapGroupConfig,
        ).firstOrNull()
    }

    fun countMembers(groupId: Long): Int {
        val sql = "select count(*) from group_member where group_id = :groupId"
        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource().addValue("groupId", groupId),
            Int::class.java,
        ) ?: 0
    }

    fun hasPendingInvitation(groupId: Long, inviteeEmail: String): Boolean {
        val sql = """
            select exists(
                select 1
                from group_invitation
                where group_id = :groupId
                  and lower(invitee_email) = lower(:inviteeEmail)
                  and invitation_status = 'PENDING'
                  and expires_at >= now()
            )
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("inviteeEmail", inviteeEmail),
            Boolean::class.java,
        ) ?: false
    }

    fun isExistingMemberByEmail(groupId: Long, inviteeEmail: String): Boolean {
        val sql = """
            select exists(
                select 1
                from group_member gm
                join account a on a.account_id = gm.account_id
                where gm.group_id = :groupId
                  and lower(a.email) = lower(:inviteeEmail)
            )
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("inviteeEmail", inviteeEmail),
            Boolean::class.java,
        ) ?: false
    }

    fun createInvitation(groupId: Long, inviterId: UUID, inviteeEmail: String): Long {
        val sql = """
            insert into group_invitation (
                group_id,
                inviter_id,
                invitee_email,
                invitation_status,
                expires_at
            )
            values (
                :groupId,
                :inviterId,
                :inviteeEmail,
                'PENDING',
                now() + interval '7 days'
            )
            returning invitation_id
        """.trimIndent()

        return jdbcTemplate.queryForObject(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("inviterId", inviterId)
                .addValue("inviteeEmail", inviteeEmail),
            Long::class.java,
        )!!
    }

    fun expireInvitationsForEmail(email: String) {
        val sql = """
            update group_invitation
            set invitation_status = 'EXPIRED',
                updated_at = now()
            where lower(invitee_email) = lower(:email)
              and invitation_status = 'PENDING'
              and expires_at < now()
        """.trimIndent()

        jdbcTemplate.update(sql, MapSqlParameterSource().addValue("email", email))
    }

    fun findInvitationsByEmail(email: String): List<GroupInvitationRow> {
        val sql = """
            select
                gi.invitation_id,
                gi.group_id,
                g.group_name,
                coalesce(ap.display_name, a.email) as inviter_name,
                gi.invitee_email,
                gi.invitation_status::text as invitation_status,
                gi.expires_at,
                gi.created_at
            from group_invitation gi
            join ledger_group g on g.group_id = gi.group_id
            join account a on a.account_id = gi.inviter_id
            left join account_profile ap on ap.account_id = a.account_id
            where lower(gi.invitee_email) = lower(:email)
              and gi.invitation_status = 'PENDING'
            order by gi.created_at desc
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("email", email),
            ::mapInvitation,
        )
    }

    fun findGroupInvitations(groupId: Long): List<GroupInvitationRow> {
        val sql = """
            select
                gi.invitation_id,
                gi.group_id,
                g.group_name,
                coalesce(ap.display_name, a.email) as inviter_name,
                gi.invitee_email,
                gi.invitation_status::text as invitation_status,
                gi.expires_at,
                gi.created_at
            from group_invitation gi
            join ledger_group g on g.group_id = gi.group_id
            join account a on a.account_id = gi.inviter_id
            left join account_profile ap on ap.account_id = a.account_id
            where gi.group_id = :groupId
              and gi.invitation_status = 'PENDING'
            order by gi.created_at desc
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("groupId", groupId),
            ::mapInvitation,
        )
    }

    fun findInvitation(invitationId: Long): GroupInvitationRow? {
        val sql = """
            select
                gi.invitation_id,
                gi.group_id,
                g.group_name,
                coalesce(ap.display_name, a.email) as inviter_name,
                gi.invitee_email,
                gi.invitation_status::text as invitation_status,
                gi.expires_at,
                gi.created_at
            from group_invitation gi
            join ledger_group g on g.group_id = gi.group_id
            join account a on a.account_id = gi.inviter_id
            left join account_profile ap on ap.account_id = a.account_id
            where gi.invitation_id = :invitationId
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("invitationId", invitationId),
            ::mapInvitation,
        ).firstOrNull()
    }

    fun updateInvitationStatus(invitationId: Long, status: String) {
        val sql = """
            update group_invitation
            set invitation_status = cast(:status as invitation_status_enum),
                updated_at = now()
            where invitation_id = :invitationId
        """.trimIndent()

        jdbcTemplate.update(
            sql,
            MapSqlParameterSource()
                .addValue("invitationId", invitationId)
                .addValue("status", status),
        )
    }

    fun findGroupPayments(groupId: Long, from: LocalDate, to: LocalDate, limit: Int): List<GroupPaymentRow> {
        val sql = """
            select
                p.payment_id,
                p.account_id,
                coalesce(ap.display_name, a.email) as payer_name,
                p.merchant_name_raw,
                coalesce(p.final_krw_amount, p.krw_amount) as amount,
                p.paid_at,
                p.currency::text as currency,
                p.memo
            from payment p
            join account a on a.account_id = p.account_id
            left join account_profile ap on ap.account_id = a.account_id
            where p.group_id = :groupId
              and p.deleted_at is null
              and p.paid_at >= :fromInclusive
              and p.paid_at < :toExclusive
            order by p.paid_at desc, p.payment_id desc
            limit :limit
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("fromInclusive", from.atStartOfDay().atOffset(java.time.ZoneOffset.UTC))
                .addValue("toExclusive", to.plusDays(1).atStartOfDay().atOffset(java.time.ZoneOffset.UTC))
                .addValue("limit", limit),
            ::mapPayment,
        )
    }

    fun findGroupMemberStats(groupId: Long, from: LocalDate, to: LocalDate): List<GroupMemberStatsRow> {
        val sql = """
            select
                p.account_id,
                coalesce(ap.display_name, a.email) as display_name,
                sum(coalesce(p.final_krw_amount, p.krw_amount)) as spent_amount,
                count(*)::int as payment_count
            from payment p
            join account a on a.account_id = p.account_id
            left join account_profile ap on ap.account_id = a.account_id
            where p.group_id = :groupId
              and p.deleted_at is null
              and p.paid_at >= :fromInclusive
              and p.paid_at < :toExclusive
            group by p.account_id, coalesce(ap.display_name, a.email)
            order by spent_amount desc, display_name asc
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            buildDateParams(groupId, from, to),
            ::mapMemberStats,
        )
    }

    fun findGroupTagStats(groupId: Long, from: LocalDate, to: LocalDate): List<GroupTagStatsRow> {
        val sql = """
            select
                coalesce(t.tag_name, '미분류') as tag_name,
                sum(pi.amount) as spent_amount,
                count(*)::int as payment_count
            from payment p
            join payment_item pi on pi.payment_id = p.payment_id
            left join payment_item_tag pit on pit.payment_item_id = pi.payment_item_id
            left join tag t on t.tag_id = pit.tag_id
            where p.group_id = :groupId
              and p.deleted_at is null
              and p.paid_at >= :fromInclusive
              and p.paid_at < :toExclusive
            group by coalesce(t.tag_name, '미분류')
            order by spent_amount desc, tag_name asc
            limit 10
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            buildDateParams(groupId, from, to),
            ::mapTagStats,
        )
    }

    fun findGroupMonthlyTrend(groupId: Long, limit: Int): List<GroupTrendRow> {
        val sql = """
            select
                summary.year_month,
                summary.total_spent,
                summary.payment_count
            from (
                select
                    to_char(date_trunc('month', p.paid_at), 'YYYY-MM') as year_month,
                    sum(coalesce(p.final_krw_amount, p.krw_amount)) as total_spent,
                    count(*)::int as payment_count
                from payment p
                where p.group_id = :groupId
                  and p.deleted_at is null
                group by date_trunc('month', p.paid_at)
                order by date_trunc('month', p.paid_at) desc
                limit :limit
            ) summary
            order by summary.year_month asc
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource()
                .addValue("groupId", groupId)
                .addValue("limit", limit),
            ::mapTrend,
        )
    }

    private fun buildDateParams(groupId: Long, from: LocalDate, to: LocalDate): MapSqlParameterSource {
        return MapSqlParameterSource()
            .addValue("groupId", groupId)
            .addValue("fromInclusive", from.atStartOfDay().atOffset(java.time.ZoneOffset.UTC))
            .addValue("toExclusive", to.plusDays(1).atStartOfDay().atOffset(java.time.ZoneOffset.UTC))
    }

    private fun mapCurrentAccount(resultSet: ResultSet, rowNum: Int): CurrentAccountRow {
        return CurrentAccountRow(
            accountId = UUID.fromString(resultSet.getString("account_id")),
            email = resultSet.getString("email"),
            displayName = resultSet.getString("display_name"),
        )
    }

    private fun mapMembership(resultSet: ResultSet, rowNum: Int): GroupMembershipRow {
        return GroupMembershipRow(
            groupId = resultSet.getLong("group_id"),
            groupName = resultSet.getString("group_name"),
            description = resultSet.getString("description"),
            role = resultSet.getString("role"),
            ownerAccountId = UUID.fromString(resultSet.getString("owner_account_id")),
            maxMembers = resultSet.getInt("max_members"),
        )
    }

    private fun mapGroupSummary(resultSet: ResultSet, rowNum: Int): GroupSummaryRow {
        return GroupSummaryRow(
            groupId = resultSet.getLong("group_id"),
            groupName = resultSet.getString("group_name"),
            description = resultSet.getString("description"),
            role = resultSet.getString("role"),
            memberCount = resultSet.getInt("member_count"),
            currentMonthSpent = resultSet.getLong("current_month_spent"),
            maxMembers = resultSet.getInt("max_members"),
        )
    }

    private fun mapGroupConfig(resultSet: ResultSet, rowNum: Int): GroupConfigRow {
        return GroupConfigRow(
            groupId = resultSet.getLong("group_id"),
            groupName = resultSet.getString("group_name"),
            description = resultSet.getString("description"),
            ownerAccountId = UUID.fromString(resultSet.getString("owner_account_id")),
            maxMembers = resultSet.getInt("max_members"),
        )
    }

    private fun mapInvitation(resultSet: ResultSet, rowNum: Int): GroupInvitationRow {
        return GroupInvitationRow(
            invitationId = resultSet.getLong("invitation_id"),
            groupId = resultSet.getLong("group_id"),
            groupName = resultSet.getString("group_name"),
            inviterName = resultSet.getString("inviter_name"),
            inviteeEmail = resultSet.getString("invitee_email"),
            invitationStatus = resultSet.getString("invitation_status"),
            expiresAt = resultSet.getObject("expires_at", OffsetDateTime::class.java),
            createdAt = resultSet.getObject("created_at", OffsetDateTime::class.java),
        )
    }

    private fun mapPayment(resultSet: ResultSet, rowNum: Int): GroupPaymentRow {
        return GroupPaymentRow(
            paymentId = resultSet.getLong("payment_id"),
            accountId = UUID.fromString(resultSet.getString("account_id")),
            payerName = resultSet.getString("payer_name"),
            merchantName = resultSet.getString("merchant_name_raw"),
            amount = resultSet.getLong("amount"),
            paidAt = resultSet.getObject("paid_at", OffsetDateTime::class.java),
            currency = resultSet.getString("currency"),
            memo = resultSet.getString("memo"),
        )
    }

    private fun mapMemberStats(resultSet: ResultSet, rowNum: Int): GroupMemberStatsRow {
        return GroupMemberStatsRow(
            accountId = UUID.fromString(resultSet.getString("account_id")),
            displayName = resultSet.getString("display_name"),
            spentAmount = resultSet.getLong("spent_amount"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }

    private fun mapTagStats(resultSet: ResultSet, rowNum: Int): GroupTagStatsRow {
        return GroupTagStatsRow(
            tagName = resultSet.getString("tag_name"),
            spentAmount = resultSet.getLong("spent_amount"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }

    private fun mapTrend(resultSet: ResultSet, rowNum: Int): GroupTrendRow {
        return GroupTrendRow(
            yearMonth = resultSet.getString("year_month"),
            totalSpent = resultSet.getLong("total_spent"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }
}
