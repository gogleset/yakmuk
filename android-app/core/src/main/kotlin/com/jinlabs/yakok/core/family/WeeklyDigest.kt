package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.ConditionValue
import com.jinlabs.yakok.core.time.Format
import com.jinlabs.yakok.core.time.Kst

enum class WeeklyAnomalyKind { Missed, Bad }

data class DayDigestInput(
    val dateYmd: String,
    val totalMeds: Int,
    val takenCount: Int,
    val condition: ConditionValue?,
)

data class WeeklyAnomaly(
    val dateYmd: String,
    val kind: WeeklyAnomalyKind,
)

data class WeeklyDigestView(
    val weekStartYmd: String,
    val approxLine: String,
    val anomalyDays: List<WeeklyAnomaly>,
)

object WeeklyDigest {
    enum class Koki { Empty, Worried, Thinking, Cheer, Happy }

    fun weekStartMondayKst(dateYmd: String): String {
        val mon0 = Kst.weekdayMon0(dateYmd)
        return Kst.addDays(dateYmd, -mon0)
    }

    fun formatAnomalyLines(anomalies: List<WeeklyAnomaly>): List<String> {
        val missed = anomalies.filter { it.kind == WeeklyAnomalyKind.Missed }
        val bad = anomalies.filter { it.kind == WeeklyAnomalyKind.Bad }
        val lines = mutableListOf<String>()
        if (missed.isNotEmpty()) {
            val weekdays = missed.joinToString(", ") { Format.weekdayShort(it.dateYmd) }
            lines += Copy.Family.weeklyMissedDays(weekdays)
        }
        if (bad.isNotEmpty()) {
            val weekdays = bad.joinToString(", ") { Format.weekdayShort(it.dateYmd) }
            lines += Copy.Family.weeklyBadDays(weekdays)
        }
        return lines
    }

    fun build(days: List<DayDigestInput>, weekStartYmd: String): WeeklyDigestView {
        val anomalyDays = mutableListOf<WeeklyAnomaly>()
        var scheduledDays = 0
        var completeDays = 0
        var badCount = 0
        for (day in days) {
            if (day.condition == ConditionValue.Bad) {
                anomalyDays += WeeklyAnomaly(day.dateYmd, WeeklyAnomalyKind.Bad)
                badCount += 1
            }
            if (day.totalMeds > 0) {
                scheduledDays += 1
                if (day.takenCount >= day.totalMeds) {
                    completeDays += 1
                } else {
                    anomalyDays += WeeklyAnomaly(day.dateYmd, WeeklyAnomalyKind.Missed)
                }
            }
        }
        val approxLine = when {
            scheduledDays == 0 -> Copy.Family.WeeklyNoMeds
            completeDays == scheduledDays && badCount == 0 -> Copy.Family.WeeklyOk
            completeDays.toDouble() / scheduledDays >= 0.7 -> Copy.Family.WeeklyMostly
            else -> Copy.Family.WeeklyUneven
        }
        return WeeklyDigestView(weekStartYmd, approxLine, anomalyDays)
    }

    fun koki(digest: WeeklyDigestView): Koki = when {
        digest.approxLine == Copy.Family.WeeklyNoMeds -> Koki.Empty
        digest.anomalyDays.any { it.kind == WeeklyAnomalyKind.Bad } -> Koki.Worried
        digest.anomalyDays.any { it.kind == WeeklyAnomalyKind.Missed } -> Koki.Thinking
        digest.approxLine == Copy.Family.WeeklyMostly -> Koki.Cheer
        else -> Koki.Happy
    }

    fun parseOpt(raw: String?): Boolean = when (raw?.lowercase()) {
        "0", "false", "off" -> false
        else -> true
    }

    fun isDismissed(weekStartYmd: String, dismissedWeek: String?): Boolean =
        !dismissedWeek.isNullOrEmpty() && dismissedWeek == weekStartYmd
}
