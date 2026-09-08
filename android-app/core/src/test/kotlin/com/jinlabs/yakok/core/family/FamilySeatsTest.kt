package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.FamilyRoles
import com.jinlabs.yakok.core.user.UserRole
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class FamilySeatsTest {
    private fun member(
        userId: String,
        nickname: String,
        role: UserRole = UserRole.Guardian,
        invitedAs: String? = null,
    ) = FamilyMember(userId, nickname, invitedAs, role)

    private fun invite(
        id: String,
        invitedAs: String,
        claimedBy: String? = null,
        reentryUserId: String? = null,
    ) = FamilyInvite(
        id = id,
        familyId = "f1",
        inviteCode = "ABC123",
        invitedAs = invitedAs,
        targetRole = UserRole.Guardian,
        claimedBy = claimedBy,
        claimedAt = if (claimedBy != null) "2026-01-01" else null,
        reentryUserId = reentryUserId,
    )

    @Test
    fun fillsToMaxWithEmpty_excludesLeader() {
        val seats = FamilySeats.build(
            members = listOf(
                member("L", "리더", UserRole.FamilyLeader),
                member("m1", "엄마", invitedAs = "엄마"),
            ),
            invites = emptyList(),
            maxSeats = 6,
        )
        assertEquals(6, seats.size)
        assertTrue(seats[0] is FamilySeat.Member)
        assertEquals("m1", (seats[0] as FamilySeat.Member).userId)
        assertEquals(5, seats.count { it is FamilySeat.Empty })
    }

    @Test
    fun ordersMemberThenPendingThenEmpty() {
        val seats = FamilySeats.build(
            members = listOf(member("m1", "엄마")),
            invites = listOf(
                invite("i1", "할머니"),
                invite("i2", "엄마", claimedBy = "m1"),
            ),
            maxSeats = 6,
        )
        assertEquals(
            listOf("member", "pending", "empty", "empty", "empty", "empty"),
            seats.map {
                when (it) {
                    is FamilySeat.Member -> "member"
                    is FamilySeat.Pending -> "pending"
                    FamilySeat.Empty -> "empty"
                }
            },
        )
        assertEquals("i2", (seats[0] as FamilySeat.Member).inviteId)
        assertEquals("i1", (seats[1] as FamilySeat.Pending).invite.id)
    }

    @Test
    fun clampsWhenOccupiedExceedsMax() {
        val seats = FamilySeats.build(
            members = listOf(
                member("1", "a"),
                member("2", "b"),
                member("3", "c"),
            ),
            invites = listOf(
                invite("i1", "x"),
                invite("i2", "y"),
                invite("i3", "z"),
                invite("i4", "w"),
            ),
            maxSeats = 6,
        )
        assertEquals(6, seats.size)
        assertTrue(seats.none { it is FamilySeat.Empty })
        assertEquals(3, seats.count { it is FamilySeat.Member })
        assertEquals(3, seats.count { it is FamilySeat.Pending })
    }

    @Test
    fun marksReentryPending() {
        val seats = FamilySeats.build(
            members = emptyList(),
            invites = listOf(invite("i1", "이모", reentryUserId = "u1")),
            maxSeats = 2,
        )
        val pending = seats[0] as FamilySeat.Pending
        assertEquals(FamilySeatPendingKind.Reentry, pending.pendingKind)
    }
}

class FamilyRolesTest {
    @Test
    fun canCreateInvite() {
        assertTrue(FamilyRoles.canCreateInvite(UserRole.FamilyLeader))
        assertFalse(FamilyRoles.canCreateInvite(UserRole.Guardian))
        assertFalse(FamilyRoles.canCreateInvite(UserRole.CareRecipient))
    }

    @Test
    fun canManageMemberMeds() {
        assertTrue(FamilyRoles.canManageMemberMeds(UserRole.FamilyLeader, UserRole.CareRecipient))
        assertTrue(FamilyRoles.canManageMemberMeds(UserRole.Guardian, UserRole.CareRecipient))
        assertFalse(FamilyRoles.canManageMemberMeds(UserRole.Guardian, UserRole.Guardian))
        assertFalse(FamilyRoles.canManageMemberMeds(UserRole.CareRecipient, UserRole.CareRecipient))
        assertFalse(FamilyRoles.canManageMemberMeds(null, UserRole.CareRecipient))
    }

    @Test
    fun canCreateInviteInput() {
        assertTrue(FamilyRoles.canCreateInviteInput(UserRole.Guardian, "아빠"))
        assertFalse(FamilyRoles.canCreateInviteInput(UserRole.Guardian, "  "))
        assertFalse(FamilyRoles.canCreateInviteInput(UserRole.FamilyLeader, "아빠"))
    }

    @Test
    fun canViewGlance_leaderAndGuardian() {
        assertTrue(FamilyRoles.canViewGlance(UserRole.FamilyLeader))
        assertTrue(FamilyRoles.canViewGlance(UserRole.Guardian))
        assertFalse(FamilyRoles.canViewGlance(UserRole.CareRecipient))
        assertFalse(FamilyRoles.canViewGlance(null))
    }
}
