package com.jinlabs.yakok.core.med

import kotlin.test.assertEquals
import kotlin.test.assertNull
import org.junit.jupiter.api.Test

class AlarmSlotTest {
    private fun med(
        id: Long,
        scheduledTime: String,
        name: String = "약$id",
        useMethod: String? = null,
        doseAmount: Double? = null,
        doseUnit: String? = null,
    ) = Medication(
        id = id,
        userId = "u",
        name = name,
        scheduledTime = scheduledTime,
        daysMask = "daily",
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
        notificationEnabled = true,
    )

    private val meds = listOf(
        med(1, "08:00", "A", useMethod = "식후", doseAmount = 1.0, doseUnit = "tablet"),
        med(2, "08:00", "B", doseAmount = 2.0, doseUnit = "capsule"),
        med(3, "20:00", "C"),
    )

    @Test
    fun medsAtScheduledTime_sameSlot() {
        assertEquals(
            listOf(1L, 2L),
            AlarmSlotResolver.medsAtScheduledTime(meds, "08:00").map { it.medicationId },
        )
    }

    @Test
    fun resolve_specifiedTime() {
        val slot = AlarmSlotResolver.resolve(meds, scheduledTime = "08:00")
        assertEquals("08:00", slot?.scheduledTime)
        assertEquals(listOf(1L, 2L), slot?.items?.map { it.medicationId })
    }

    @Test
    fun resolve_preferMulti() {
        val slot = AlarmSlotResolver.resolve(meds, preferMulti = true)
        assertEquals("08:00", slot?.scheduledTime)
        assertEquals(2, slot?.items?.size)
    }

    @Test
    fun resolve_earliestDefault() {
        val slot = AlarmSlotResolver.resolve(meds)
        assertEquals("08:00", slot?.scheduledTime)
    }

    @Test
    fun resolve_empty() {
        assertNull(AlarmSlotResolver.resolve(emptyList()))
    }

    @Test
    fun pending_filtersTaken() {
        val pending = AlarmSlotResolver.pendingMedsAtScheduledTime(meds, setOf(1L), "08:00")
        assertEquals(listOf(2L), pending.map { it.medicationId })
        assertEquals(
            emptyList(),
            AlarmSlotResolver.pendingMedsAtScheduledTime(meds, setOf(1L, 2L), "08:00"),
        )
        assertEquals(
            emptyList(),
            AlarmSlotResolver.pendingMedsAtScheduledTime(meds, emptySet(), ""),
        )
    }
}
