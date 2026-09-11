package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.copy.Copy
import kotlin.test.assertEquals
import kotlin.test.assertNull
import org.junit.jupiter.api.Test

class MedPurposeTest {
    @Test
    fun roundTripWires() {
        MedPurpose.entries.forEach { purpose ->
            assertEquals(purpose, MedPurpose.fromWire(purpose.wire))
        }
        Discomfort.entries.forEach { value ->
            assertEquals(value, Discomfort.fromWire(value.wire))
        }
        assertNull(MedPurpose.fromWire(null))
        assertNull(Discomfort.fromWire("nope"))
    }

    @Test
    fun labels() {
        assertEquals("혈압", Copy.Purpose.label(MedPurpose.Bp))
        assertEquals("머리", Copy.Discomfort.label(Discomfort.Head))
    }
}
