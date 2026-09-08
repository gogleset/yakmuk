package com.jinlabs.yakok.data

import com.jinlabs.yakok.core.time.Kst
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.datetime.Clock
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

@Serializable
data class AlertIdRow(val id: String)

data class StuckEscalateInfo(
    val runId: String,
    val pendingHash: String,
    val pendingCount: Int,
    val dateKst: String,
)

@Singleton
class FamilyAlertRepository @Inject constructor(
    private val supabase: SupabaseClient,
) {
    suspend fun upsertStuck(
        familyId: String,
        userId: String,
        message: String,
        info: StuckEscalateInfo,
    ) {
        upsert(familyId, userId, "stuck_escalate", message, buildJsonObject {
            put("runId", JsonPrimitive(info.runId))
            put("pendingHash", JsonPrimitive(info.pendingHash))
            put("pendingCount", JsonPrimitive(info.pendingCount))
            put("dateKst", JsonPrimitive(info.dateKst))
        })
    }

    suspend fun upsertBadCondition(
        familyId: String,
        userId: String,
        message: String,
        dateKst: String,
    ) {
        upsert(familyId, userId, "bad_condition", message, buildJsonObject {
            put("dateKst", JsonPrimitive(dateKst))
            put("condition", JsonPrimitive("BAD"))
        })
    }

    private suspend fun upsert(
        familyId: String,
        userId: String,
        kind: String,
        message: String,
        payload: kotlinx.serialization.json.JsonObject,
    ) {
        val since = "${Kst.todayDateString(Clock.System.now())}T00:00:00+09:00"
        val existing = supabase.from("family_alerts").select {
            filter {
                eq("family_id", familyId)
                eq("user_id", userId)
                eq("kind", kind)
                gte("created_at", since)
            }
        }.decodeList<AlertIdRow>()
        val open = existing // acked filter client-side would need acked_at; insert if none
        if (open.isNotEmpty()) {
            supabase.from("family_alerts").update(
                buildJsonObject {
                    put("message", JsonPrimitive(message))
                    put("payload", payload)
                },
            ) { filter { eq("id", open.first().id) } }
            return
        }
        supabase.from("family_alerts").insert(
            buildJsonObject {
                put("family_id", JsonPrimitive(familyId))
                put("user_id", JsonPrimitive(userId))
                put("kind", JsonPrimitive(kind))
                put("message", JsonPrimitive(message))
                put("payload", payload)
            },
        )
    }
}
