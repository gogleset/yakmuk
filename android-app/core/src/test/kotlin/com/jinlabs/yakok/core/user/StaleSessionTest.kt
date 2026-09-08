package com.jinlabs.yakok.core.user

import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class StaleSessionTest {
    @Test
    fun keepSession_beforeFamilyRow() {
        assertFalse(StaleSession.shouldSignOut(hasLocalSession = true, hasProfile = false, remoteUserExists = true))
    }

    @Test
    fun drop_afterDbReset() {
        assertTrue(StaleSession.shouldSignOut(hasLocalSession = true, hasProfile = false, remoteUserExists = false))
    }

    @Test
    fun keep_whenProfileExists() {
        assertFalse(StaleSession.shouldSignOut(hasLocalSession = true, hasProfile = true, remoteUserExists = false))
    }

    @Test
    fun noop_withoutSession() {
        assertFalse(StaleSession.shouldSignOut(hasLocalSession = false, hasProfile = false, remoteUserExists = false))
    }
}
