package com.cardwise.analytics.infrastructure

import com.cardwise.analytics.application.port.out.AnalyticsReadPort
import java.sql.ResultSet
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component

data class MonthlySummaryRow(
    val yearMonth: String,
    val totalSpent: Long,
    val totalBenefit: Long,
    val paymentCount: Int,
)

data class CardSummaryRow(
    val userCardId: Long,
    val cardName: String,
    val spentAmount: Long,
    val benefitAmount: Long,
    val paymentCount: Int,
    val annualAccumulated: Long?,
    val currentTierName: String?,
)

data class CategorySummaryRow(
    val categoryId: Long,
    val categoryName: String,
    val spentAmount: Long,
    val benefitAmount: Long,
    val paymentCount: Int,
)

data class TagSummaryRow(
    val tagId: Long,
    val tagName: String,
    val spentAmount: Long,
    val paymentCount: Int,
)

data class TagSelectionRow(
    val tagId: Long,
    val tagName: String,
)

data class TagCrossBreakdownRow(
    val label: String,
    val amount: Long,
    val paymentCount: Int,
)

@Component
class AnalyticsReadAdapter(
    private val jdbcTemplate: NamedParameterJdbcTemplate,
) : AnalyticsReadPort {
    override fun findMonthlySummary(accountId: UUID, yearMonth: YearMonth): MonthlySummaryRow? {
        val sql = """
            select
                ums.year_month,
                ums.total_spent,
                ums.total_benefit,
                ums.payment_count
            from user_monthly_summary ums
            where ums.account_id = :accountId
              and ums.year_month = :yearMonth
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonth.toString())

        return jdbcTemplate.query(sql, params, ::mapMonthlySummary).firstOrNull()
    }

    override fun findCardSummaries(accountId: UUID, yearMonth: YearMonth): List<CardSummaryRow> {
        val sql = """
            select
                ucs.user_card_id,
                c.card_name,
                ucs.spent_amount,
                ucs.benefit_amount,
                ucs.payment_count,
                up.annual_accumulated,
                pt.tier_name as current_tier_name
            from user_card_summary ucs
            join user_card uc on uc.user_card_id = ucs.user_card_id
            join card c on c.card_id = uc.card_id
            left join user_performance up
                on up.user_card_id = ucs.user_card_id
               and up.year_month = ucs.year_month
            left join performance_tier pt on pt.performance_tier_id = up.performance_tier_id
            where ucs.account_id = :accountId
              and ucs.year_month = :yearMonth
            order by ucs.spent_amount desc, ucs.user_card_id asc
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonth.toString())

        return jdbcTemplate.query(sql, params, ::mapCardSummary)
    }

    override fun findCategorySummaries(accountId: UUID, yearMonth: YearMonth): List<CategorySummaryRow> {
        val sql = """
            select
                ucs.category_id,
                c.category_name,
                ucs.spent_amount,
                ucs.benefit_amount,
                ucs.payment_count
            from user_category_summary ucs
            join category c on c.category_id = ucs.category_id
            where ucs.account_id = :accountId
              and ucs.year_month = :yearMonth
            order by ucs.spent_amount desc, c.category_name asc
            limit 8
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonth.toString())

        return jdbcTemplate.query(sql, params, ::mapCategorySummary)
    }

    override fun findTagSummaries(accountId: UUID, yearMonth: YearMonth): List<TagSummaryRow> {
        val sql = """
            select
                uts.tag_id,
                t.tag_name,
                uts.spent_amount,
                uts.payment_count
            from user_tag_summary uts
            join tag t on t.tag_id = uts.tag_id
            where uts.account_id = :accountId
              and uts.year_month = :yearMonth
            order by uts.spent_amount desc, t.tag_name asc
            limit 5
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("yearMonth", yearMonth.toString())

        return jdbcTemplate.query(sql, params, ::mapTagSummary)
    }

    override fun findMonthlyTrends(accountId: UUID, limit: Int): List<MonthlySummaryRow> {
        val sql = """
            select
                summary.year_month,
                summary.total_spent,
                summary.total_benefit,
                summary.payment_count
            from (
                select
                    ums.year_month,
                    ums.total_spent,
                    ums.total_benefit,
                    ums.payment_count
                from user_monthly_summary ums
                where ums.account_id = :accountId
                order by ums.year_month desc
                limit :limit
            ) summary
            order by summary.year_month asc
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("limit", limit)

        return jdbcTemplate.query(sql, params, ::mapMonthlySummary)
    }

    override fun findTagsByIds(accountId: UUID, tagIds: List<Long>): List<TagSelectionRow> {
        if (tagIds.isEmpty()) {
            return emptyList()
        }

        val sql = """
            select
                t.tag_id,
                t.tag_name
            from tag t
            where t.account_id = :accountId
              and t.tag_id in (:tagIds)
            order by t.tag_name asc
        """.trimIndent()

        val params = MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("tagIds", tagIds)

        return jdbcTemplate.query(sql, params, ::mapTagSelection)
    }

    override fun findTagCrossByCategory(
        accountId: UUID,
        tagIds: List<Long>,
        from: LocalDate,
        to: LocalDate,
    ): List<TagCrossBreakdownRow> {
        if (tagIds.isEmpty()) {
            return emptyList()
        }

        val sql = """
            with tagged_items as (
                select pit.payment_item_id
                from payment_item_tag pit
                join payment_item pi on pi.payment_item_id = pit.payment_item_id
                join payment p on p.payment_id = pi.payment_id
                where p.account_id = :accountId
                  and p.paid_at >= :fromInclusive
                  and p.paid_at < :toExclusive
                  and pit.tag_id in (:tagIds)
                group by pit.payment_item_id
                having count(distinct pit.tag_id) = :tagCount
            )
            select
                coalesce(c.category_name, '미분류') as label,
                sum(pi.amount) as amount,
                count(*) as payment_count
            from tagged_items ti
            join payment_item pi on pi.payment_item_id = ti.payment_item_id
            left join category c on c.category_id = pi.category_id
            group by coalesce(c.category_name, '미분류')
            order by amount desc, label asc
        """.trimIndent()

        return jdbcTemplate.query(sql, buildCrossParams(accountId, tagIds, from, to), ::mapTagCrossBreakdown)
    }

    override fun findTagCrossByPeriod(
        accountId: UUID,
        tagIds: List<Long>,
        from: LocalDate,
        to: LocalDate,
    ): List<TagCrossBreakdownRow> {
        if (tagIds.isEmpty()) {
            return emptyList()
        }

        val sql = """
            with tagged_items as (
                select pit.payment_item_id
                from payment_item_tag pit
                join payment_item pi on pi.payment_item_id = pit.payment_item_id
                join payment p on p.payment_id = pi.payment_id
                where p.account_id = :accountId
                  and p.paid_at >= :fromInclusive
                  and p.paid_at < :toExclusive
                  and pit.tag_id in (:tagIds)
                group by pit.payment_item_id
                having count(distinct pit.tag_id) = :tagCount
            )
            select
                to_char(date_trunc('month', p.paid_at), 'YYYY-MM') as label,
                sum(pi.amount) as amount,
                count(*) as payment_count
            from tagged_items ti
            join payment_item pi on pi.payment_item_id = ti.payment_item_id
            join payment p on p.payment_id = pi.payment_id
            group by to_char(date_trunc('month', p.paid_at), 'YYYY-MM')
            order by label asc
        """.trimIndent()

        return jdbcTemplate.query(sql, buildCrossParams(accountId, tagIds, from, to), ::mapTagCrossBreakdown)
    }

    override fun findTagCrossByTag(
        accountId: UUID,
        tagIds: List<Long>,
        from: LocalDate,
        to: LocalDate,
    ): List<TagCrossBreakdownRow> {
        if (tagIds.isEmpty()) {
            return emptyList()
        }

        val sql = """
            with tagged_items as (
                select pit.payment_item_id
                from payment_item_tag pit
                join payment_item pi on pi.payment_item_id = pit.payment_item_id
                join payment p on p.payment_id = pi.payment_id
                where p.account_id = :accountId
                  and p.paid_at >= :fromInclusive
                  and p.paid_at < :toExclusive
                  and pit.tag_id in (:tagIds)
                group by pit.payment_item_id
                having count(distinct pit.tag_id) = :tagCount
            )
            select
                t.tag_name as label,
                sum(pi.amount) as amount,
                count(*) as payment_count
            from tagged_items ti
            join payment_item pi on pi.payment_item_id = ti.payment_item_id
            join payment_item_tag pit on pit.payment_item_id = ti.payment_item_id
            join tag t on t.tag_id = pit.tag_id
            where pit.tag_id not in (:tagIds)
            group by t.tag_name
            order by amount desc, label asc
            limit 10
        """.trimIndent()

        return jdbcTemplate.query(sql, buildCrossParams(accountId, tagIds, from, to), ::mapTagCrossBreakdown)
    }

    private fun mapMonthlySummary(resultSet: ResultSet, rowNum: Int): MonthlySummaryRow {
        return MonthlySummaryRow(
            yearMonth = resultSet.getString("year_month"),
            totalSpent = resultSet.getLong("total_spent"),
            totalBenefit = resultSet.getLong("total_benefit"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }

    private fun mapCardSummary(resultSet: ResultSet, rowNum: Int): CardSummaryRow {
        return CardSummaryRow(
            userCardId = resultSet.getLong("user_card_id"),
            cardName = resultSet.getString("card_name"),
            spentAmount = resultSet.getLong("spent_amount"),
            benefitAmount = resultSet.getLong("benefit_amount"),
            paymentCount = resultSet.getInt("payment_count"),
            annualAccumulated = resultSet.getObject("annual_accumulated")?.let { (it as Number).toLong() },
            currentTierName = resultSet.getString("current_tier_name"),
        )
    }

    private fun mapCategorySummary(resultSet: ResultSet, rowNum: Int): CategorySummaryRow {
        return CategorySummaryRow(
            categoryId = resultSet.getLong("category_id"),
            categoryName = resultSet.getString("category_name"),
            spentAmount = resultSet.getLong("spent_amount"),
            benefitAmount = resultSet.getLong("benefit_amount"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }

    private fun mapTagSummary(resultSet: ResultSet, rowNum: Int): TagSummaryRow {
        return TagSummaryRow(
            tagId = resultSet.getLong("tag_id"),
            tagName = resultSet.getString("tag_name"),
            spentAmount = resultSet.getLong("spent_amount"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }

    private fun mapTagSelection(resultSet: ResultSet, rowNum: Int): TagSelectionRow {
        return TagSelectionRow(
            tagId = resultSet.getLong("tag_id"),
            tagName = resultSet.getString("tag_name"),
        )
    }

    private fun mapTagCrossBreakdown(resultSet: ResultSet, rowNum: Int): TagCrossBreakdownRow {
        return TagCrossBreakdownRow(
            label = resultSet.getString("label"),
            amount = resultSet.getLong("amount"),
            paymentCount = resultSet.getInt("payment_count"),
        )
    }

    private fun buildCrossParams(
        accountId: UUID,
        tagIds: List<Long>,
        from: LocalDate,
        to: LocalDate,
    ): MapSqlParameterSource {
        return MapSqlParameterSource()
            .addValue("accountId", accountId)
            .addValue("tagIds", tagIds)
            .addValue("tagCount", tagIds.distinct().size)
            .addValue("fromInclusive", from.atStartOfDay())
            .addValue("toExclusive", to.plusDays(1).atStartOfDay())
    }
}
