package com.jinlabs.yakok.data

import com.jinlabs.yakok.core.med.DayLoop
import com.jinlabs.yakok.core.med.LoopRun
import com.jinlabs.yakok.core.med.LoopTrigger
import com.jinlabs.yakok.core.med.RunStatus
import com.jinlabs.yakok.core.med.VerifyStatus
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

@Serializable
data class RunRow(
    val id: String,
    val goal: String,
    val status: String,
    val trigger: String,
    @SerialName("owner_user_id") val ownerUserId: String? = null,
    @SerialName("goal_date") val goalDate: String? = null,
    @SerialName("max_iterations") val maxIterations: Int? = null,
    @SerialName("max_wall_clock_ms") val maxWallClockMs: Long? = null,
    @SerialName("created_at") val createdAt: String,
    @SerialName("ended_at") val endedAt: String? = null,
    @SerialName("ended_reason") val endedReason: String? = null,
)

@Serializable
data class ObserveRow(@SerialName("observe_json") val observeJson: JsonElement? = null)

@Singleton
class SupabaseLoopStore @Inject constructor(
    private val supabase: SupabaseClient,
) {
    suspend fun openRun(
        ownerUserId: String,
        goalDate: String,
        trigger: LoopTrigger,
        maxIterations: Int,
        maxWallClockMs: Long,
    ): LoopRun {
        val row = supabase.from("runs").insert(
            buildJsonObject {
                put("goal", kotlinx.serialization.json.JsonPrimitive("verify_day:$ownerUserId:$goalDate"))
                put("status", kotlinx.serialization.json.JsonPrimitive("running"))
                put("trigger", kotlinx.serialization.json.JsonPrimitive(DayLoop.triggerWire(trigger)))
                put("owner_user_id", kotlinx.serialization.json.JsonPrimitive(ownerUserId))
                put("goal_date", kotlinx.serialization.json.JsonPrimitive(goalDate))
                put("max_iterations", kotlinx.serialization.json.JsonPrimitive(maxIterations))
                put("max_wall_clock_ms", kotlinx.serialization.json.JsonPrimitive(maxWallClockMs))
            },
        ) { select() }.decodeSingle<RunRow>()
        return row.toLoopRun()
    }

    suspend fun getOpenRunForDay(ownerUserId: String, goalDate: String): LoopRun? =
        supabase.from("runs").select {
            filter {
                eq("owner_user_id", ownerUserId)
                eq("goal_date", goalDate)
                eq("status", "running")
            }
            order("created_at", Order.DESCENDING)
            limit(1)
        }.decodeList<RunRow>().firstOrNull()?.toLoopRun()

    suspend fun appendTurn(
        runId: String,
        turn: Int,
        plan: JsonObject,
        result: JsonObject,
        observe: JsonObject,
        verifyStatus: VerifyStatus,
    ) {
        supabase.from("turns").insert(
            buildJsonObject {
                put("run_id", kotlinx.serialization.json.JsonPrimitive(runId))
                put("turn", kotlinx.serialization.json.JsonPrimitive(turn))
                put("plan_json", plan)
                put("result_json", result)
                put("observe_json", observe)
                put("verify_status", kotlinx.serialization.json.JsonPrimitive(verifyStatus.name.lowercase().let {
                    when (verifyStatus) {
                        VerifyStatus.Success -> "success"
                        VerifyStatus.Continue -> "continue"
                        VerifyStatus.FailedVerify -> "failed_verify"
                    }
                }))
            },
        )
    }

    suspend fun finishRun(runId: String, status: RunStatus, endedReason: String) {
        supabase.from("runs").update(
            buildJsonObject {
                put("status", kotlinx.serialization.json.JsonPrimitive(DayLoop.statusWire(status)))
                put("ended_reason", kotlinx.serialization.json.JsonPrimitive(endedReason))
                put("ended_at", kotlinx.serialization.json.JsonPrimitive(kotlinx.datetime.Clock.System.now().toString()))
            },
        ) { filter { eq("id", runId) } }
    }

    suspend fun countTurns(runId: String): Int =
        supabase.from("turns").select {
            filter { eq("run_id", runId) }
        }.decodeList<ObserveRow>().size

    suspend fun listRecentObserveHashes(runId: String, limit: Int): List<String> =
        supabase.from("turns").select {
            filter { eq("run_id", runId) }
            order("turn", Order.DESCENDING)
            limit(limit.toLong())
        }.decodeList<ObserveRow>().map { row ->
            val obj = row.observeJson as? JsonObject ?: row.observeJson?.jsonObject
            obj?.get("pendingHash")?.jsonPrimitive?.contentOrNull.orEmpty()
        }
}

fun RunRow.toLoopRun(): LoopRun = LoopRun(
    id = id,
    goal = goal,
    status = DayLoop.statusFromWire(status),
    trigger = DayLoop.triggerFromWire(trigger),
    ownerUserId = ownerUserId.orEmpty(),
    goalDate = goalDate.orEmpty(),
    maxIterations = maxIterations ?: DayLoop.MaxIterations,
    maxWallClockMs = maxWallClockMs ?: 0L,
    createdAt = createdAt,
    endedAt = endedAt,
    endedReason = endedReason,
)
