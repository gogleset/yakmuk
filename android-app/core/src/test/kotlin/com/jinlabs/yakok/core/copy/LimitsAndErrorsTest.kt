package com.jinlabs.yakok.core.copy

import com.jinlabs.yakok.core.constants.Limits
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class LimitsAndErrorsTest {
    @Test
    fun maxFamilyInvites_is6() {
        assertEquals(6, Limits.MaxFamilyInvites)
        assertTrue(Errors.Invite.LimitReached.contains("6"))
    }

    @Test
    fun inviteAlreadyClaimed_mapsBackendKey() {
        assertEquals(
            Errors.Invite.AlreadyClaimed,
            BackendErrorMessages["invite already claimed"],
        )
        assertTrue(Errors.Invite.AlreadyClaimed.contains("새 초대장"))
    }

    @Test
    fun cannotRecoverLeader_maps() {
        assertEquals(
            Errors.Recovery.CannotRecoverLeader,
            BackendErrorMessages["cannot recover family leader"],
        )
    }

    @Test
    fun format_backendKey() {
        assertEquals(Errors.Auth.Required, formatUserFacingError("not authenticated"))
    }

    @Test
    fun format_inviteLimitPattern() {
        assertEquals(Errors.Invite.LimitReached, formatUserFacingError("invite limit reached"))
    }

    @Test
    fun format_sqlDump_fallback() {
        assertEquals(
            Errors.Fallback,
            formatUserFacingError("insert or update on table \"users\" violates"),
        )
    }

    @Test
    fun format_empty_fallback() {
        assertEquals(Errors.Fallback, formatUserFacingError(null))
    }

    @Test
    fun format_passthroughUnknownKorean() {
        assertEquals("잠깐만요", formatUserFacingError("잠깐만요"))
    }
}
