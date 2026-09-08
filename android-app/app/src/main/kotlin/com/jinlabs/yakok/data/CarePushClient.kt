package com.jinlabs.yakok.data

import android.util.Log
import com.jinlabs.yakok.core.family.CarePushCopy
import com.jinlabs.yakok.core.family.CarePushKind
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.functions.functions
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CarePushRequest(
    val kind: String,
    @SerialName("family_id") val familyId: String,
    @SerialName("actor_user_id") val actorUserId: String,
    val title: String,
    val body: String,
    val data: Map<String, String> = emptyMap(),
)

/** Edge care-push. 실패해도 throw 안 함 — 체크/stuck DB 우선. */
@Singleton
class CarePushClient @Inject constructor(
    private val supabase: SupabaseClient,
    private val auth: AuthRepository,
) {
    suspend fun notifyTaken(familyId: String, actorUserId: String, medicationId: Long? = null) {
        val extra = if (medicationId != null) mapOf("medication_id" to medicationId.toString()) else emptyMap()
        invoke(CarePushKind.Taken, familyId, actorUserId, extra)
    }

    suspend fun notifyStuck(familyId: String, actorUserId: String, dateKst: String? = null) {
        val extra = if (dateKst != null) mapOf("date_kst" to dateKst) else emptyMap()
        invoke(CarePushKind.StuckEscalate, familyId, actorUserId, extra)
    }

    private suspend fun invoke(
        kind: CarePushKind,
        familyId: String,
        actorUserId: String,
        data: Map<String, String>,
    ) {
        val fid = familyId.trim()
        val aid = actorUserId.trim()
        if (fid.isEmpty() || aid.isEmpty()) {
            Log.d(TAG, "care-push skip invalid-input")
            return
        }
        val copy = CarePushCopy.build(kind, runCatching { auth.getProfile()?.nickname }.getOrNull())
        runCatching {
            supabase.functions.invoke(
                function = "care-push",
                body = CarePushRequest(
                    kind = kind.wire,
                    familyId = fid,
                    actorUserId = aid,
                    title = copy.title,
                    body = copy.body,
                    data = data,
                ),
            )
            Log.d(TAG, "care-push ok kind=${kind.wire}")
        }.onFailure { e ->
            Log.d(TAG, "care-push failed ${e.message}")
        }
    }

    companion object {
        private const val TAG = "yakmuk:push"
    }
}
