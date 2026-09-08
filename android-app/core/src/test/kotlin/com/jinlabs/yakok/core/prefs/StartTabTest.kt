package com.jinlabs.yakok.core.prefs

import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class StartTabTest {
    @Test
    fun parse_homeFamilyOnly() {
        assertEquals(StartTab.Home, StartTabs.parse("home"))
        assertEquals(StartTab.Family, StartTabs.parse("family"))
    }

    @Test
    fun parse_junkIsHome() {
        assertEquals(StartTab.Home, StartTabs.parse(null))
        assertEquals(StartTab.Home, StartTabs.parse(""))
        assertEquals(StartTab.Home, StartTabs.parse("settings"))
        assertEquals(StartTab.Home, StartTabs.parse("HOME"))
    }

    @Test
    fun defaultIsHome() {
        assertEquals(StartTab.Home, StartTabs.Default)
    }
}
