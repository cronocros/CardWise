package com.cardwise.card.adapter.out.persistence.entity

import com.cardwise.performance.domain.AnnualPerfBasis
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.math.BigDecimal
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

enum class CardType { CREDIT, DEBIT }

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
    var isActive: Boolean = true,

    @Column(name = "image_url")
    var imageUrl: String? = null
)

@Entity
@Table(name = "user_card")
open class UserCardEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    @Column(name = "image_url")
    var imageUrl: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true
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
