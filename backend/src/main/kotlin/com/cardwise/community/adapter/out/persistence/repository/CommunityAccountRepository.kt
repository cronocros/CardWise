package com.cardwise.community.adapter.out.persistence.repository

import com.cardwise.community.application.dto.AuthorResponse
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
class CommunityAccountRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate
) {
    fun findAuthorProfiles(accountIds: Set<UUID>): Map<UUID, AuthorResponse> {
        if (accountIds.isEmpty()) return emptyMap()
        
        val sql = """
            select 
                a.account_id,
                a.email,
                ap.display_name,
                ap.profile_image_url
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
                nickname = rs.getString("display_name") ?: rs.getString("email").substringBefore("@"),
                profileImageUrl = rs.getString("profile_image_url")
            )
        }
        return list.associateBy { it.accountId }
    }
}
