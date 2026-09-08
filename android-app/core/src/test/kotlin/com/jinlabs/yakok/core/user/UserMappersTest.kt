package com.jinlabs.yakok.core.user

import kotlin.test.assertEquals
import kotlin.test.assertNull
import org.junit.jupiter.api.Test

class UserMappersTest {
    @Test
    fun mapUser_forceSignOut() {
        val user = UserMappers.mapUser(
            mapOf(
                "id" to "u1",
                "nickname" to "아빠",
                "invited_as" to "아빠",
                "role" to "care_recipient",
                "family_id" to "f1",
                "push_token" to null,
                "force_sign_out_at" to "2026-08-01T00:00:00Z",
            ),
        )
        assertEquals("u1", user.id)
        assertEquals(UserRole.CareRecipient, user.role)
        assertEquals("f1", user.familyId)
        assertEquals("2026-08-01T00:00:00Z", user.forceSignOutAt)
        assertNull(user.pushToken)
    }

    @Test
    fun mapUser_legacyExpoPushTokenKey() {
        val user = UserMappers.mapUser(
            mapOf(
                "id" to "u1",
                "nickname" to "아빠",
                "role" to "guardian",
                "expo_push_token" to "legacy",
            ),
        )
        assertEquals("legacy", user.pushToken)
    }

    @Test
    fun mapUser_nulls() {
        val user = UserMappers.mapUser(
            mapOf(
                "id" to "u1",
                "nickname" to "리더",
                "invited_as" to null,
                "role" to "family_leader",
                "family_id" to "f1",
                "push_token" to null,
                "force_sign_out_at" to null,
            ),
        )
        assertNull(user.forceSignOutAt)
        assertNull(user.invitedAs)
        assertNull(user.pushToken)
        assertEquals(UserRole.FamilyLeader, user.role)
    }

    @Test
    fun parseInvitePeek_members() {
        val peek = UserMappers.parseInvitePeek(
            mapOf(
                "kind" to "invite",
                "family_name" to "우리집",
                "invited_as" to "엄마",
                "target_role" to "care_recipient",
                "leader_nickname" to "아들",
                "nickname" to null,
                "member_nicknames" to listOf("아들", "  ", "엄마"),
            ),
        )
        assertEquals(JoinPeekKind.Invite, peek.kind)
        assertEquals("우리집", peek.familyName)
        assertEquals(listOf("아들", "엄마"), peek.memberNicknames)
        assertEquals("아들", peek.leaderNickname)
    }

    @Test
    fun parseInvitePeek_recoveryDefaultLeader() {
        val peek = UserMappers.parseInvitePeek(
            mapOf(
                "kind" to "recovery",
                "family_name" to "집",
                "invited_as" to "아빠",
                "target_role" to "guardian",
            ),
        )
        assertEquals(JoinPeekKind.Recovery, peek.kind)
        assertEquals("가족장", peek.leaderNickname)
        assertEquals(UserRole.Guardian, peek.targetRole)
    }

    @Test
    fun mapFamilyInvite() {
        val invite = UserMappers.mapFamilyInvite(
            mapOf(
                "id" to "i1",
                "family_id" to "f1",
                "invite_code" to "LPY9Q1",
                "invited_as" to "아빠",
                "target_role" to "care_recipient",
                "claimed_by" to null,
                "claimed_at" to null,
                "reentry_user_id" to "u9",
            ),
        )
        assertEquals("LPY9Q1", invite.inviteCode)
        assertEquals(UserRole.CareRecipient, invite.targetRole)
        assertEquals("u9", invite.reentryUserId)
        assertNull(invite.claimedBy)
    }
}
