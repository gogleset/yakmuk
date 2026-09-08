package com.jinlabs.yakok.core.user

/**
 * RN AuthProvider: 프로필 행이 없어도 getUser가 되면 세션 유지.
 * (가족 만들기 전 · db reset 후 stale JWT만 로그아웃)
 */
object StaleSession {
    fun shouldSignOut(
        hasLocalSession: Boolean,
        hasProfile: Boolean,
        remoteUserExists: Boolean,
    ): Boolean {
        if (!hasLocalSession || hasProfile) return false
        return !remoteUserExists
    }
}
