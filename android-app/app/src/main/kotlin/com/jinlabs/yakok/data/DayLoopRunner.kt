package com.jinlabs.yakok.data

import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.DayLoop
import com.jinlabs.yakok.core.med.DaysMask
import com.jinlabs.yakok.core.med.LoopTrigger
import com.jinlabs.yakok.core.med.RunStatus
import com.jinlabs.yakok.core.med.VerifyDay
import com.jinlabs.yakok.core.med.VerifyStatus
import com.jinlabs.yakok.core.time.Kst
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject

@Singleton
class DayLoopRunner @Inject constructor(
    private val store: SupabaseLoopStore,
    private val meds: MedicationRepository,
    private val alerts: FamilyAlertRepository,
    private val carePush: CarePushClient,
) {
    suspend fun step(
        userId: String,
        familyId: String,
        trigger: LoopTrigger,
        pendingMedicationIds: List<Long>,
        plan: JsonObject,
        result: JsonObject,
        dateKst: String = Kst.todayDateString(Clock.System.now()),
    ) {
        val maxWall = Kst.msUntilDayEnd(Clock.System.now())
        val run = store.getOpenRunForDay(userId, dateKst)
            ?: store.openRun(userId, dateKst, trigger, DayLoop.MaxIterations, maxWall)

        val elapsed = runCatching {
            Clock.System.now() - Instant.parse(run.createdAt)
        }.getOrNull()?.inWholeMilliseconds ?: 0L
        if (run.maxWallClockMs > 0 && elapsed > run.maxWallClockMs) {
            store.finishRun(run.id, RunStatus.FailedBound, "wall_clock")
            return
        }

        val nextTurn = store.countTurns(run.id) + 1
        if (nextTurn > run.maxIterations) {
            store.finishRun(run.id, RunStatus.FailedBound, "max_iterations")
            return
        }

        val weekday = Kst.weekdayMon0(dateKst)
        val scheduled = meds.listActive(userId)
            .filter { DaysMask.isScheduledOnWeekday(it.daysMask, weekday) }
            .map { it.id }
        val taken = meds.listTodayTaken(userId, dateKst)
        val conditions = meds.conditionCount(userId, dateKst)
        val verify = VerifyDay.evaluate(scheduled, taken, conditions)
        val pendingHash = DayLoop.hashPending(pendingMedicationIds)

        val observe = buildJsonObject {
            put("pendingHash", JsonPrimitive(pendingHash))
            put(
                "pendingMedicationIds",
                buildJsonArray { pendingMedicationIds.forEach { add(it) } },
            )
        }
        store.appendTurn(run.id, nextTurn, plan, result, observe, verify.status)

        when (verify.status) {
            VerifyStatus.Success -> {
                store.finishRun(run.id, RunStatus.Success, "day_complete")
                return
            }
            VerifyStatus.FailedVerify -> {
                store.finishRun(run.id, RunStatus.FailedVerify, "verify_failed")
                return
            }
            VerifyStatus.Continue -> Unit
        }

        val hashes = store.listRecentObserveHashes(run.id, DayLoop.StuckThreshold)
        if (DayLoop.isStuck(hashes, pendingHash)) {
            store.finishRun(run.id, RunStatus.StuckEscalate, "same_observe_hash")
            alerts.upsertStuck(
                familyId,
                userId,
                Copy.Alert.MedCheckStalled,
                StuckEscalateInfo(run.id, pendingHash, pendingMedicationIds.size, dateKst),
            )
            carePush.notifyStuck(familyId, userId, dateKst)
        }
    }
}
