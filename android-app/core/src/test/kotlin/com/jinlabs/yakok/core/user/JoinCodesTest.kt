package com.jinlabs.yakok.core.user

import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class JoinCodesTest {
    @Test
    fun normalize_upperTrim() {
        assertEquals("ABCDEF", JoinCodes.normalize(" abcdef "))
    }

    @Test
    fun normalize_stripsNonAlnum() {
        assertEquals("ABCDEF", JoinCodes.normalize("abc-def"))
        assertEquals("ABC123", JoinCodes.normalize(" abc 123 "))
    }

    @Test
    fun isComplete_sixOnly() {
        assertTrue(JoinCodes.isComplete("ABC DEF"))
        assertTrue(JoinCodes.isComplete("abcdef"))
        assertFalse(JoinCodes.isComplete("ABCDE"))
        assertFalse(JoinCodes.isComplete(""))
    }

    @Test
    fun joinDeepLink_usesYakokScheme() {
        assertEquals("yakok://join?code=ABC123", JoinCodes.joinDeepLink("abc123"))
        assertEquals("yakok", JoinCodes.Scheme)
    }
}
