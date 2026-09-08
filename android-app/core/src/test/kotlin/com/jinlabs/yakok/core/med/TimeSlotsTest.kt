package com.jinlabs.yakok.core.med

import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class TimeSlotsTest {
    private fun med(id: Long, time: String, name: String = "약$id") = Medication(
        id = id,
        userId = "u",
        name = name,
        scheduledTime = time,
        daysMask = "daily",
        createdAt = "2026-01-01T00:00:00Z",
        deletedAt = null,
        itemSeq = null,
        color = "teal",
        efficacy = null,
        useMethod = null,
        storage = null,
        warning = null,
        doseAmount = null,
        doseUnit = null,
        notificationEnabled = true,
    )

    @Test
    fun parseAndBuckets() {
        assertEquals(480, TimeSlots.parseTimeToMinutes("08:00"))
        assertEquals(0, TimeSlots.parseTimeToMinutes("bad"))
        assertEquals(TimeOfDaySlot.Dawn, TimeSlots.timeOfDaySlot("00:00"))
        assertEquals(TimeOfDaySlot.Dawn, TimeSlots.timeOfDaySlot("06:59"))
        assertEquals(TimeOfDaySlot.Morning, TimeSlots.timeOfDaySlot("07:00"))
        assertEquals(TimeOfDaySlot.Lunch, TimeSlots.timeOfDaySlot("12:00"))
        assertEquals(TimeOfDaySlot.Afternoon, TimeSlots.timeOfDaySlot("15:00"))
        assertEquals(TimeOfDaySlot.Bedtime, TimeSlots.timeOfDaySlot("18:00"))
    }

    @Test
    fun groupMeds() {
        val groups = TimeSlots.groupMedsByScheduledTime(
            listOf(med(3, "19:00"), med(1, "08:00", "A"), med(2, "08:00", "B"), med(4, "12:30")),
        )
        assertEquals(listOf("08:00", "12:30", "19:00"), groups.map { it.scheduledTime })
        assertEquals(listOf("A", "B"), groups[0].meds.map { it.name })
        assertEquals(TimeOfDaySlot.Morning, groups[0].slot)
        assertEquals(TimeOfDaySlot.Bedtime, groups[2].slot)
    }

    @Test
    fun groupTimedEntries_nullLast() {
        val groups = TimeSlots.groupTimedEntries(
            listOf(
                DayMedicationEntry("1", "A", "19:00", false),
                DayMedicationEntry("2", "B", null, true),
                DayMedicationEntry("3", "C", "08:00", true),
            ),
        )
        assertEquals(listOf("08:00", "19:00", "--:--"), groups.map { it.scheduledTime })
    }
}
