package com.jinlabs.yakok.core.time

import kotlin.math.max
import kotlinx.datetime.DatePeriod
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.plus
import kotlinx.datetime.toInstant
import kotlinx.datetime.toLocalDateTime

/** 서버·클라 공통 KST. RN `shared/lib/kst.ts` 포팅. */
object Kst {
    val Zone: TimeZone = TimeZone.of("Asia/Seoul")

    /** 오늘 날짜 YYYY-MM-DD (KST) */
    fun todayDateString(now: Instant): String =
        now.toLocalDateTime(Zone).date.toString()

    /** YYYY-MM-DD ± days (KST 달력) */
    fun addDays(dateYmd: String, deltaDays: Int): String {
        val date = parseDate(dateYmd) ?: return dateYmd
        return date.plus(DatePeriod(days = deltaDays)).toString()
    }

    /** ISO 타임스탬프 → KST 날짜 YYYY-MM-DD */
    fun dateStringFromIso(iso: String): String =
        todayDateString(Instant.parse(iso))

    /**
     * 월=0 … 일=6 (DECISIONS days_mask).
     * ISO Monday=1 … Sunday=7 → mon0 = iso - 1.
     */
    fun weekdayMon0(dateKst: String): Int {
        val date = parseDate(dateKst)
            ?: throw IllegalArgumentException("invalid date_kst: $dateKst")
        return date.dayOfWeek.value - 1
    }

    /** 당일 KST 종료까지 남은 ms (bound용) */
    fun msUntilDayEnd(now: Instant): Long {
        val today = now.toLocalDateTime(Zone).date
        val end = LocalDateTime(today, LocalTime(23, 59, 59, 999_000_000))
            .toInstant(Zone)
        return max(0L, (end - now).inWholeMilliseconds)
    }

    private fun parseDate(dateYmd: String): LocalDate? =
        runCatching { LocalDate.parse(dateYmd) }.getOrNull()
}
