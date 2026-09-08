package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.copy.Copy
import kotlin.test.assertEquals
import org.junit.jupiter.api.Test

class FamilyMappersTest {
    @Test
    fun mapAlert_withUsersEmbed() {
        val alert = FamilyMappers.mapFamilyAlert(
            mapOf(
                "id" to "a1",
                "family_id" to "f1",
                "user_id" to "u1",
                "kind" to "stuck_escalate",
                "message" to "멈춤",
                "created_at" to "2026-08-01T00:00:00Z",
                "acked_at" to null,
                "users" to mapOf("nickname" to "아빠"),
            ),
        )
        assertEquals(FamilyAlertKind.StuckEscalate, alert.kind)
        assertEquals("아빠", alert.nickname)
        val slide = CareAlerts.toSlides(listOf(alert)).first()
        assertEquals(Copy.Family.careStuckTitle("아빠"), slide.title)
        assertEquals("멈춤", slide.body)
    }

    @Test
    fun mapFeedDayRead_trimsDate() {
        val read = FamilyMappers.mapFamilyFeedDayRead(
            mapOf(
                "family_id" to "f1",
                "user_id" to "u1",
                "log_date" to "2026-08-10T00:00:00+09:00",
                "read_at" to "2026-08-10T12:00:00Z",
            ),
        )
        assertEquals("2026-08-10", read.logDate)
    }

    @Test
    fun mapMember_idOrUserId() {
        val a = FamilyMappers.mapFamilyMember(
            mapOf("id" to "u1", "nickname" to "엄마", "invited_as" to "엄마", "role" to "guardian"),
        )
        assertEquals("u1", a.userId)
        val b = FamilyMappers.mapFamilyMember(
            mapOf("user_id" to "u2", "nickname" to "아빠", "role" to "care_recipient"),
        )
        assertEquals("u2", b.userId)
    }
}
