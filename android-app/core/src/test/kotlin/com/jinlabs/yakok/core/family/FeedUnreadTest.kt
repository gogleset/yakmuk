package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.LogStatus
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class FeedUnreadTest {
    @Test
    fun isDayUnread_cases() {
        assertFalse(FeedUnread.isDayUnread(null, null))
        assertTrue(FeedUnread.isDayUnread(null, "2026-08-10T10:00:00.000Z"))
        assertTrue(
            FeedUnread.isDayUnread("2026-08-10T09:00:00.000Z", "2026-08-10T10:00:00.000Z"),
        )
        assertFalse(
            FeedUnread.isDayUnread("2026-08-10T10:00:00.000Z", "2026-08-10T09:00:00.000Z"),
        )
        assertFalse(
            FeedUnread.isDayUnread("2026-08-10T10:00:00.000Z", "2026-08-10T10:00:00.000Z"),
        )
    }

    @Test
    fun latestCreatedAtByDate_keepsMax() {
        val map = FeedUnread.latestCreatedAtByDate(
            listOf(
                "2026-08-10" to "2026-08-10T08:00:00.000Z",
                "2026-08-10" to "2026-08-10T12:00:00.000Z",
                "2026-08-09" to "2026-08-09T01:00:00.000Z",
            ),
        )
        assertEquals("2026-08-10T12:00:00.000Z", map["2026-08-10"])
        assertEquals("2026-08-09T01:00:00.000Z", map["2026-08-09"])
    }

    @Test
    fun hasUnreadDays() {
        val reads = listOf(
            FamilyFeedDayRead("f1", "u1", "2026-08-09", "2026-08-09T20:00:00.000Z"),
        )
        val unread = FamilyFeedSection(
            dateYmd = "2026-08-10",
            title = "오늘",
            data = listOf(feedLog("2026-08-10", "2026-08-10T01:00:00.000Z")),
        )
        val read = FamilyFeedSection(
            dateYmd = "2026-08-09",
            title = "어제",
            data = listOf(feedLog("2026-08-09", "2026-08-09T10:00:00.000Z")),
        )
        assertTrue(FeedUnread.hasUnreadDays(listOf(unread, read), FeedUnread.readsByDate(reads)))
        assertFalse(FeedUnread.hasUnreadDays(listOf(read), FeedUnread.readsByDate(reads)))
    }

    private fun feedLog(date: String, createdAt: String) = DailyLog(
        id = 1,
        medicationId = 1,
        userId = "u1",
        logDate = date,
        status = LogStatus.Taken,
        condition = null,
        message = null,
        familyId = "f1",
        createdAt = createdAt,
        nickname = "엄마",
        medicationName = null,
    )
}
