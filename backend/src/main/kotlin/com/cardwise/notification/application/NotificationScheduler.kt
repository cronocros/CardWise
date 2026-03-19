package com.cardwise.notification.application

import com.cardwise.notification.infrastructure.NotificationInsertCommand
import com.cardwise.performance.infrastructure.UserCardRepository
import com.cardwise.performance.infrastructure.UserVoucherRepository
import java.time.Clock
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * 정기 알림 스케줄러
 *
 * 1. 매일 09:00 KST — 바우처 만료 임박 알림 (D-7, D-3, D-1)
 * 2. 매월 25일 10:00 KST — 실적 리마인더 (해당 월 실적 부족 카드에 알림)
 */
@Component
class NotificationScheduler(
    private val notificationService: NotificationService,
    private val userCardRepository: UserCardRepository,
    private val userVoucherRepository: UserVoucherRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // ──────────────────────────────────────────────────────────────
    // 1. 바우처 만료 임박 알림
    //    cron: "0 0 9 * * *"  → 매일 09:00:00 (서버 TZ는 Asia/Seoul 기준)
    // ──────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    @Transactional(readOnly = true)
    fun sendVoucherExpiryAlerts() {
        log.info("[Scheduler] 바우처 만료 임박 알림 시작")
        val today = LocalDate.now(Clock.systemDefaultZone())
        val thresholdDays = listOf(7L, 3L, 1L)

        val allUserCards = userCardRepository.findAll()
        var sent = 0

        for (userCard in allUserCards) {
            val accountId = userCard.accountId ?: continue
            val userCardId = userCard.userCardId ?: continue

            val vouchers = userVoucherRepository.findAllByUserCardId(userCardId)
            for (voucher in vouchers) {
                val validUntil = voucher.validUntil ?: continue
                if (validUntil.isBefore(today)) continue
                val remaining = voucher.remainingCount ?: 0
                if (remaining <= 0) continue

                val daysLeft = today.until(validUntil).days.toLong()
                if (daysLeft !in thresholdDays) continue

                try {
                    notificationService.createNotification(
                        NotificationInsertCommand(
                            accountId = accountId,
                            notificationType = "VOUCHER",
                            eventCode = "VOUCHER_EXPIRY_ALERT",
                            title = "바우처 만료 알림",
                            body = "바우처가 ${daysLeft}일 후 만료됩니다. (잔여 ${remaining}회)",
                            referenceTable = "user_voucher",
                            referenceId = voucher.userVoucherId,
                        ),
                    )
                    sent++
                } catch (e: Exception) {
                    log.warn("[Scheduler] 바우처 알림 실패 accountId=$accountId voucherId=${voucher.userVoucherId}: ${e.message}")
                }
            }
        }

        log.info("[Scheduler] 바우처 만료 임박 알림 완료: ${sent}건 발송")
    }

    // ──────────────────────────────────────────────────────────────
    // 2. 실적 리마인더
    //    cron: "0 0 10 25 * *" → 매월 25일 10:00:00
    // ──────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 10 25 * *", zone = "Asia/Seoul")
    @Transactional(readOnly = true)
    fun sendPerformanceReminders() {
        log.info("[Scheduler] 실적 리마인더 시작")
        val today = LocalDate.now(Clock.systemDefaultZone())
        val currentYearMonth = YearMonth.now()
        val accountIds: List<UUID> = userCardRepository.findAll()
            .mapNotNull { it.accountId }
            .distinct()

        var sent = 0
        for (accountId in accountIds) {
            try {
                notificationService.createNotification(
                    NotificationInsertCommand(
                        accountId = accountId,
                        notificationType = "PERFORMANCE",
                        eventCode = "PERFORMANCE_REMINDER",
                        title = "이번 달 실적 확인",
                        body = "${currentYearMonth.year}년 ${currentYearMonth.monthValue}월 실적을 확인해 보세요. 월말까지 ${today.lengthOfMonth() - today.dayOfMonth}일 남았습니다.",
                        actionUrl = "/performance",
                        actionLabel = "실적 보기",
                    ),
                )
                sent++
            } catch (e: Exception) {
                log.warn("[Scheduler] 실적 리마인더 실패 accountId=$accountId: ${e.message}")
            }
        }

        log.info("[Scheduler] 실적 리마인더 완료: ${sent}건 발송")
    }
}
