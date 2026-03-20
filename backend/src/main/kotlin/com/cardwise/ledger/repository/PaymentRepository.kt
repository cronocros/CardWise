package com.cardwise.ledger.repository

import java.util.UUID
import com.cardwise.ledger.entity.PaymentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface PaymentRepository : JpaRepository<PaymentEntity, Long> {
    @Query(
        value = """
            select
              p.payment_id as paymentId,
              p.account_id as accountId,
              p.user_card_id as userCardId,
              p.merchant_name_raw as merchantNameRaw,
              p.krw_amount as krwAmount,
              p.final_krw_amount as finalKrwAmount,
              p.paid_at as paidAt,
              p.is_adjusted as isAdjusted
            from payment p
            where p.payment_id = :paymentId
              and p.account_id = :accountId
              and p.deleted_at is null
        """,
        nativeQuery = true,
    )
    fun findByPaymentIdAndAccountId(
        @Param("paymentId") paymentId: Long,
        @Param("accountId") accountId: UUID,
    ): PaymentProjection?

    @Query(
        value = """
            select
              p.payment_id as paymentId,
              p.account_id as accountId,
              p.krw_amount as krwAmount,
              p.final_krw_amount as finalKrwAmount,
              p.paid_at as paidAt,
              p.is_adjusted as isAdjusted
            from payment_item pi
            join payment p on p.payment_id = pi.payment_id
            where pi.payment_item_id = :paymentItemId
              and p.account_id = :accountId
              and p.deleted_at is null
        """,
        nativeQuery = true,
    )
    fun findByPaymentItemIdAndAccountId(
        @Param("paymentItemId") paymentItemId: Long,
        @Param("accountId") accountId: UUID,
    ): PaymentProjection?

    @Modifying
    @Query(
        value = """
            update payment
            set final_krw_amount = :finalKrwAmount,
                is_adjusted = true,
                updated_at = now()
            where payment_id = :paymentId
              and account_id = :accountId
              and deleted_at is null
        """,
        nativeQuery = true,
    )
    fun updateFinalKrwAmount(
        @Param("paymentId") paymentId: Long,
        @Param("accountId") accountId: UUID,
        @Param("finalKrwAmount") finalKrwAmount: Long,
    ): Int

    @Modifying
    @Query(
        value = """
            update payment_item
            set excluded_from_performance = :excluded
            where payment_item_id = :paymentItemId
              and payment_id in (
                select payment_id
                from payment
                where account_id = :accountId
                  and deleted_at is null
              )
        """,
        nativeQuery = true,
    )
    fun updatePaymentItemExcludedFromPerformance(
        @Param("paymentItemId") paymentItemId: Long,
        @Param("accountId") accountId: UUID,
        @Param("excluded") excluded: Boolean,
    ): Int

    @Query(
        value = """
            select 
              p.payment_id as paymentId,
              p.account_id as accountId,
              p.user_card_id as userCardId,
              p.merchant_name_raw as merchantNameRaw,
              p.krw_amount as krwAmount,
              p.final_krw_amount as finalKrwAmount,
              p.paid_at as paidAt,
              p.is_adjusted as isAdjusted
            from payment p
            where p.account_id = :accountId
              and p.deleted_at is null
            order by p.paid_at desc
            limit :limit
        """,
        nativeQuery = true,
    )
    fun findAllByAccountIdAndDeletedAtIsNull(
        @Param("accountId") accountId: UUID,
        @Param("limit") limit: Int,
    ): List<PaymentProjection>

    @Modifying
    @Query(
        value = """
            update payment
            set deleted_at = now(),
                updated_at = now()
            where payment_id = :paymentId
              and account_id = :accountId
        """,
        nativeQuery = true,
    )
    fun softDelete(@Param("paymentId") paymentId: Long, @Param("accountId") accountId: UUID): Int
}
