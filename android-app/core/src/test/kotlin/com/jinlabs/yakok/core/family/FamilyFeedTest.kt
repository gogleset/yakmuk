package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.LogStatus
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class FamilyFeedTest {
    private fun log(
        id: Long,
        logDate: String,
        createdAt: String = "${logDate}T00:00:00.000Z",
    ): DailyLog = DailyLog(
        id = id,
        medicationId = 1,
        userId = "u1",
        logDate = logDate,
        status = LogStatus.Taken,
        condition = null,
        message = null,
        familyId = "f1",
        createdAt = createdAt,
        nickname = "엄마",
        medicationName = null,
    )

    @Test
    fun filterLastDays_includesTodayWindow() {
        val today = "2026-07-31"
        val items = listOf(
            log(1, "2026-07-31"),
            log(2, "2026-07-25"),
            log(3, "2026-07-24"),
        )
        assertEquals(listOf(1L, 2L), FamilyFeed.filterLastDays(items, today, 7).map { it.id })
    }

    @Test
    fun groupByDate_newestFirst() {
        val today = "2026-07-31"
        val items = listOf(
            log(1, "2026-07-31"),
            log(2, "2026-07-31"),
            log(3, "2026-07-30"),
            log(4, "2026-07-28"),
        )
        val sections = FamilyFeed.groupByDate(items, today)
        assertEquals(listOf("오늘", "어제", "7월 28일 (화)"), sections.map { it.title })
        assertEquals(listOf(1L, 2L), sections[0].data.map { it.id })
    }

    @Test
    fun slicePreview_keepsFirstN() {
        val today = "2026-07-31"
        val items = listOf(
            log(1, "2026-07-31"),
            log(2, "2026-07-31"),
            log(3, "2026-07-30"),
            log(4, "2026-07-28"),
        )
        val preview = FamilyFeed.sliceSections(FamilyFeed.groupByDate(items, today), 3)
        assertEquals(listOf("오늘", "어제"), preview.map { it.title })
        assertEquals(listOf(1L, 2L, 3L), preview.flatMap { it.data.map { d -> d.id } })
    }
}
