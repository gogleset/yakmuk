package com.jinlabs.yakok.core.time

import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlinx.datetime.Instant
import org.junit.jupiter.api.Test

class KstTest {
    @Test
    fun todayDateString_kstCalendar() {
        // 2026-01-15 15:00:00 UTC = 2026-01-16 00:00 KST
        val now = Instant.parse("2026-01-15T15:00:00Z")
        assertEquals("2026-01-16", Kst.todayDateString(now))
    }

    @Test
    fun todayDateString_beforeKstMidnight() {
        val now = Instant.parse("2026-01-15T14:59:59Z")
        assertEquals("2026-01-15", Kst.todayDateString(now))
    }

    @Test
    fun addDays() {
        assertEquals("2026-01-16", Kst.addDays("2026-01-15", 1))
        assertEquals("2025-12-31", Kst.addDays("2026-01-01", -1))
        assertEquals("bad", Kst.addDays("bad", 1))
    }

    @Test
    fun weekdayMon0_mondayIsZero() {
        // 2026-09-07 Monday
        assertEquals(0, Kst.weekdayMon0("2026-09-07"))
        // 2026-09-06 Sunday
        assertEquals(6, Kst.weekdayMon0("2026-09-06"))
        // 2026-09-09 Wednesday
        assertEquals(2, Kst.weekdayMon0("2026-09-09"))
    }

    @Test
    fun weekdayMon0_invalid() {
        assertFailsWith<IllegalArgumentException> { Kst.weekdayMon0("nope") }
    }

    @Test
    fun msUntilDayEnd_beforeEnd() {
        val now = Instant.parse("2026-01-15T14:00:00Z") // 23:00 KST
        val left = Kst.msUntilDayEnd(now)
        assertTrue(left in 3_599_000L..3_601_000L)
    }

    @Test
    fun dateStringFromIso() {
        assertEquals("2026-01-16", Kst.dateStringFromIso("2026-01-15T15:30:00Z"))
    }
}
