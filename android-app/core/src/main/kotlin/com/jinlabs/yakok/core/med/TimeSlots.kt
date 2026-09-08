package com.jinlabs.yakok.core.med

enum class TimeOfDaySlot { Dawn, Morning, Lunch, Afternoon, Bedtime }

data class MedTimeGroup(
    val scheduledTime: String,
    val slot: TimeOfDaySlot,
    val meds: List<Medication>,
)

data class TimedEntryGroup(
    val scheduledTime: String,
    val slot: TimeOfDaySlot,
    val entries: List<DayMedicationEntry>,
)

object TimeSlots {
    val Order = listOf(
        TimeOfDaySlot.Dawn,
        TimeOfDaySlot.Morning,
        TimeOfDaySlot.Lunch,
        TimeOfDaySlot.Afternoon,
        TimeOfDaySlot.Bedtime,
    )

    fun parseTimeToMinutes(scheduledTime: String): Int {
        val parts = scheduledTime.split(":")
        val hours = parts.getOrNull(0)?.toIntOrNull()
        val minutes = parts.getOrNull(1)?.toIntOrNull()
        if (hours == null || minutes == null || hours !in 0..23 || minutes !in 0..59) return 0
        return hours * 60 + minutes
    }

    fun timeOfDaySlot(scheduledTime: String): TimeOfDaySlot {
        val minutes = parseTimeToMinutes(scheduledTime)
        return when {
            minutes < 7 * 60 -> TimeOfDaySlot.Dawn
            minutes < 12 * 60 -> TimeOfDaySlot.Morning
            minutes < 15 * 60 -> TimeOfDaySlot.Lunch
            minutes < 18 * 60 -> TimeOfDaySlot.Afternoon
            else -> TimeOfDaySlot.Bedtime
        }
    }

    fun groupMedsByScheduledTime(meds: List<Medication>): List<MedTimeGroup> =
        meds.groupBy { it.scheduledTime }
            .toList()
            .sortedBy { parseTimeToMinutes(it.first) }
            .map { (time, group) ->
                MedTimeGroup(time, timeOfDaySlot(time), group)
            }

    fun groupTimedEntries(entries: List<DayMedicationEntry>): List<TimedEntryGroup> =
        entries.groupBy { it.scheduledTime?.trim().orEmpty() }
            .toList()
            .sortedWith { a, b ->
                when {
                    a.first.isEmpty() -> 1
                    b.first.isEmpty() -> -1
                    else -> parseTimeToMinutes(a.first) - parseTimeToMinutes(b.first)
                }
            }
            .map { (time, group) ->
                TimedEntryGroup(
                    scheduledTime = time.ifEmpty { "--:--" },
                    slot = if (time.isEmpty()) TimeOfDaySlot.Morning else timeOfDaySlot(time),
                    entries = group,
                )
            }
}
