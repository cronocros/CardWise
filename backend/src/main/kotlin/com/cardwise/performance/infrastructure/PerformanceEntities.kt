package com.cardwise.performance.infrastructure

import com.cardwise.performance.domain.BenefitPeriodLag
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.UUID

// Entities moved to Card domain: CardIssuerEntity, CardBrandEntity, CardEntity, UserCardEntity, SpecialPerformancePeriodEntity
// Entities moved to Voucher domain: CardVoucherEntity, UserVoucherEntity

@Entity
@Table(name = "user_performance")
open class UserPerformanceEntity(
    @Id
    @Column(name = "user_performance_id")
    var userPerformanceId: Long? = null,

    @Column(name = "user_card_id")
    var userCardId: Long? = null,

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "year_month", length = 7, columnDefinition = "char(7)")
    var yearMonth: String = "",

    @Column(name = "monthly_spent")
    var monthlySpent: Long = 0,

    @Column(name = "annual_accumulated")
    var annualAccumulated: Long = 0,

    @Column(name = "performance_tier_id")
    var performanceTierId: Long? = null
)

@Entity
@Table(name = "performance_tier")
open class PerformanceTierEntity(
    @Id
    @Column(name = "performance_tier_id")
    var performanceTierId: Long? = null,

    @Column(name = "card_id")
    var cardId: Long? = null,

    @Column(name = "tier_name")
    var tierName: String = "",

    @Column(name = "min_amount")
    var minAmount: Long = 0,

    @Column(name = "max_amount")
    var maxAmount: Long? = null,

    @Column(name = "sort_order")
    var sortOrder: Int = 0
)

@Entity
@Table(name = "card_benefit")
open class CardBenefitEntity(
    @Id
    @Column(name = "card_benefit_id")
    var cardBenefitId: Long? = null,

    @Column(name = "card_id")
    var cardId: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "performance_period_lag")
    var performancePeriodLag: BenefitPeriodLag = BenefitPeriodLag.PREV_MONTH
)
