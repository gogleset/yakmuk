package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.constants.MedColors
import com.jinlabs.yakok.core.constants.MedDoseUnits
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class MedMappersTest {
    private val base = mapOf(
        "id" to 1,
        "user_id" to "u1",
        "name" to "타이레놀",
        "scheduled_time" to "08:00:00",
        "days_mask" to "daily",
        "created_at" to "2026-07-31T00:00:00Z",
        "deleted_at" to null,
    )

    @Test
    fun mapMedication_meta() {
        val med = MedMappers.mapMedication(
            base + mapOf(
                "item_seq" to "200808942",
                "color" to "coral",
                "efficacy" to "해열",
                "use_method" to "1정",
                "storage" to "실온",
                "warning" to "과량 주의",
                "dose_amount" to 1,
                "dose_unit" to "tablet",
            ),
        )
        assertEquals("200808942", med.itemSeq)
        assertEquals("coral", med.color)
        assertEquals(1.0, med.doseAmount)
        assertEquals("tablet", med.doseUnit)
        assertEquals("08:00", med.scheduledTime)
    }

    @Test
    fun mapMedication_defaults() {
        val med = MedMappers.mapMedication(base)
        assertNull(med.itemSeq)
        assertEquals(MedColors.DefaultId, med.color)
        assertTrue(med.notificationEnabled)
        assertNull(med.doseAmount)
    }

    @Test
    fun mapMedication_notificationOff() {
        val med = MedMappers.mapMedication(base + mapOf("notification_enabled" to false))
        assertFalse(med.notificationEnabled)
    }

    @Test
    fun formatDose() {
        assertEquals("1정", MedDoseUnits.formatDose(1.0, "tablet"))
        assertEquals("5ml", MedDoseUnits.formatDose(5.0, "ml"))
        assertEquals("0.5포", MedDoseUnits.formatDose(0.5, "packet"))
        assertNull(MedDoseUnits.formatDose(1.0, null))
    }
}
