package com.cardwise.benefit.infrastructure

import java.math.BigDecimal
import java.sql.ResultSet
import java.util.UUID
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

data class BenefitCategoryRow(
    val categoryId: Long,
    val categoryName: String,
    val benefitCount: Int,
)

data class BenefitSearchRow(
    val cardBenefitId: Long,
    val cardId: Long,
    val cardName: String,
    val cardCompanyName: String,
    val cardImageUrl: String?,
    val benefitType: String,
    val discountType: String,
    val discountValue: BigDecimal,
    val monthlyLimitCount: Int?,
    val monthlyLimitAmount: Long?,
    val minPaymentAmount: Long?,
    val description: String?,
    val categoryId: Long?,
    val categoryName: String?,
    val merchantId: Long?,
    val merchantName: String?,
    val performanceTierId: Long?,
    val tierName: String?,
    val requiredPerformanceAmount: Long?,
    val maxPerformanceAmount: Long?,
    val userCardId: Long?,
    val cardNickname: String?,
    val currentSpent: Long?,
    val annualAccumulated: Long?,
    val latestPerformanceMonth: String?,
    val isEligible: Boolean,
    val remainingToEligible: Long?,
)

data class CardBenefitHeaderRow(
    val cardId: Long,
    val cardName: String,
    val cardCompanyName: String,
    val cardImageUrl: String?,
    val userCardId: Long?,
    val cardNickname: String?,
    val currentSpent: Long?,
    val latestPerformanceMonth: String?,
)

@Repository
class BenefitReadRepository(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) {
    fun findCategories(limit: Int): List<BenefitCategoryRow> {
        val sql = """
            select
                resolved_category.category_id,
                resolved_category.category_name,
                count(*)::int as benefit_count
            from card_benefit cb
            join card c on c.card_id = cb.card_id
            left join merchant m on m.merchant_id = cb.merchant_id
            join category resolved_category
              on resolved_category.category_id = coalesce(cb.category_id, m.category_id)
            where c.is_active = true
              and cb.is_active = true
              and (cb.valid_from is null or cb.valid_from <= current_date)
              and (cb.valid_until is null or cb.valid_until >= current_date)
            group by resolved_category.category_id, resolved_category.category_name
            order by benefit_count desc, resolved_category.category_name asc
            limit :limit
        """.trimIndent()

        return jdbcTemplate.query(
            sql,
            MapSqlParameterSource().addValue("limit", limit),
            ::mapCategory,
        )
    }

    fun searchBenefits(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        benefitType: String?,
        myCardsOnly: Boolean,
        limit: Int,
    ): List<BenefitSearchRow> {
        val sql = """
            with latest_performance as (
                select distinct on (up.user_card_id)
                    up.user_card_id,
                    up.performance_tier_id,
                    up.year_month,
                    up.monthly_spent,
                    up.annual_accumulated
                from user_performance up
                order by up.user_card_id, up.year_month desc
            )
            select
                cb.card_benefit_id,
                c.card_id,
                c.card_name,
                cc.company_name as card_company_name,
                c.image_url as card_image_url,
                cb.benefit_type::text as benefit_type,
                cb.discount_type::text as discount_type,
                cb.discount_value,
                cb.monthly_limit_count,
                cb.monthly_limit_amount,
                cb.min_payment_amount,
                cb.description,
                resolved_category.category_id,
                resolved_category.category_name,
                m.merchant_id,
                m.merchant_name,
                pt.performance_tier_id,
                pt.tier_name,
                pt.min_amount as required_performance_amount,
                pt.max_amount as max_performance_amount,
                uc.user_card_id,
                uc.card_nickname,
                lp.monthly_spent as current_spent,
                lp.annual_accumulated,
                lp.year_month as latest_performance_month,
                case
                    when uc.user_card_id is null then false
                    when pt.performance_tier_id is null then true
                    else coalesce(lp.monthly_spent, 0) >= pt.min_amount
                end as is_eligible,
                case
                    when uc.user_card_id is null then null
                    when pt.performance_tier_id is null then 0
                    else greatest(pt.min_amount - coalesce(lp.monthly_spent, 0), 0)
                end as remaining_to_eligible
            from card_benefit cb
            join card c on c.card_id = cb.card_id
            join card_company cc on cc.card_company_id = c.card_company_id
            left join merchant m on m.merchant_id = cb.merchant_id
            left join category resolved_category
              on resolved_category.category_id = coalesce(cb.category_id, m.category_id)
            left join performance_tier pt on pt.performance_tier_id = cb.performance_tier_id
            left join lateral (
                select
                    user_card_id,
                    card_nickname
                from user_card
                where card_id = c.card_id
                  and account_id = :accountId
                  and is_active = true
                order by is_primary desc, issued_at asc, user_card_id asc
                limit 1
            ) uc on true
            left join latest_performance lp on lp.user_card_id = uc.user_card_id
            where c.is_active = true
              and cb.is_active = true
              and (cb.valid_from is null or cb.valid_from <= current_date)
              and (cb.valid_until is null or cb.valid_until >= current_date)
              and (:myCardsOnly = false or uc.user_card_id is not null)
              and (cast(:categoryId as bigint) is null or resolved_category.category_id = cast(:categoryId as bigint))
              and (cast(:benefitType as text) is null or cb.benefit_type::text = cast(:benefitType as text))
              and (
                    cast(:keyword as text) is null
                 or c.card_name ilike cast(:keyword as text)
                 or cc.company_name ilike cast(:keyword as text)
                 or coalesce(cb.description, '') ilike cast(:keyword as text)
                 or coalesce(resolved_category.category_name, '') ilike cast(:keyword as text)
                 or coalesce(m.merchant_name, '') ilike cast(:keyword as text)
                 or exists (
                        select 1
                        from merchant_alias ma
                        where ma.merchant_id = m.merchant_id
                          and ma.alias_name ilike cast(:keyword as text)
                    )
              )
            order by
                case
                    when uc.user_card_id is not null and (
                        pt.performance_tier_id is null or coalesce(lp.monthly_spent, 0) >= pt.min_amount
                    ) then 0
                    when uc.user_card_id is not null then 1
                    else 2
                end asc,
                case cb.discount_type
                    when 'RATE' then cb.discount_value
                    else cb.discount_value / 1000.0
                end desc,
                c.card_name asc,
                cb.card_benefit_id asc
            limit :limit
        """.trimIndent()

        val params = buildSearchParams(accountId, query, categoryId, benefitType, myCardsOnly, limit)
        return jdbcTemplate.query(sql, params, ::mapBenefitSearch)
    }

