package com.jinlabs.yakok.core.time

import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class FormatTest {
    @Test
    fun feedDayHeading() {
        assertEquals("오늘", Format.feedDayHeading("2026-07-31", "2026-07-31"))
        assertEquals("어제", Format.feedDayHeading("2026-07-30", "2026-07-31"))
        assertEquals("7월 28일 (화)", Format.feedDayHeading("2026-07-28", "2026-07-31"))
    }

    @Test
    fun relativeTime() {
        val now = 1_752_000_000_000L
        val iso = InstantHack.fromEpoch(now - 90_000)
        assertEquals("1분 전", Format.relativeTime(iso, now))
        assertEquals("방금", Format.relativeTime(InstantHack.fromEpoch(now - 10_000), now))
    }

    @Test
    fun nicknameInitial() {
        assertEquals("엄", Format.nicknameInitial("엄마"))
        assertEquals("?", Format.nicknameInitial("  "))
    }
}

private object InstantHack {
    fun fromEpoch(ms: Long): String {
        val sec = ms / 1000
        return kotlinx.datetime.Instant.fromEpochSeconds(sec).toString()
    }
}
