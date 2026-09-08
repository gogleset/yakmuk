package com.jinlabs.yakok.core.med

import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class MedCalendarTest {
    private fun med(
        id: Long = 1,
        daysMask: String = "daily",
        createdAt: String = "2026-01-01T00:00:00Z",
        deletedAt: String? = null,
    ) = Medication(
        id = id,
        userId = "u",
        name = "약$id",
        scheduledTime = "08:00",
        daysMask = daysMask,
        createdAt = createdAt,
        deletedAt = deletedAt,
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

    private fun taken(id: Long, date: String, medId: Long? = 1) = DailyLog(
        id = id,
        medicationId = medId,
        userId = "u",
        logDate = date,
        status = LogStatus.Taken,
        condition = null,
        message = null,
        familyId = "f",
        createdAt = "${date}T00:00:00Z",
        nickname = null,
        medicationName = null,
    )

    @Test
    fun scheduledOnWeekday() {
        val daily = med()
        assertTrue(MedCalendar.isMedScheduledOnDate(daily, "2026-09-07"))
        val wed = med(daysMask = "2")
        assertTrue(MedCalendar.isMedScheduledOnDate(wed, "2026-09-09"))
        assertFalse(MedCalendar.isMedScheduledOnDate(wed, "2026-09-07"))
    }

    @Test
    fun inactiveBeforeCreated() {
        val m = med(createdAt = "2026-09-07T00:00:00Z")
        assertFalse(MedCalendar.isMedActiveOnDate(m, "2026-09-06"))
        assertTrue(MedCalendar.isMedActiveOnDate(m, "2026-09-07"))
    }

    @Test
    fun aggregateTodayPartialDone() {
        val meds = listOf(med(1), med(2))
        val today = "2026-09-07"
        assertEquals(
            DayMedStatus.Scheduled,
            MedCalendar.aggregateDayStatus(today, meds, emptyList(), today),
        )
        assertEquals(
            DayMedStatus.Partial,
            MedCalendar.aggregateDayStatus(today, meds, listOf(taken(1, today, 1)), today),
        )
        assertEquals(
            DayMedStatus.Done,
            MedCalendar.aggregateDayStatus(
                today,
                meds,
                listOf(taken(1, today, 1), taken(2, today, 2)),
                today,
            ),
        )
    }

    @Test
    fun pastMissed() {
        val meds = listOf(med())
        assertEquals(
            DayMedStatus.Missed,
            MedCalendar.aggregateDayStatus("2026-09-06", meds, emptyList(), "2026-09-07"),
        )
    }

    @Test
    fun dayCompleteMarkerNotOrphan() {
        val marker = DailyLog(
            id = 9,
            medicationId = null,
            userId = "u",
            logDate = "2026-09-07",
            status = LogStatus.Taken,
            condition = null,
            message = DayCompleteFeed.Marker,
            familyId = "f",
            createdAt = "2026-09-07T00:00:00Z",
            nickname = null,
            medicationName = null,
        )
        assertTrue(DayCompleteFeed.isFeedLog(marker))
        val entries = MedCalendar.buildDayMedicationEntries("2026-09-07", listOf(med()), listOf(marker))
        assertEquals(1, entries.size)
        assertFalse(entries[0].taken)
    }

    @Test
    fun streakSkipsEmpty() {
        val meds = listOf(med())
        val logs = listOf(
            taken(1, "2026-09-07"),
            taken(2, "2026-09-06"),
        )
        assertEquals(2, MedCalendar.computeStreakDays(meds, logs, "2026-09-07"))
    }

    @Test
    fun monthRange() {
        assertEquals("2026-09-01" to "2026-09-30", MedCalendar.monthRange("2026-09"))
        assertEquals("2026-02-01" to "2026-02-28", MedCalendar.monthRange("2026-02"))
    }
}
