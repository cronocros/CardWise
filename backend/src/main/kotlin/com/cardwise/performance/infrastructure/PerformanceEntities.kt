package com.cardwise.performance.infrastructure

import com.cardwise.performance.domain.AnnualPerfBasis
import com.cardwise.performance.domain.BenefitPeriodLag
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "card_issuer")
open class CardIssuerEntity(
    @Id
    @Column(name = "issuer_id")
    var issuerId: String = "",

    @Column(name = "name")
    var name: String = "",

    @Column(name = "logo_url")
    var logoUrl: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true
)

@Entity
@Table(name = "card_brand")
open class CardBrandEntity(
    @Id
    @Column(name = "brand_id")
    var brandId: String = "",

    @Column(name = "name")
    var name: String = "",

    @Column(name = "logo_url")
    var logoUrl: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true
)

@Entity
@Table(name = "card")
open class CardEntity(
    @Id
    @Column(name = "card_id")
    var cardId: Long? = null,

    @Column(name = "card_name")
    var cardName: String = "",

    @Column(name = "issuer_id")
    var issuerId: String? = null,

    @Column(name = "brand_id")
    var brandId: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type")
    var cardType: CardType = CardType.CREDIT,

    @Enumerated(EnumType.STRING)
    @Column(name = "annual_perf_basis")
    var annualPerfBasis: AnnualPerfBasis = AnnualPerfBasis.ISSUANCE_MONTH,

    @Column(name = "card_rules", columnDefinition = "jsonb")
    var cardRules: String? = null,

    @Column(name = "features", columnDefinition = "jsonb")
    var features: String? = null,

    @Column(name = "has_performance_tier")
    var hasPerformanceTier: Boolean = true,

    @Column(name = "is_active")
    var isActive: Boolean = true
)

enum class CardType { CREDIT, DEBIT }

@Entity
@Table(name = "user_card")
open class UserCardEntity(
    @Id
    @Column(name = "user_card_id")
    var userCardId: Long? = null,

    @Column(name = "account_id")
    var accountId: UUID? = null,

    @Column(name = "card_id")
    var cardId: Long? = null,

    @Column(name = "card_nickname")
    var cardNickname: String? = null,

    @Column(name = "issued_at")
    var issuedAt: LocalDate = LocalDate.now(),

    @Column(name = "expiry_month")
    var expiryMonth: String? = null,

    @Column(name = "expiry_year")
    var expiryYear: String? = null,

    @Column(name = "issuer_id")
    var issuerId: String? = null,

    @Column(name = "brand_id")
    var brandId: String? = null,

    @Column(name = "card_type")
    var cardType: String = "CREDIT",

    @Column(name = "card_number_first_four")
    var cardNumberFirstFour: String? = null,

    @Column(name = "card_number_last_four")
    var cardNumberLastFour: String? = null,

    @Column(name = "monthly_target_amount")
    var monthlyTargetAmount: Long = 300000,

    @Column(name = "annual_target_amount")
    var annualTargetAmount: Long = 10000000,

    @Column(name = "is_notification_enabled")
    var isNotificationEnabled: Boolean = true,

    @Column(name = "is_main")
    var isMain: Boolean = false,

    @Column(name = "is_pinned")
    var isPinned: Boolean = false,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features", columnDefinition = "jsonb")
    var features: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true
)

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

@Entity
@Table(name = "special_performance_period")
open class SpecialPerformancePeriodEntity(
    @Id
    @Column(name = "special_period_id")
    var specialPeriodId: Long? = null,

    @Column(name = "card_id")
    var cardId: Long? = null,

    @Column(name = "period_name")
    var periodName: String = "",

    @Column(name = "start_date")
    var startDate: LocalDate = LocalDate.now(),

    @Column(name = "end_date")
    var endDate: LocalDate = LocalDate.now(),

    @Column(name = "credit_multiplier", precision = 3, scale = 2)
    var creditMultiplier: BigDecimal = BigDecimal.ONE,

    @Column(name = "is_active")
    var isActive: Boolean = true,

    @Column(name = "description")
    var description: String? = null
)

@Entity
@Table(name = "card_voucher")
open class CardVoucherEntity(
    @Id
    @Column(name = "card_voucher_id")
    var cardVoucherId: Long? = null,

    @Column(name = "card_id")
    var cardId: Long? = null,

    @Column(name = "voucher_name")
    var voucherName: String = "",

    @Column(name = "voucher_type")
    var voucherType: String? = null,

    @Column(name = "period_type")
    var periodType: String? = null,

    @Column(name = "total_count")
    var totalCount: Int? = null,

    @Column(name = "description")
    var description: String? = null,

    @Column(name = "valid_from")
    var validFrom: LocalDate? = null,

    @Column(name = "valid_until")
    var validUntil: LocalDate? = null,

    @Column(name = "unlock_conditions", columnDefinition = "jsonb")
    var unlockConditions: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true,
)

@Entity
@Table(name = "user_voucher")
open class UserVoucherEntity(
    @Id
    @Column(name = "user_voucher_id")
    var userVoucherId: Long? = null,

    @Column(name = "user_card_id")
    var userCardId: Long? = null,

    @Column(name = "card_voucher_id")
    var cardVoucherId: Long? = null,

    @Column(name = "remaining_count")
    var remainingCount: Int? = null,

    @Column(name = "total_count")
    var totalCount: Int? = null,

    @Column(name = "valid_from")
    var validFrom: LocalDate? = null,

    @Column(name = "valid_until")
    var validUntil: LocalDate? = null,

    @Column(name = "updated_at")
    var updatedAt: OffsetDateTime? = null,
)
