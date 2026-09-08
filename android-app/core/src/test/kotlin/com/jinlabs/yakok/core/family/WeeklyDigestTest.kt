package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.ConditionValue
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class WeeklyDigestTest {
    @Test
    fun weekStart_wednesdayToMonday() {
        assertEquals("2026-08-03", WeeklyDigest.weekStartMondayKst("2026-08-05"))
    }

    @Test
    fun allDone_ok() {
        val view = WeeklyDigest.build(
            listOf(
                DayDigestInput("2026-08-03", 2, 2, ConditionValue.Good),
                DayDigestInput("2026-08-04", 2, 2, null),
            ),
            "2026-08-03",
        )
        assertEquals(Copy.Family.WeeklyOk, view.approxLine)
        assertTrue(view.anomalyDays.isEmpty())
        assertEquals(WeeklyDigest.Koki.Happy, WeeklyDigest.koki(view))
    }

    @Test
    fun missedAndBad_anomalies() {
        val view = WeeklyDigest.build(
            listOf(
                DayDigestInput("2026-08-03", 2, 1, null),
                DayDigestInput("2026-08-04", 1, 1, ConditionValue.Bad),
            ),
            "2026-08-03",
        )
        assertEquals(
            listOf(
                WeeklyAnomaly("2026-08-03", WeeklyAnomalyKind.Missed),
                WeeklyAnomaly("2026-08-04", WeeklyAnomalyKind.Bad),
            ),
            view.anomalyDays,
        )
        assertEquals(Copy.Family.WeeklyUneven, view.approxLine)
        assertEquals(WeeklyDigest.Koki.Worried, WeeklyDigest.koki(view))
    }

    @Test
    fun noMeds() {
        val view = WeeklyDigest.build(
            listOf(DayDigestInput("2026-08-03", 0, 0, null)),
            "2026-08-03",
        )
        assertEquals(Copy.Family.WeeklyNoMeds, view.approxLine)
        assertEquals(WeeklyDigest.Koki.Empty, WeeklyDigest.koki(view))
    }

    @Test
    fun anomalyLines_groupWeekdays() {
        assertEquals(
            listOf("금, 토, 일 약이 조금 남았어요"),
            WeeklyDigest.formatAnomalyLines(
                listOf(
                    WeeklyAnomaly("2026-07-31", WeeklyAnomalyKind.Missed),
                    WeeklyAnomaly("2026-08-01", WeeklyAnomalyKind.Missed),
                    WeeklyAnomaly("2026-08-02", WeeklyAnomalyKind.Missed),
                ),
            ),
        )
        assertEquals(
            listOf("월 약이 조금 남았어요", "화 컨디션이 안 좋았어요"),
            WeeklyDigest.formatAnomalyLines(
                listOf(
                    WeeklyAnomaly("2026-08-03", WeeklyAnomalyKind.Missed),
                    WeeklyAnomaly("2026-08-04", WeeklyAnomalyKind.Bad),
                ),
            ),
        )
    }

    @Test
    fun optAndDismiss() {
        assertTrue(WeeklyDigest.parseOpt(null))
        assertFalse(WeeklyDigest.parseOpt("0"))
        assertTrue(WeeklyDigest.isDismissed("2026-08-03", "2026-08-03"))
        assertFalse(WeeklyDigest.isDismissed("2026-08-03", "2026-07-27"))
        assertFalse(WeeklyDigest.isDismissed("2026-08-03", null))
    }
}
