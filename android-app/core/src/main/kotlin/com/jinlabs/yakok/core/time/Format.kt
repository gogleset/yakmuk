package com.jinlabs.yakok.core.time

import kotlin.math.max
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

object Format {
    private val Weekdays = listOf("일", "월", "화", "수", "목", "금", "토")

    fun weekdayShort(dateYmd: String): String {
        val date = parseDate(dateYmd) ?: return dateYmd
        return Weekdays[date.dayOfWeek.value % 7]
    }

    fun friendlyDate(dateYmd: String): String {
        val date = parseDate(dateYmd) ?: return dateYmd
        return "${date.monthNumber}월 ${date.dayOfMonth}일 (${weekdayShort(dateYmd)})"
    }

    fun feedDayHeading(dateYmd: String, todayYmd: String): String = when (dateYmd) {
        todayYmd -> "오늘"
        Kst.addDays(todayYmd, -1) -> "어제"
        else -> friendlyDate(dateYmd)
    }

    fun friendlyTime(iso: String): String {
        val instant = parseInstant(iso) ?: return ""
        val local = instant.toLocalDateTime(TimeZone.of("Asia/Seoul"))
        val hour24 = local.hour
        val ampm = if (hour24 < 12) "오전" else "오후"
        val hour12 = when {
            hour24 == 0 -> 12
            hour24 > 12 -> hour24 - 12
            else -> hour24
        }
        return "$ampm ${hour12}:${local.minute.toString().padStart(2, '0')}"
    }

    fun relativeTime(iso: String, nowMs: Long): String {
        val then = parseInstant(iso)?.toEpochMilliseconds() ?: return ""
        val diffSec = max(0L, (nowMs - then) / 1000)
        if (diffSec < 60) return "방금"
        val diffMin = diffSec / 60
        if (diffMin < 60) return "${diffMin}분 전"
        val diffHour = diffMin / 60
        if (diffHour < 24) return "${diffHour}시간 전"
        return friendlyTime(iso)
    }

    fun nicknameInitial(nickname: String?): String {
        val trimmed = nickname?.trim().orEmpty()
        return if (trimmed.isEmpty()) "?" else trimmed.first().toString()
    }

    private fun parseDate(dateYmd: String): LocalDate? =
        runCatching { LocalDate.parse(dateYmd) }.getOrNull()

    private fun parseInstant(iso: String): Instant? =
        runCatching { Instant.parse(iso) }.getOrNull()
}
