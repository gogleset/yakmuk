package com.jinlabs.yakok.core.med

import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class DaysMaskTest {
    @Test
    fun parse_daily() {
        val (mode, days) = DaysMask.parse("daily")
        assertEquals(DaysMode.Daily, mode)
        assertTrue(days.isEmpty())
    }

    @Test
    fun parse_weekdays() {
        val (mode, days) = DaysMask.parse("0,2,4")
        assertEquals(DaysMode.Weekday, mode)
        assertEquals(listOf(0, 2, 4), days)
    }

    @Test
    fun format_and_label() {
        assertEquals("daily", DaysMask.format(DaysMode.Daily, emptyList()))
        assertEquals("0,2", DaysMask.format(DaysMode.Weekday, listOf(2, 0, 0)))
        assertEquals("매일", DaysMask.label("daily"))
        assertEquals("월·수", DaysMask.label("0,2"))
    }

    @Test
    fun expandSameSchedule() {
        val slots = DaysMask.expandSameSchedule(listOf("08:00", " 08:00 ", "20:00"), "daily")
        assertEquals(2, slots.size)
        assertEquals("20:00", slots[1].scheduledTime)
        assertTrue(slots.all { it.notificationEnabled })
    }

    @Test
    fun validateSameSchedule() {
        assertEquals(
            DaysMask.ScheduleError.NoTimes,
            DaysMask.validateSameSchedule(emptyList(), DaysMode.Daily, emptyList()),
        )
        assertEquals(
            DaysMask.ScheduleError.DuplicateTimes,
            DaysMask.validateSameSchedule(listOf("08:00", "08:00"), DaysMode.Daily, emptyList()),
        )
        assertNull(DaysMask.validateSameSchedule(listOf("08:00"), DaysMode.Daily, emptyList()))
    }

    @Test
    fun normalizeHhmm() {
        assertEquals("08:00", DaysMask.normalizeHhmm("8:00"))
        assertEquals("08:00", DaysMask.normalizeHhmm("bad"))
    }
}
