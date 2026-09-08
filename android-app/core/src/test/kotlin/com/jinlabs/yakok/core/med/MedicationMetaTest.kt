package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.copy.Errors
import kotlin.test.assertEquals
import kotlin.test.assertNull
import org.junit.jupiter.api.Test

class MedicationMetaTest {
    @Test
    fun dosePair() {
        assertNull(MedicationMeta.validateDosePair(null, null))
        assertNull(MedicationMeta.validateDosePair(1.0, "tablet"))
        assertEquals(Errors.Med.DosePairRequired, MedicationMeta.validateDosePair(1.0, null))
        assertEquals(Errors.Med.DoseInvalid, MedicationMeta.validateDosePair(0.0, "tablet"))
    }

    @Test
    fun sanitizeAndClamp() {
        assertEquals("12.34", MedicationMeta.sanitizeDoseAmountInput("12a.3b4"))
        assertEquals("1.23", MedicationMeta.sanitizeDoseAmountInput("1.234"))
        val long = "가".repeat(2010)
        assertEquals(2000, MedicationMeta.clampText(long).length)
    }

    @Test
    fun formTooLarge() {
        val empty = MedicationMetaFormFields()
        assertNull(MedicationMeta.validateForm(empty))
        assertEquals(
            Errors.Med.DoseTooLarge,
            MedicationMeta.validateForm(empty.copy(doseAmount = "10000", doseUnit = "tablet")),
        )
    }
}
