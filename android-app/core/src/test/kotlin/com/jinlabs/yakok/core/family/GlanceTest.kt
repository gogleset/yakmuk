package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.user.UserRole
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class GlanceTest {
    private fun member(
        userId: String,
        nickname: String = "엄마",
        role: UserRole = UserRole.CareRecipient,
        hasUnackedAlert: Boolean = false,
        pendingCount: Int = 1,
        totalMeds: Int = 2,
    ) = MemberTodayStatus(
        userId = userId,
        nickname = nickname,
        invitedAs = null,
        role = role,
        totalMeds = totalMeds,
        takenCount = totalMeds - pendingCount,
        pendingCount = pendingCount,
        condition = null,
        conditionMessage = null,
        hasUnackedAlert = hasUnackedAlert,
    )

    @Test
    fun viewer_leaderAndGuardian() {
        assertTrue(Glance.isViewer(UserRole.FamilyLeader))
        assertTrue(Glance.isViewer(UserRole.Guardian))
        assertFalse(Glance.isViewer(UserRole.CareRecipient))
        assertFalse(Glance.isViewer(null))
    }

    @Test
    fun pick_alertFirstThenFirstRecipient() {
        assertEquals(
            "b",
            Glance.pickMember(
                listOf(
                    member("a", "아빠", hasUnackedAlert = false),
                    member("b", "엄마", hasUnackedAlert = true),
                ),
                "me",
            )?.userId,
        )
        assertEquals(
            "a",
            Glance.pickMember(
                listOf(member("a", "아빠"), member("b", "엄마")),
                "me",
            )?.userId,
        )
        assertNull(Glance.pickMember(listOf(member("me", "나")), "me"))
    }

    @Test
    fun line_noFractions() {
        assertEquals(
            Copy.Family.glanceLine("엄마", Copy.Family.StatusAllTaken),
            Glance.line(member("a", pendingCount = 0, totalMeds = 2)),
        )
    }

    @Test
    fun statusLabels() {
        assertEquals(Copy.Family.StatusAnbu, MemberStatus.label(true, 2, 3))
        assertEquals(Copy.Family.StatusAllTaken, MemberStatus.label(false, 0, 3))
        assertEquals(Copy.Family.StatusInProgress, MemberStatus.label(false, 2, 3))
        assertEquals(Copy.Family.StatusNoMeds, MemberStatus.label(false, 0, 0))
    }

    @Test
    fun optDefaultOn() {
        assertTrue(Glance.parseOpt(null))
        assertTrue(Glance.parseOpt("1"))
        assertFalse(Glance.parseOpt("0"))
        assertFalse(Glance.parseOpt("false"))
    }

    @Test
    fun stale_30min() {
        val now = 1_000_000L
        assertTrue(Glance.isStale(now - 31 * 60_000, now, 30))
        assertFalse(Glance.isStale(now - 10 * 60_000, now, 30))
        assertTrue(Glance.isStale(null, now, 30))
    }
}