    fun findCardBenefitHeader(accountId: UUID, cardId: Long): CardBenefitHeaderRow? {
        val sql = """
            with latest_performance as (
                select distinct on (up.user_card_id)
                    up.user_card_id,
                    up.year_month,
                    up.monthly_spent
                from user_performance up
                order by up.user_card_id, up.year_month desc
            )
            select
                c.card_id,
                c.card_name,
                cc.company_name as card_company_name,
                c.image_url as card_image_url,
                uc.user_card_id,
                uc.card_nickname,
                lp.monthly_spent as current_spent,
                lp.year_month as latest_performance_month
            from card c
            join card_company cc on cc.card_company_id = c.card_company_id
            left join lateral (
                select
                    user_card_id,
                    card_nickname
                from user_card
                where card_id = c.card_id
                  and account_id = :accountId
                  and is_active = true
                order by is_primary desc, issued_at asc, user_card_id asc
                limit 1
            ) uc on true
            left join latest_performance lp on lp.user_card_id = uc.user_card_id
            where c.card_id = :cardId
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("cardId", cardId)

        return jdbcTemplate.query(sql, params, ::mapHeader).firstOrNull()
    }

    fun findCardBenefits(accountId: UUID, cardId: Long): List<BenefitSearchRow> {
        val sql = """
            with latest_performance as (
                select distinct on (up.user_card_id)
                    up.user_card_id,
                    up.performance_tier_id,
                    up.year_month,
                    up.monthly_spent,
                    up.annual_accumulated
                from user_performance up
                order by up.user_card_id, up.year_month desc
            )
            select
                cb.card_benefit_id,
                c.card_id,
                c.card_name,
                cc.company_name as card_company_name,
                c.image_url as card_image_url,
                cb.benefit_type::text as benefit_type,
                cb.discount_type::text as discount_type,
                cb.discount_value,
                cb.monthly_limit_count,
                cb.monthly_limit_amount,
                cb.min_payment_amount,
                cb.description,
                resolved_category.category_id,
                resolved_category.category_name,
                m.merchant_id,
                m.merchant_name,
                pt.performance_tier_id,
                pt.tier_name,
                pt.min_amount as required_performance_amount,
                pt.max_amount as max_performance_amount,
                uc.user_card_id,
                uc.card_nickname,
                lp.monthly_spent as current_spent,
                lp.annual_accumulated,
                lp.year_month as latest_performance_month,
                case
                    when uc.user_card_id is null then false
                    when pt.performance_tier_id is null then true
                    else coalesce(lp.monthly_spent, 0) >= pt.min_amount
                end as is_eligible,
                case
                    when uc.user_card_id is null then null
                    when pt.performance_tier_id is null then 0
                    else greatest(pt.min_amount - coalesce(lp.monthly_spent, 0), 0)
                end as remaining_to_eligible
            from card_benefit cb
            join card c on c.card_id = cb.card_id
            join card_company cc on cc.card_company_id = c.card_company_id
            left join merchant m on m.merchant_id = cb.merchant_id
            left join category resolved_category
              on resolved_category.category_id = coalesce(cb.category_id, m.category_id)
            left join performance_tier pt on pt.performance_tier_id = cb.performance_tier_id
            left join lateral (
                select
                    user_card_id,
                    card_nickname
                from user_card
                where card_id = c.card_id
                  and account_id = :accountId
                  and is_active = true
                order by is_primary desc, issued_at asc, user_card_id asc
                limit 1
            ) uc on true
            left join latest_performance lp on lp.user_card_id = uc.user_card_id
            where c.card_id = :cardId
              and c.is_active = true
              and cb.is_active = true
              and (cb.valid_from is null or cb.valid_from <= current_date)
              and (cb.valid_until is null or cb.valid_until >= current_date)
            order by
                case when pt.min_amount is null then 0 else pt.min_amount end asc,
                resolved_category.category_name asc nulls last,
                m.merchant_name asc nulls last,
                cb.card_benefit_id asc
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("cardId", cardId)

        return jdbcTemplate.query(sql, params, ::mapBenefitSearch)
    }

