package com.cardwise.community.repository

import com.cardwise.community.dto.AuthorResponse
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class CommunityAccountRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate
) {
    fun findAuthorProfiles(accountIds: List<UUID>): Map<UUID, AuthorResponse> {
        if (accountIds.isEmpty()) return emptyMap()
        
        val sql = """
            select 
                a.account_id,
                a.email,
                ap.display_name,
                coalesce(ap.level, 1) as level,
                ap.tier_name
            from account a
            left join account_profile ap on ap.account_id = a.account_id
            where a.account_id in (:accountIds)
        """.trimIndent()
        
        val list = jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("accountIds", accountIds)
        ) { rs, _ ->
            AuthorResponse(
                accountId = UUID.fromString(rs.getString("account_id")),
                displayName = rs.getString("display_name") ?: rs.getString("email").substringBefore("@"),
                level = rs.getInt("level"),
                tierName = rs.getString("tier_name")
            )
        }
        return list.associateBy { it.accountId }
    }
}
