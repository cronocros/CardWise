package com.cardwise.performance

import com.cardwise.performance.api.AnnualPeriod
import com.cardwise.performance.api.AnnualSummary
import com.cardwise.performance.api.BenefitQualification
import com.cardwise.performance.api.CurrentMonth
import com.cardwise.performance.api.GracePeriod
import com.cardwise.performance.api.MonthlyBreakdownItem
import com.cardwise.performance.api.PerformanceData
import com.cardwise.performance.api.PerformanceResponse
import com.cardwise.performance.api.PerformanceController
import com.cardwise.performance.api.SpecialPeriod
import com.cardwise.performance.api.TierSummary
import com.cardwise.performance.application.PerformanceService
import com.cardwise.common.web.RequestAccountIdResolver
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.math.BigDecimal
import java.util.UUID

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(PerformanceController::class)
class PerformanceControllerTest {
    private val defaultAccountId: UUID = UUID.fromString("11111111-1111-1111-1111-111111111111")

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var performanceService: PerformanceService

    @MockBean
    private lateinit var requestAccountIdResolver: RequestAccountIdResolver

    @Test
    fun `falls back to seeded account id when header is absent`() {
        Mockito.`when`(requestAccountIdResolver.resolve(null as String?))
            .thenReturn(defaultAccountId)
        Mockito.`when`(performanceService.getPerformance(1L, defaultAccountId))
            .thenReturn(sampleResponse())

        mockMvc.get("/api/v1/cards/1/performance")
            .andExpect {
                status { isOk() }
                jsonPath("$.data.cardName") { value("Test Card") }
            }

        Mockito.verify(performanceService).getPerformance(1L, defaultAccountId)
        assertThat(defaultAccountId).isEqualTo(UUID.fromString("11111111-1111-1111-1111-111111111111"))
    }

    @Test
    fun `uses explicit X-Account-Id header when present`() {
        val accountId = UUID.fromString("22222222-2222-2222-2222-222222222222")
        Mockito.`when`(requestAccountIdResolver.resolve(accountId.toString()))
            .thenReturn(accountId)
        Mockito.`when`(performanceService.getPerformance(1L, accountId))
            .thenReturn(sampleResponse())

        mockMvc.get("/api/v1/cards/1/performance") {
            header("X-Account-Id", accountId.toString())
        }
            .andExpect {
                status { isOk() }
                jsonPath("$.data.userCardId") { value(1) }
            }

        Mockito.verify(performanceService).getPerformance(1L, accountId)
    }

    private fun sampleResponse(): PerformanceResponse {
        return PerformanceResponse(
            data = PerformanceData(
                userCardId = 1L,
                cardName = "Test Card",
                annualPeriod = AnnualPeriod("2025-06", "2026-05", "2025-06-15", "ISSUANCE_MONTH"),
                currentMonth = CurrentMonth("2026-03", 210_000, 180_000, BigDecimal("16.7")),
                annual = AnnualSummary(
                    820_000,
                    TierSummary("500K", 500_000, 999_999, "2026-02-28", null),
                    TierSummary("1M", 1_000_000, null, null, 180_000)
                ),
                benefitQualification = BenefitQualification(
                    "PREV_MONTH",
                    "전월 실적 기준",
                    "2026-02",
                    180_000,
                    null,
                    GracePeriod(false, null, null, 0)
                ),
                specialPeriod = SpecialPeriod(true, "Spring Spend Boost", "2026-03-01", "2026-03-31", BigDecimal("1.50")),
                voucherUnlocks = emptyList(),
                monthlyBreakdown = listOf(MonthlyBreakdownItem("2026-02", 180_000))
            )
        )
    }
}
