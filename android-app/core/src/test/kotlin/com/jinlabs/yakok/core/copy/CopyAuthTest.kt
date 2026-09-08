package com.jinlabs.yakok.core.copy

import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.RoleLabels
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.core.user.UserRole
import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class CopyAuthTest {
    @Test
    fun joinFamilyOf() {
        assertEquals("아들님의 가족", Copy.Join.familyOf("아들"))
        assertEquals("가족장님의 가족", Copy.Join.familyOf(" "))
    }

    @Test
    fun roleLabels() {
        assertEquals("가족장", RoleLabels.label(UserRole.FamilyLeader))
        assertEquals("보호자", RoleLabels.label(UserRole.Guardian))
        assertEquals("피보호자", RoleLabels.label(UserRole.CareRecipient))
    }

    @Test
    fun remainingToday() {
        assertEquals("약 2개 남았어요", Copy.Med.remainingToday(2))
        assertEquals("3일 연속이에요", Copy.Med.streakDays(3))
        assertEquals("오늘 컨디션은 좋음이에요!", Copy.Condition.savedPrompt("좋음"))
        assertEquals("가", Copy.subjectGa("엄마"))
        assertEquals("가", Copy.subjectGa("아빠"))
        assertEquals("이", Copy.subjectGa("형"))
        assertEquals("엄마가 약을 복용했어요", Copy.Family.feedTaken("엄마"))
        assertEquals("yakok://join?code=ABC123", JoinCodes.joinDeepLink("abc123"))
        assertEquals("혈압약 · 08:00", Copy.Notif.doseBody("혈압약", "08:00"))
        assertEquals("엄마 · 다 먹음", Copy.Family.glanceLine("엄마", Copy.Family.StatusAllTaken))
        assertEquals("금, 토 약이 조금 남았어요", Copy.Family.weeklyMissedDays("금, 토"))
    }
}
