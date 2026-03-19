package com.cardwise.ledger

import com.cardwise.common.exception.BadRequestException
import com.cardwise.ledger.application.LedgerService
import com.cardwise.ledger.dto.AdjustmentType
import com.cardwise.ledger.dto.CreatePaymentAdjustmentRequest
import com.cardwise.ledger.dto.PendingActionResolutionRequest
import com.cardwise.ledger.dto.ResolvePendingActionRequest
import com.cardwise.ledger.dto.ResolutionAction
import com.cardwise.ledger.entity.PaymentAdjustmentEntity
import com.cardwise.ledger.entity.PendingActionEntity
import com.cardwise.ledger.repository.PaymentAdjustmentRepository
import com.cardwise.ledger.repository.PaymentProjection
import com.cardwise.ledger.repository.PaymentRepository
import com.cardwise.ledger.repository.PendingActionRepository
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito
import java.time.Clock
import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneId
import java.util.Optional
import java.util.UUID

class LedgerServiceTest {
    private val accountId = UUID.fromString("11111111-1111-1111-1111-111111111111")
    private val clock: Clock = Clock.fixed(Instant.parse("2026-03-19T00:00:00Z"), ZoneId.of("Asia/Seoul"))

    @Test
    fun `creates payment adjustment and updates final amount`() {
        val paymentRepository = Mockito.mock(PaymentRepository::class.java)
        val paymentAdjustmentRepository = Mockito.mock(PaymentAdjustmentRepository::class.java)
        val pendingActionRepository = Mockito.mock(PendingActionRepository::class.java)
        val service = LedgerService(paymentRepository, paymentAdjustmentRepository, pendingActionRepository, clock)

        Mockito.`when`(paymentRepository.findByPaymentIdAndAccountId(10L, accountId))
            .thenReturn(paymentProjection(paymentId = 10L, accountId = accountId, krwAmount = 70_756, finalKrwAmount = 71_000))
        Mockito.`when`(paymentRepository.updateFinalKrwAmount(10L, accountId, 71_400))
            .thenReturn(1)
        Mockito.`when`(paymentAdjustmentRepository.save(Mockito.any(PaymentAdjustmentEntity::class.java)))
            .thenAnswer { invocation ->
                (invocation.arguments[0] as PaymentAdjustmentEntity).apply { adjustmentId = 99L }
            }

        val response = service.createPaymentAdjustment(
            paymentId = 10L,
            accountId = accountId,
            request = CreatePaymentAdjustmentRequest(
                adjustmentType = AdjustmentType.FX_CORRECTION,
                originalKrwAmount = 70_756,
                adjustedKrwAmount = 71_400,
                reason = "Final FX settlement",
            ),
        )

        val entityCaptor = ArgumentCaptor.forClass(PaymentAdjustmentEntity::class.java)
        Mockito.verify(paymentAdjustmentRepository).save(entityCaptor.capture())
        Mockito.verify(paymentRepository).updateFinalKrwAmount(10L, accountId, 71_400)

        assertThat(entityCaptor.value.adjustmentType).isEqualTo("FX_CORRECTION")
        assertThat(entityCaptor.value.reason).isEqualTo("Final FX settlement")
        assertThat(response.data.adjustmentId).isEqualTo(99L)
        assertThat(response.data.differenceAmount).isEqualTo(644L)
    }

    @Test
    fun `resolves performance exclusion by toggling payment item`() {
        val paymentRepository = Mockito.mock(PaymentRepository::class.java)
        val paymentAdjustmentRepository = Mockito.mock(PaymentAdjustmentRepository::class.java)
        val pendingActionRepository = Mockito.mock(PendingActionRepository::class.java)
        val service = LedgerService(paymentRepository, paymentAdjustmentRepository, pendingActionRepository, clock)

        val pendingAction = PendingActionEntity().apply {
            pendingActionId = 4L
            this.accountId = this@LedgerServiceTest.accountId
            actionType = "PERFORMANCE_EXCLUSION_CHECK"
            referenceTable = "payment_item"
            referenceId = 55L
            title = "Check insurance premium exclusion"
            description = "Insurance premium should not count"
            status = "PENDING"
            priority = "LOW"
            createdAt = OffsetDateTime.now(clock)
        }

        Mockito.`when`(pendingActionRepository.findByPendingActionIdAndAccountId(4L, accountId))
            .thenReturn(pendingAction)
        Mockito.`when`(paymentRepository.updatePaymentItemExcludedFromPerformance(55L, accountId, true))
            .thenReturn(1)
        Mockito.`when`(pendingActionRepository.save(Mockito.any(PendingActionEntity::class.java)))
            .thenAnswer { it.arguments[0] as PendingActionEntity }

        val response = service.resolvePendingAction(
            pendingActionId = 4L,
            accountId = accountId,
            request = ResolvePendingActionRequest(
                resolution = PendingActionResolutionRequest(
                    action = ResolutionAction.APPLY_PERFORMANCE_EXCLUSION,
                ),
            ),
        )

        Mockito.verify(paymentRepository).updatePaymentItemExcludedFromPerformance(55L, accountId, true)
        assertThat(response.data.status.name).isEqualTo("RESOLVED")
        assertThat(response.data.resolvedAt).isNotNull()
    }

    @Test
    fun `requires adjusted amount for correction action without linked adjustment`() {
        val paymentRepository = Mockito.mock(PaymentRepository::class.java)
        val paymentAdjustmentRepository = Mockito.mock(PaymentAdjustmentRepository::class.java)
        val pendingActionRepository = Mockito.mock(PendingActionRepository::class.java)
        val service = LedgerService(paymentRepository, paymentAdjustmentRepository, pendingActionRepository, clock)

        val pendingAction = PendingActionEntity().apply {
            pendingActionId = 7L
            this.accountId = this@LedgerServiceTest.accountId
            actionType = "FX_CORRECTION_NEEDED"
            referenceTable = "payment"
            referenceId = 10L
            title = "Confirm FX correction"
            status = "PENDING"
            priority = "HIGH"
            createdAt = OffsetDateTime.now(clock)
        }

        Mockito.`when`(pendingActionRepository.findByPendingActionIdAndAccountId(7L, accountId))
            .thenReturn(pendingAction)
        Mockito.`when`(paymentRepository.findByPaymentIdAndAccountId(10L, accountId))
            .thenReturn(paymentProjection(paymentId = 10L, accountId = accountId, krwAmount = 70_756, finalKrwAmount = null))

        assertThatThrownBy {
            service.resolvePendingAction(
                pendingActionId = 7L,
                accountId = accountId,
                request = ResolvePendingActionRequest(
                    resolution = PendingActionResolutionRequest(
                        action = ResolutionAction.APPLY_FX_CORRECTION,
                    ),
                ),
            )
        }
            .isInstanceOf(BadRequestException::class.java)
            .hasMessageContaining("adjustedAmount")
    }

    private fun paymentProjection(
        paymentId: Long,
        accountId: UUID,
        krwAmount: Long,
        finalKrwAmount: Long?,
    ): PaymentProjection {
        return object : PaymentProjection {
            override val paymentId: Long = paymentId
            override val accountId: UUID = accountId
            override val krwAmount: Long = krwAmount
            override val finalKrwAmount: Long? = finalKrwAmount
            override val paidAt: OffsetDateTime = OffsetDateTime.now(clock)
            override val isAdjusted: Boolean = finalKrwAmount != null
        }
    }
}
