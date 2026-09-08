package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.constants.Limits

enum class DaysMode { Daily, Weekday }

object DaysMask {
    val WeekdayLabels = listOf("월", "화", "수", "목", "금", "토", "일")

    fun parse(mask: String): Pair<DaysMode, List<Int>> {
        if (mask.isBlank() || mask == "daily") return DaysMode.Daily to emptyList()
        val days = mask.split(",")
            .mapNotNull { it.trim().toIntOrNull() }
            .filter { it in 0..6 }
            .distinct()
            .sorted()
        return DaysMode.Weekday to days
    }

    fun format(mode: DaysMode, days: List<Int>): String {
        if (mode == DaysMode.Daily) return "daily"
        return days.filter { it in 0..6 }.distinct().sorted().joinToString(",")
    }

    fun isValid(mode: DaysMode, days: List<Int>): Boolean {
        if (mode == DaysMode.Daily) return true
        return days.any { it in 0..6 }
    }

    fun label(mask: String): String {
        val (mode, days) = parse(mask)
        if (mode == DaysMode.Daily || days.isEmpty() || days.size == 7) return "매일"
        return days.joinToString("·") { WeekdayLabels[it] }
    }

    fun isScheduledOnWeekday(mask: String, weekdayMon0: Int): Boolean {
        if (mask == "daily" || mask.isBlank()) return true
        return mask.split(",").map { it.trim() }.contains(weekdayMon0.toString())
    }

    fun expandSameSchedule(
        times: List<String>,
        daysMask: String,
        enabledByTime: Map<String, Boolean> = emptyMap(),
    ): List<MedScheduleSlot> {
        val unique = times.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
        return unique.map { time ->
            MedScheduleSlot(
                scheduledTime = time,
                daysMask = daysMask,
                notificationEnabled = enabledByTime[time] != false,
            )
        }
    }

    fun expandPerWeekdaySchedule(
        timesByDay: Map<Int, List<String>>,
        enabledByDayTime: Map<Int, Map<String, Boolean>> = emptyMap(),
    ): List<MedScheduleSlot> {
        val slots = mutableListOf<MedScheduleSlot>()
        for (day in 0..6) {
            val unique = (timesByDay[day] ?: emptyList())
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .distinct()
            for (time in unique) {
                slots += MedScheduleSlot(
                    scheduledTime = time,
                    daysMask = day.toString(),
                    notificationEnabled = enabledByDayTime[day]?.get(time) != false,
                )
            }
        }
        return slots
    }

    enum class ScheduleError { NoTimes, DuplicateTimes, NoWeekdays, EmptyDayTimes }

    fun validateSameSchedule(
        times: List<String>,
        mode: DaysMode,
        weekdays: List<Int>,
    ): ScheduleError? {
        val trimmed = times.map { it.trim() }.filter { it.isNotEmpty() }
        if (trimmed.isEmpty()) return ScheduleError.NoTimes
        if (trimmed.toSet().size != trimmed.size) return ScheduleError.DuplicateTimes
        if (!isValid(mode, weekdays)) return ScheduleError.NoWeekdays
        return null
    }

    fun validatePerWeekdaySchedule(
        selectedDays: List<Int>,
        timesByDay: Map<Int, List<String>>,
    ): ScheduleError? {
        if (selectedDays.isEmpty()) return ScheduleError.NoWeekdays
        for (day in selectedDays) {
            val times = (timesByDay[day] ?: emptyList()).map { it.trim() }.filter { it.isNotEmpty() }
            if (times.isEmpty()) return ScheduleError.EmptyDayTimes
            if (times.toSet().size != times.size) return ScheduleError.DuplicateTimes
        }
        return null
    }

    fun scheduleErrorMessage(error: ScheduleError): String = when (error) {
        ScheduleError.NoTimes -> "알림 시간을 하나 이상 넣어 주세요"
        ScheduleError.DuplicateTimes -> "같은 시간이 중복됐어요"
        ScheduleError.NoWeekdays -> "요일을 하나 이상 골라 주세요"
        ScheduleError.EmptyDayTimes -> "고른 요일마다 시간을 넣어 주세요"
    }

    fun normalizeHhmm(raw: String): String {
        val match = Regex("""^(\d{1,2}):(\d{2})$""").find(raw.trim())
        val defaultHour = Limits.DefaultDoseTime.split(":").firstOrNull()?.toIntOrNull() ?: 8
        val hour = (match?.groupValues?.get(1)?.toIntOrNull() ?: defaultHour).coerceIn(0, 23)
        val minute = (match?.groupValues?.get(2)?.toIntOrNull() ?: 0).coerceIn(0, 59)
        return "%02d:%02d".format(hour, minute)
    }
}
