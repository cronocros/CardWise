package com.cardwise.ledger.application.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDate
import java.time.OffsetDateTime

@Schema(description = "지출 조정 유형")
enum class AdjustmentType {
    FX_CORRECTION,
    BILLING_DISCOUNT,
    PAYMENT_DEDUCTION,
    CARD_FEE,
    OTHER,
}

@Schema(description = "처리 대기 중인 조치 유형")
enum class PendingActionType {
    FX_CORRECTION_NEEDED,
    BILLING_DISCOUNT_FOUND,
    PAYMENT_CONFIRMATION,
    DUPLICATE_DETECTED,
    CATEGORY_UNMAPPED,
    EXCEL_REVIEW,
    PERFORMANCE_EXCLUSION_CHECK,
}

@Schema(description = "조치 상태")
enum class PendingActionStatus {
    PENDING,
    RESOLVED,
    DISMISSED,
}

@Schema(description = "우선순위")
enum class Priority {
    HIGH,
    MEDIUM,
    LOW,
}

@Schema(description = "해결 액션")
enum class ResolutionAction {
    APPLY_FX_CORRECTION,
    APPLY_BILLING_DISCOUNT,
    CONFIRM_PAYMENT,
    RESOLVE_DUPLICATE,
    MAP_CATEGORY,
    APPROVE_EXCEL_IMPORT,
    APPLY_PERFORMANCE_EXCLUSION,
    KEEP_AS_IS,
}

@Schema(description = "지출 조정 내역 생성 요청")
data class CreatePaymentAdjustmentRequest(
    @field:Schema(description = "조정 유형")
    @field:NotNull
    val adjustmentType: AdjustmentType,
    @field:Schema(description = "원본 KRW 금액")
    @field:Positive
    val originalKrwAmount: Long,
    @field:Schema(description = "조정된 KRW 금액")
    @field:Positive
    val adjustedKrwAmount: Long,
    @field:Schema(description = "조정 이유")
    @field:NotBlank
    val reason: String,
    @field:Schema(description = "청구 예정일")
    val billedAt: LocalDate? = null,
)

@Schema(description = "지출 등록 요청")
data class CreatePaymentRequest(
    @field:Schema(description = "사용자 카드 ID")
    @field:NotNull
    val userCardId: Long,
    @field:Schema(description = "가맹점명")
    @field:NotBlank
    val merchantName: String,
    @field:Schema(description = "결제 금액 (KRW)")
    @field:Positive
    val krwAmount: Long,
    @field:Schema(description = "결제 일시")
    @field:NotNull
    val paidAt: OffsetDateTime,
    @field:Schema(description = "거래 유형 (EXPENSE, INCOME)")
    val transactionType: String = "EXPENSE",
)

@Schema(description = "지출 내역 수정 요청")
data class UpdatePaymentRequest(
    @field:Schema(description = "사용자 카드 ID")
    @field:NotNull
    val userCardId: Long,
    @field:Schema(description = "가맹점명")
    @field:NotBlank
    val merchantName: String,
    @field:Schema(description = "결제 금액 (KRW)")
    @field:Positive
    val krwAmount: Long,
    @field:Schema(description = "결제 일시")
    @field:NotNull
    val paidAt: OffsetDateTime,
    @field:Schema(description = "거래 유형 (EXPENSE, INCOME)")
    val transactionType: String = "EXPENSE",
)

@Schema(description = "지출 조정 결과 응답")
data class AdjustmentResponse(
    @field:Schema(description = "조정 ID")
    val adjustmentId: Long,
    @field:Schema(description = "대상 결제 ID")
    val paymentId: Long,
    @field:Schema(description = "조정 유형")
    val adjustmentType: AdjustmentType,
    @field:Schema(description = "원본 금액")
    val originalKrwAmount: Long,
    @field:Schema(description = "조정된 금액")
    val adjustedKrwAmount: Long,
    @field:Schema(description = "차액 (절감 혹은 증액)")
    val differenceAmount: Long,
    @field:Schema(description = "조정 사유")
    val reason: String?,
    @field:Schema(description = "청구일")
    val billedAt: LocalDate?,
    @field:Schema(description = "생성 일시")
    val createdAt: OffsetDateTime,
)

@Schema(description = "미결 조치 항목 해결 요청")
data class ResolvePendingActionRequest(
    @field:Schema(description = "해결 상세 내용")
    @field:Valid
    val resolution: PendingActionResolutionRequest,
)

@Schema(description = "조치 해결 상세 내역")
data class PendingActionResolutionRequest(
    @field:Schema(description = "수행할 해결 액션")
    @field:NotNull
    val action: ResolutionAction,
    @field:Schema(description = "조정된 금액 (필요 시)")
    val adjustedAmount: Long? = null,
)

@Schema(description = "처리 대기 중인 조치 건 정보")
data class PendingActionResponse(
    @field:Schema(description = "조치 ID")
    val pendingActionId: Long,
    @field:Schema(description = "조치 유형")
    val actionType: PendingActionType,
    @field:Schema(description = "참조 데이터 테이블명")
    val referenceTable: String?,
    @field:Schema(description = "참조 데이터 ID")
    val referenceId: Long?,
    @field:Schema(description = "조치 항목 제목")
    val title: String,
    @field:Schema(description = "조치 상세 설명")
    val description: String?,
    @field:Schema(description = "현재 상태")
    val status: PendingActionStatus,
    @field:Schema(description = "우선순위")
    val priority: Priority,
    @field:Schema(description = "발생 일시")
    val createdAt: OffsetDateTime,
    @field:Schema(description = "해결 일시")
    val resolvedAt: OffsetDateTime?,
)

@Schema(description = "조치 대기 건수 응답")
data class PendingActionCountResponse(
    @field:Schema(description = "대기 중인 총 건수")
    val count: Long,
)

@Schema(description = "결제 내역 정보")
data class PaymentResponse(
    @field:Schema(description = "결제 ID")
    val paymentId: Long,
    @field:Schema(description = "사용자 카드 ID")
    val userCardId: Long,
    @field:Schema(description = "가맹점명")
    val merchantName: String,
    @field:Schema(description = "결제 금액")
    val krwAmount: Long,
    @field:Schema(description = "최종 확정 금액 (조정 반영)")
    val finalKrwAmount: Long?,
    @field:Schema(description = "결제 일시")
    val paidAt: OffsetDateTime,
    @field:Schema(description = "거래 유형")
    val transactionType: String = "EXPENSE",
    @field:Schema(description = "금액 조정 상태")
    val isAdjusted: Boolean,
    @field:Schema(description = "생성 일시")
    val createdAt: OffsetDateTime? = null,
    @field:Schema(description = "혜택 실적 티어 변경 여부")
    val tierChanged: Boolean? = null,
    @field:Schema(description = "변경된 티어 명칭")
    val newTierName: String? = null,
)
