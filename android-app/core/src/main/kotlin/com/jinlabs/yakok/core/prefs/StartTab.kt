package com.jinlabs.yakok.core.prefs

/** 앱 진입 첫 탭. 설정은 후보 아님. RN `startTab.ts`. */
enum class StartTab {
    Home,
    Family,
}

object StartTabs {
    val Default: StartTab = StartTab.Home

    fun parse(raw: String?): StartTab =
        when (raw) {
            "home" -> StartTab.Home
            "family" -> StartTab.Family
            else -> Default
        }

    fun storageValue(tab: StartTab): String =
        when (tab) {
            StartTab.Home -> "home"
            StartTab.Family -> "family"
        }
}
