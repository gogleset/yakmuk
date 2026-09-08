package com.jinlabs.yakok.core.config

import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class SupabaseConfigTest {
    @Test
    fun resolveLocalUrl_loopbackToEmulator() {
        assertEquals(
            "http://10.0.2.2:54421",
            SupabaseConfig.resolveLocalUrl("http://127.0.0.1:54421"),
        )
        assertEquals(
            "http://10.0.2.2:54421",
            SupabaseConfig.resolveLocalUrl("http://localhost:54421"),
        )
    }

    @Test
    fun resolveLocalUrl_lanUnchanged() {
        assertEquals(
            "http://192.168.0.10:54421",
            SupabaseConfig.resolveLocalUrl("http://192.168.0.10:54421"),
        )
    }
}
