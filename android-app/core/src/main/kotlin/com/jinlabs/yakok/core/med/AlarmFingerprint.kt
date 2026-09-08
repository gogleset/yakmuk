package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.time.Kst
import kotlin.math.abs
import kotlinx.datetime.DatePeriod
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.LocalTime
import kotlinx.datetime.plus
import kotlinx.datetime.toInstant
import kotlinx.datetime.toLocalDateTime

/** 'daily' | expo weekday 1(일)…7(토) — RN fingerprint weekdayKey */
sealed interface AlarmWeekdayKey {
    data object Daily : AlarmWeekdayKey
    data class Expo(val value: Int) : AlarmWeekdayKey

    fun token(): String = when (this) {
        Daily -> "daily"
        is Expo -> value.toString()
    }
}

data class ExpectedMedAlarm(
    val medicationId: Long,
    val name: String,
    val scheduledTime: String,
    val hour: Int,
    val minute: Int,
    val weekdayKey: AlarmWeekdayKey,
    val useMethod: String? = null,
    val doseAmount: Double? = null,
    val doseUnit: String? = null,
)

data class FingerprintDiff(
    val missing: List<String>,
    val extra: List<String>,
) {
    val inSync: Boolean get() = missing.isEmpty() && extra.isEmpty()
}

object AlarmFingerprint {
    fun parseHourMinute(scheduledTime: String): Pair<Int, Int>? {
        val match = Regex("""^(\d{1,2}):(\d{2})""").find(scheduledTime.trim()) ?: return null
        val hour = match.groupValues[1].toInt()
        val minute = match.groupValues[2].toInt()
        if (hour !in 0..23 || minute !in 0..59) return null
        return hour to minute
    }

    /** days_mask mon0 (월=0…일=6) → expo WEEKLY weekday (일=1…토=7) */
    fun mon0ToExpoWeekday(mon0: Int): Int {
        val getDay = (mon0 + 1) % 7
        return getDay + 1
    }

    fun identifier(alarm: ExpectedMedAlarm): String =
        "${MedAlarm.IdPrefix}${alarm.medicationId}-${alarm.weekdayKey.token()}-${alarm.hour}-${alarm.minute}"

    fun fingerprint(alarm: ExpectedMedAlarm): String =
        "${alarm.medicationId}|${alarm.weekdayKey.token()}|${alarm.hour}:${alarm.minute}|${MedAlarm.FpTag}"

    fun notifData(alarm: ExpectedMedAlarm, fingerprint: String = fingerprint(alarm)): Map<String, String> {
        val data = mutableMapOf(
            "kind" to MedAlarm.Kind,
            "medicationId" to alarm.medicationId.toString(),
            "scheduledTime" to alarm.scheduledTime,
            "name" to alarm.name,
            "fingerprint" to fingerprint,
        )
        alarm.useMethod?.takeIf { it.isNotBlank() }?.let { data["useMethod"] = it }
        alarm.doseAmount?.let { data["doseAmount"] = trimNumber(it) }
        alarm.doseUnit?.takeIf { it.isNotBlank() }?.let { data["doseUnit"] = it }
        return data
    }

    fun buildExpectedSchedule(
        medications: List<Medication>,
        takenIds: Set<Long>,
    ): List<ExpectedMedAlarm> {
        val out = mutableListOf<ExpectedMedAlarm>()
        for (med in medications) {
            if (!med.notificationEnabled) continue
            if (med.id in takenIds) continue
            val hm = parseHourMinute(med.scheduledTime) ?: continue
            val (mode, days) = DaysMask.parse(med.daysMask)
            val base = ExpectedMedAlarm(
                medicationId = med.id,
                name = med.name,
                scheduledTime = med.scheduledTime,
                hour = hm.first,
                minute = hm.second,
                weekdayKey = AlarmWeekdayKey.Daily,
                useMethod = med.useMethod,
                doseAmount = med.doseAmount,
                doseUnit = med.doseUnit,
            )
            if (mode == DaysMode.Daily || days.isEmpty() || days.size == 7) {
                out += base
                continue
            }
            for (day in days) {
                out += base.copy(weekdayKey = AlarmWeekdayKey.Expo(mon0ToExpoWeekday(day)))
            }
        }
        return out.sortedBy { fingerprint(it) }
    }

    fun fingerprintsOf(alarms: List<ExpectedMedAlarm>): List<String> =
        alarms.map { fingerprint(it) }

    fun diffFingerprints(expected: List<String>, scheduled: List<String>): FingerprintDiff {
        val exp = expected.toSet()
        val sch = scheduled.toSet()
        return FingerprintDiff(
            missing = expected.filter { it !in sch },
            extra = scheduled.filter { it !in exp },
        )
    }

    /**
     * fingerprint → 안정적인 PendingIntent requestCode (양수 31bit).
     * RN `alarmClockRequestCode`와 동일 (JS `| 0` = ToInt32).
     */
    fun requestCode(fingerprint: String): Int {
        var hash = 0
        for (ch in fingerprint) {
            hash = hash * 31 + ch.code
        }
        val magnitude = when {
            hash == 0 -> 1L
            hash == Int.MIN_VALUE -> 1L shl 31
            else -> abs(hash).toLong()
        }
        return 10_000 + (magnitude % 900_000).toInt()
    }

    /** 다음 발생 epoch ms (KST). */
    fun nextTriggerAtMs(alarm: ExpectedMedAlarm, now: Instant): Long {
        val zone = Kst.Zone
        val nowLdt = now.toLocalDateTime(zone)
        val time = LocalTime(alarm.hour, alarm.minute)
        when (val key = alarm.weekdayKey) {
            AlarmWeekdayKey.Daily -> {
                var candidate = LocalDateTime(nowLdt.date, time)
                if (candidate.toInstant(zone) <= now) {
                    candidate = LocalDateTime(nowLdt.date.plus(DatePeriod(days = 1)), time)
                }
                return candidate.toInstant(zone).toEpochMilliseconds()
            }
            is AlarmWeekdayKey.Expo -> {
                val targetIso = if (key.value == 1) 7 else key.value - 1
                for (i in 0..7) {
                    val date = nowLdt.date.plus(DatePeriod(days = i))
                    val candidate = LocalDateTime(date, time)
                    if (date.dayOfWeek.value == targetIso && candidate.toInstant(zone) > now) {
                        return candidate.toInstant(zone).toEpochMilliseconds()
                    }
                }
                val fallback = nowLdt.date.plus(DatePeriod(days = 7))
                return LocalDateTime(fallback, time).toInstant(zone).toEpochMilliseconds()
            }
        }
    }

    private fun trimNumber(value: Double): String =
        if (value == value.toLong().toDouble()) value.toLong().toString() else value.toString()
}
