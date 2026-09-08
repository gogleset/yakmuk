package com.jinlabs.yakok.core.med

import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import kotlinx.datetime.Instant
import org.junit.jupiter.api.Test

class AlarmFingerprintTest {
    private fun med(
        id: Long,
        scheduledTime: String,
        daysMask: String = "daily",
        name: String = "약",
        notificationEnabled: Boolean = true,
        useMethod: String? = null,
        doseAmount: Double? = null,
        doseUnit: String? = null,
    ) = Medication(
        id = id,
        userId = "u",
        name = name,
        scheduledTime = scheduledTime,
        daysMask = daysMask,
        createdAt = "",
        deletedAt = null,
        itemSeq = null,
        color = "teal",
        efficacy = null,
        useMethod = useMethod,
        storage = null,
        warning = null,
        doseAmount = doseAmount,
        doseUnit = doseUnit,
        notificationEnabled = notificationEnabled,
    )

    @Test
    fun fingerprints_matchRn() {
        val alarms = AlarmFingerprint.buildExpectedSchedule(
            listOf(
                med(3, "08:00", name = "폐렴"),
                med(4, "15:32", name = "ㅇㅇ"),
            ),
            emptySet(),
        )
        assertEquals(
            listOf("3|daily|8:0|clk4", "4|daily|15:32|clk4"),
            AlarmFingerprint.fingerprintsOf(alarms),
        )
    }

    @Test
    fun notificationDisabled_excluded() {
        val alarms = AlarmFingerprint.buildExpectedSchedule(
            listOf(
                med(1, "08:00", notificationEnabled = false),
                med(2, "20:00"),
            ),
            emptySet(),
        )
        assertEquals(1, alarms.size)
        assertEquals(2L, alarms[0].medicationId)
    }

    @Test
    fun taken_excluded() {
        val alarms = AlarmFingerprint.buildExpectedSchedule(
            listOf(med(1, "08:00")),
            setOf(1L),
        )
        assertTrue(alarms.isEmpty())
    }

    @Test
    fun weekday_expandsToExpo() {
        assertEquals(2, AlarmFingerprint.mon0ToExpoWeekday(0))
        val alarms = AlarmFingerprint.buildExpectedSchedule(
            listOf(med(1, "09:30", daysMask = "0,2")),
            emptySet(),
        )
        assertEquals(
            listOf("1|2|9:30|clk4", "1|4|9:30|clk4"),
            AlarmFingerprint.fingerprintsOf(alarms),
        )
    }

    @Test
    fun meta_notInFingerprint() {
        val alarms = AlarmFingerprint.buildExpectedSchedule(
            listOf(
                med(
                    1,
                    "08:00",
                    name = "혈압약",
                    useMethod = "식후 30분",
                    doseAmount = 1.0,
                    doseUnit = "tablet",
                ),
            ),
            emptySet(),
        )
        assertEquals(1, alarms.size)
        assertEquals("식후 30분", alarms[0].useMethod)
        assertEquals(1.0, alarms[0].doseAmount)
        assertEquals("tablet", alarms[0].doseUnit)
        assertEquals(listOf("1|daily|8:0|clk4"), AlarmFingerprint.fingerprintsOf(alarms))
    }

    @Test
    fun notifData_stringifiesDose() {
        val data = AlarmFingerprint.notifData(
            ExpectedMedAlarm(
                medicationId = 1,
                name = "혈압약",
                scheduledTime = "08:00",
                hour = 8,
                minute = 0,
                weekdayKey = AlarmWeekdayKey.Daily,
                useMethod = "식후 30분",
                doseAmount = 1.0,
                doseUnit = "tablet",
            ),
            "1|daily|8:0|clk4",
        )
        assertEquals("medication", data["kind"])
        assertEquals("1", data["medicationId"])
        assertEquals("08:00", data["scheduledTime"])
        assertEquals("혈압약", data["name"])
        assertEquals("1|daily|8:0|clk4", data["fingerprint"])
        assertEquals("식후 30분", data["useMethod"])
        assertEquals("1", data["doseAmount"])
        assertEquals("tablet", data["doseUnit"])
    }

    @Test
    fun diffFingerprints() {
        assertTrue(AlarmFingerprint.diffFingerprints(listOf("a", "b"), listOf("a", "b")).inSync)
        val d = AlarmFingerprint.diffFingerprints(listOf("a", "b"), listOf("b", "c"))
        assertEquals(listOf("a"), d.missing)
        assertEquals(listOf("c"), d.extra)
        assertFalse(d.inSync)
    }

    @Test
    fun requestCode_matchesJs() {
        assertEquals(848508, AlarmFingerprint.requestCode("3|daily|8:0|clk4"))
        assertEquals(293108, AlarmFingerprint.requestCode("4|daily|15:32|clk4"))
        assertEquals(409067, AlarmFingerprint.requestCode("1|2|9:30|clk4"))
        assertEquals(670434, AlarmFingerprint.requestCode("1|daily|8:0|clk4"))
    }

    @Test
    fun nextTrigger_dailyRollsToTomorrow() {
        // 2026-09-08 10:00 KST = 01:00 UTC
        val now = Instant.parse("2026-09-08T01:00:00Z")
        val morning = ExpectedMedAlarm(
            medicationId = 1,
            name = "약",
            scheduledTime = "08:00",
            hour = 8,
            minute = 0,
            weekdayKey = AlarmWeekdayKey.Daily,
        )
        val afternoon = morning.copy(scheduledTime = "15:00", hour = 15)
        assertEquals(
            Instant.parse("2026-09-08T23:00:00Z").toEpochMilliseconds(),
            AlarmFingerprint.nextTriggerAtMs(morning, now),
        )
        assertEquals(
            Instant.parse("2026-09-08T06:00:00Z").toEpochMilliseconds(),
            AlarmFingerprint.nextTriggerAtMs(afternoon, now),
        )
    }

    @Test
    fun nextTrigger_expoWeekday() {
        // Tuesday 2026-09-08 10:00 KST · expo 2 = Monday → 2026-09-14 09:30 KST
        val now = Instant.parse("2026-09-08T01:00:00Z")
        val alarm = ExpectedMedAlarm(
            medicationId = 1,
            name = "약",
            scheduledTime = "09:30",
            hour = 9,
            minute = 30,
            weekdayKey = AlarmWeekdayKey.Expo(2),
        )
        assertEquals(
            Instant.parse("2026-09-14T00:30:00Z").toEpochMilliseconds(),
            AlarmFingerprint.nextTriggerAtMs(alarm, now),
        )
    }
}
