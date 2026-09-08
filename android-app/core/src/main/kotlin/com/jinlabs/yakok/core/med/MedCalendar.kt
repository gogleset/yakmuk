package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.time.Kst

object MedCalendar {
    fun isMedActiveOnDate(med: Medication, dateKst: String): Boolean {
        val createdDate = runCatching { Kst.dateStringFromIso(med.createdAt) }.getOrElse { dateKst }
        if (dateKst < createdDate) return false
        val deletedAt = med.deletedAt ?: return true
        val deletedDate = runCatching { Kst.dateStringFromIso(deletedAt) }.getOrElse { return true }
        return dateKst < deletedDate
    }

    fun isMedScheduledOnDate(med: Medication, dateKst: String): Boolean {
        if (!isMedActiveOnDate(med, dateKst)) return false
        return DaysMask.isScheduledOnWeekday(med.daysMask, Kst.weekdayMon0(dateKst))
    }

    fun aggregateDayStatus(
        dateKst: String,
        medications: List<Medication>,
        logs: List<DailyLog>,
        todayKst: String = dateKst,
    ): DayMedStatus {
        val scheduled = medications.filter { isMedScheduledOnDate(it, dateKst) }
        val dayLogs = logs.filter { it.logDate == dateKst }
        val orphanTakenCount = dayLogs.count { orphanTaken(it) }
        val totalObligations = scheduled.size + orphanTakenCount
        if (totalObligations == 0) return DayMedStatus.Empty
        if (dateKst > todayKst) return DayMedStatus.Scheduled

        val takenIds = dayLogs
            .filter { it.status == LogStatus.Taken && it.medicationId != null }
            .mapNotNull { it.medicationId }
            .toSet()
        val takenCount = scheduled.count { it.id in takenIds } + orphanTakenCount

        if (dateKst == todayKst) {
            if (takenCount == 0) return DayMedStatus.Scheduled
            if (takenCount >= totalObligations) return DayMedStatus.Done
            return DayMedStatus.Partial
        }
        if (takenCount == 0) return DayMedStatus.Missed
        if (takenCount >= totalObligations) return DayMedStatus.Done
        return DayMedStatus.Partial
    }

    fun buildDayMedicationEntries(
        dateKst: String,
        medications: List<Medication>,
        logs: List<DailyLog>,
    ): List<DayMedicationEntry> {
        val scheduled = medications.filter { isMedScheduledOnDate(it, dateKst) }
        val dayLogs = logs.filter { it.logDate == dateKst }
        val takenIds = dayLogs
            .filter { it.status == LogStatus.Taken && it.medicationId != null }
            .mapNotNull { it.medicationId }
            .toSet()
        val entries = scheduled.map { med ->
            DayMedicationEntry(
                key = "med-${med.id}",
                name = med.name,
                scheduledTime = med.scheduledTime,
                taken = med.id in takenIds,
                color = med.color,
                doseAmount = med.doseAmount,
                doseUnit = med.doseUnit,
            )
        }.toMutableList()
        for (log in dayLogs) {
            if (log.status != LogStatus.Taken || log.medicationId != null) continue
            if (DayCompleteFeed.isFeedLog(log)) continue
            entries += DayMedicationEntry(
                key = "orphan-${log.id}",
                name = log.medicationName?.trim()?.takeIf { it.isNotEmpty() } ?: "삭제된 약",
                scheduledTime = null,
                taken = true,
            )
        }
        return entries
    }

    fun buildMarkedDates(
        yearMonth: String,
        medications: List<Medication>,
        logs: List<DailyLog>,
        selectedDate: String? = null,
        todayKst: String? = null,
    ): Map<String, CalendarMark> {
        val parts = yearMonth.split("-")
        val y = parts.getOrNull(0)?.toIntOrNull() ?: return emptyMap()
        val m = parts.getOrNull(1)?.toIntOrNull() ?: return emptyMap()
        val daysInMonth = java.time.YearMonth.of(y, m).lengthOfMonth()
        val marked = mutableMapOf<String, CalendarMark>()
        for (day in 1..daysInMonth) {
            val dateKst = "$yearMonth-${day.toString().padStart(2, '0')}"
            val status = aggregateDayStatus(dateKst, medications, logs, todayKst ?: dateKst)
            var mark = CalendarMark()
            if (status != DayMedStatus.Empty) {
                mark = mark.copy(marked = true, dotColor = statusDot(status))
            }
            if (selectedDate == dateKst) {
                mark = mark.copy(selected = true, selectedColor = Colors.Brand)
            }
            if (mark.marked || mark.selected) marked[dateKst] = mark
        }
        return marked
    }

    fun monthRange(yearMonth: String): Pair<String, String> {
        val parts = yearMonth.split("-")
        val y = parts[0].toInt()
        val m = parts[1].toInt()
        val last = java.time.YearMonth.of(y, m).lengthOfMonth()
        return "$yearMonth-01" to "$yearMonth-${last.toString().padStart(2, '0')}"
    }

    fun computeStreakDays(
        medications: List<Medication>,
        logs: List<DailyLog>,
        todayKst: String,
        maxLookback: Int = 60,
    ): Int {
        var streak = 0
        for (i in 0 until maxLookback) {
            val dateKst = Kst.addDays(todayKst, -i)
            val status = aggregateDayStatus(dateKst, medications, logs, todayKst)
            when (status) {
                DayMedStatus.Empty, DayMedStatus.Scheduled -> continue
                DayMedStatus.Done -> streak += 1
                else -> break
            }
        }
        return streak
    }

    fun currentYearMonth(dateKst: String): String = dateKst.take(7)

    private fun orphanTaken(log: DailyLog): Boolean =
        log.status == LogStatus.Taken &&
            log.medicationId == null &&
            !DayCompleteFeed.isFeedLog(log)

    private fun statusDot(status: DayMedStatus): Long? = when (status) {
        DayMedStatus.Done -> Colors.Sky
        DayMedStatus.Partial -> Colors.Warning
        DayMedStatus.Missed -> Colors.Destructive
        DayMedStatus.Scheduled -> Colors.Muted
        DayMedStatus.Empty -> null
    }
}