    private fun buildSearchParams(
        accountId: UUID,
        query: String?,
        categoryId: Long?,
        benefitType: String?,
        myCardsOnly: Boolean,
        limit: Int,
    ): MapSqlParameterSource {
        val keyword = query
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?.let { "%$it%" }

        return MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("keyword", keyword)
            .addValue("categoryId", categoryId)
            .addValue("benefitType", benefitType)
            .addValue("myCardsOnly", myCardsOnly)
            .addValue("limit", limit)
    }

    private fun mapCategory(resultSet: ResultSet, rowNum: Int): BenefitCategoryRow {
        return BenefitCategoryRow(
            categoryId = resultSet.getLong("category_id"),
            categoryName = resultSet.getString("category_name"),
            benefitCount = resultSet.getInt("benefit_count"),
        )
    }

    private fun mapHeader(resultSet: ResultSet, rowNum: Int): CardBenefitHeaderRow {
        return CardBenefitHeaderRow(
            cardId = resultSet.getLong("card_id"),
            cardName = resultSet.getString("card_name"),
            cardCompanyName = resultSet.getString("card_company_name"),
            cardImageUrl = resultSet.getString("card_image_url"),
            userCardId = resultSet.getLongOrNull("user_card_id"),
            cardNickname = resultSet.getString("card_nickname"),
            currentSpent = resultSet.getLongOrNull("current_spent"),
            latestPerformanceMonth = resultSet.getString("latest_performance_month"),
        )
    }

    private fun mapBenefitSearch(resultSet: ResultSet, rowNum: Int): BenefitSearchRow {
        return BenefitSearchRow(
            cardBenefitId = resultSet.getLong("card_benefit_id"),
            cardId = resultSet.getLong("card_id"),
            cardName = resultSet.getString("card_name"),
            cardCompanyName = resultSet.getString("card_company_name"),
            cardImageUrl = resultSet.getString("card_image_url"),
            benefitType = resultSet.getString("benefit_type"),
            discountType = resultSet.getString("discount_type"),
            discountValue = resultSet.getBigDecimal("discount_value"),
            monthlyLimitCount = resultSet.getIntOrNull("monthly_limit_count"),
            monthlyLimitAmount = resultSet.getLongOrNull("monthly_limit_amount"),
            minPaymentAmount = resultSet.getLongOrNull("min_payment_amount"),
            description = resultSet.getString("description"),
            categoryId = resultSet.getLongOrNull("category_id"),
            categoryName = resultSet.getString("category_name"),
            merchantId = resultSet.getLongOrNull("merchant_id"),
            merchantName = resultSet.getString("merchant_name"),
            performanceTierId = resultSet.getLongOrNull("performance_tier_id"),
            tierName = resultSet.getString("tier_name"),
            requiredPerformanceAmount = resultSet.getLongOrNull("required_performance_amount"),
            maxPerformanceAmount = resultSet.getLongOrNull("max_performance_amount"),
            userCardId = resultSet.getLongOrNull("user_card_id"),
            cardNickname = resultSet.getString("card_nickname"),
            currentSpent = resultSet.getLongOrNull("current_spent"),
            annualAccumulated = resultSet.getLongOrNull("annual_accumulated"),
            latestPerformanceMonth = resultSet.getString("latest_performance_month"),
            isEligible = resultSet.getBoolean("is_eligible"),
            remainingToEligible = resultSet.getLongOrNull("remaining_to_eligible"),
        )
    }
}

private fun ResultSet.getLongOrNull(columnLabel: String): Long? {
    val value = getLong(columnLabel)
    return if (wasNull()) null else value
}

private fun ResultSet.getIntOrNull(columnLabel: String): Int? {
    val value = getInt(columnLabel)
    return if (wasNull()) null else value
}
