package com.jinlabs.yakok.core.constants

import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class MedColorsTest {
    @Test
    fun softFill_coral() {
        assertEquals("#C46B5A", MedColors.resolveHex("coral"))
        assertEquals("rgba(196, 107, 90, 0.2)", MedColors.softFill("coral", 0.2f))
    }

    @Test
    fun softFill_defaultAlpha() {
        assertEquals("rgba(77, 134, 121, 0.2)", MedColors.softFill("teal"))
    }

    @Test
    fun unknownFallsBackToTeal() {
        assertEquals("#4D8679", MedColors.resolveHex("nope"))
    }
}
