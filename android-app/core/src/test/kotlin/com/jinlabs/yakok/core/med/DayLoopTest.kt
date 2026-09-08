package com.jinlabs.yakok.core.med

import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue
import org.junit.jupiter.api.Test

class DayLoopTest {
    @Test
    fun hashPending_sorts() {
        assertEquals("1,2,9", DayLoop.hashPending(listOf(9, 1, 2)))
        assertEquals("", DayLoop.hashPending(emptyList()))
    }

    @Test
    fun stuck_sameHashThrice() {
        assertTrue(DayLoop.isStuck(listOf("1,2", "1,2", "1,2"), "1,2"))
        assertFalse(DayLoop.isStuck(listOf("1,2", "1,2"), "1,2"))
        assertFalse(DayLoop.isStuck(listOf("", "", ""), ""))
    }

    @Test
    fun verify_successWhenAllTakenAndCondition() {
        val r = VerifyDay.evaluate(listOf(1, 2), setOf(1, 2), 1)
        assertEquals(VerifyStatus.Success, r.status)
        assertEquals(0, r.pendingMeds)
    }

    @Test
    fun verify_continueIfPendingOrNoCondition() {
        assertEquals(VerifyStatus.Continue, VerifyDay.evaluate(listOf(1), setOf(1), 0).status)
        assertEquals(1, VerifyDay.evaluate(listOf(1, 2), setOf(1), 1).pendingMeds)
    }

    @Test
    fun decide_boundAndStuck() {
        val cont = VerifyDayResult(VerifyStatus.Continue, 1, 0)
        val bound = DayLoop.decide(cont, 1, 10, 100, 50, emptyList(), "1")
        assertTrue(bound is DayLoopOutcome.Bound)

        val stuck = DayLoop.decide(
            cont,
            3,
            10,
            0,
            86_400_000,
            listOf("1", "1", "1"),
            "1",
        )
        assertTrue(stuck is DayLoopOutcome.Finish)
        assertEquals(RunStatus.StuckEscalate, (stuck as DayLoopOutcome.Finish).status)

        val ok = VerifyDayResult(VerifyStatus.Success, 0, 1)
        val done = DayLoop.decide(ok, 1, 10, 0, 86_400_000, emptyList(), "")
        assertEquals(RunStatus.Success, (done as DayLoopOutcome.Finish).status)
    }

    @Test
    fun scheduledIds_dailyAndMask() {
        val ids = VerifyDay.scheduledIds(listOf(1L to "daily", 2L to "0", 3L to "2"), 0)
        assertEquals(listOf(1L, 2L), ids)
    }
}
