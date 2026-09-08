package com.jinlabs.yakok.data

import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.user.AppUser
import com.jinlabs.yakok.core.user.InvitePeek
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.core.user.UserMappers
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.providers.builtin.IDToken
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import io.github.jan.supabase.postgrest.result.PostgrestResult
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresChangeFlow
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

@Serializable
data class UserRow(
    val id: String,
    val nickname: String,
    @SerialName("invited_as") val invitedAs: String? = null,
    val role: String,
    @SerialName("family_id") val familyId: String? = null,
    @SerialName("push_token") val pushToken: String? = null,
    @SerialName("force_sign_out_at") val forceSignOutAt: String? = null,
)

@Singleton
class AuthRepository @Inject constructor(
    private val supabase: SupabaseClient,
) {
    val sessionStatus get() = supabase.auth.sessionStatus

    fun currentUserId(): String? = supabase.auth.currentUserOrNull()?.id

    fun isAnonymous(): Boolean {
        val identities = supabase.auth.currentUserOrNull()?.identities.orEmpty()
        if (identities.isEmpty()) {
            return supabase.auth.currentUserOrNull()?.email.isNullOrBlank()
        }
        return identities.all { it.provider == "anonymous" }
    }

    suspend fun getProfile(): AppUser? {
        val uid = currentUserId() ?: return null
        val row = supabase.from("users").select {
            filter {
                eq("id", uid)
            }
        }.decodeSingleOrNull<UserRow>() ?: return null
        return row.toAppUser()
    }

    suspend fun updatePushToken(token: String?) {
        val uid = currentUserId() ?: return
        supabase.from("users").update(
            buildJsonObject {
                put("push_token", token?.trim()?.takeIf { it.isNotEmpty() }?.let { JsonPrimitive(it) } ?: JsonNull)
            },
        ) { filter { eq("id", uid) } }
    }

    suspend fun signInGoogle(idToken: String) {
        supabase.auth.signInWith(IDToken) {
            this.idToken = idToken
            provider = Google
        }
    }

    suspend fun signInDev(email: String, password: String) {
        runCatching {
            supabase.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
        }
        supabase.auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
    }

    suspend fun signOut() {
        supabase.auth.signOut()
    }

    suspend fun updateNickname(nickname: String): AppUser {
        val trimmed = nickname.trim()
        if (trimmed.isEmpty()) throw IllegalStateException(Errors.Family.NicknameRequired)
        val params = buildJsonObject { put("p_nickname", JsonPrimitive(trimmed)) }
        runCatching {
            supabase.postgrest.rpc("update_my_nickname", params)
        }.onFailure { throw wrap(it, Errors.Family.NicknameChangeFailed) }
        return getProfile() ?: throw IllegalStateException(Errors.Auth.ProfileNotFound)
    }

    suspend fun withdraw() {
        runCatching {
            supabase.postgrest.rpc("withdraw_my_account")
        }.onFailure { throw wrap(it, Errors.Auth.WithdrawFailed) }
        runCatching { supabase.auth.signOut() }
    }

    suspend fun createFamily(familyName: String, nickname: String) {
        val name = familyName.trim()
        if (name.isEmpty()) throw IllegalStateException(Errors.Family.NameRequired)
        if (currentUserId() == null) throw IllegalStateException(Errors.Auth.Required)
        val params = buildJsonObject {
            put("p_family_name", JsonPrimitive(name))
            put("p_nickname", JsonPrimitive(nickname.trim().ifEmpty { "가족장" }))
        }
        runCatching {
            supabase.postgrest.rpc("create_family_as_leader", params)
        }.onFailure { throw wrap(it, Errors.Family.CreateFailed) }
    }

    suspend fun peekInvite(code: String): InvitePeek {
        val trimmed = JoinCodes.normalize(code)
        if (!JoinCodes.isComplete(trimmed)) {
            throw IllegalStateException(Errors.Invite.CodeLength)
        }
        val params = buildJsonObject { put("p_code", JsonPrimitive(trimmed)) }
        val result = runCatching {
            supabase.postgrest.rpc("peek_join_code", params)
        }.getOrElse { throw wrap(it, Errors.Invite.PeekFailed) }
        val obj = result.decodeObject()
            ?: throw IllegalStateException(Errors.Invite.PeekFailed)
        return UserMappers.parseInvitePeek(obj.toPlainMap())
    }

    suspend fun joinWithCode(code: String, nickname: String?): AppUser {
        val trimmed = JoinCodes.normalize(code)
        if (!JoinCodes.isComplete(trimmed)) {
            throw IllegalStateException(Errors.Invite.CodeLength)
        }
        if (currentUserId() == null) {
            supabase.auth.signInAnonymously()
        }
        val params = buildJsonObject {
            put("p_code", JsonPrimitive(trimmed))
            put(
                "p_nickname",
                nickname?.trim()?.takeIf { it.isNotEmpty() }?.let { JsonPrimitive(it) } ?: JsonNull,
            )
        }
        val result = runCatching {
            supabase.postgrest.rpc("claim_join_code", params)
        }.getOrElse { throw wrap(it, Errors.Invite.JoinFailed) }
        val obj = result.decodeObject()
            ?: throw IllegalStateException(Errors.Invite.JoinFailed)
        return UserMappers.mapUser(obj.toPlainMap())
    }

    fun watchForceSignOut(userId: String): Flow<Unit> = channelFlow {
        val channel = supabase.channel("force-sign-out:$userId")
        val changes = channel.postgresChangeFlow<PostgresAction.Update>(schema = "public") {
            table = "users"
            filter("id", FilterOperator.EQ, userId)
        }
        val job = launch {
            changes.collect { action ->
                val raw = action.record["force_sign_out_at"]
                if (raw != null && raw !is JsonNull) send(Unit)
            }
        }
        try {
            channel.subscribe()
            awaitCancellation()
        } finally {
            job.cancel()
            runCatching { channel.unsubscribe() }
        }
    }

    private fun wrap(error: Throwable, fallback: String): Throwable =
        IllegalStateException(formatUserFacingError(error, fallback), error)
}

internal fun PostgrestResult.decodeObject(): JsonObject? =
    decodeAsOrNull<JsonObject>() ?: decodeSingleOrNull<JsonObject>()

fun UserRow.toAppUser(): AppUser = UserMappers.mapUser(
    mapOf(
        "id" to id,
        "nickname" to nickname,
        "invited_as" to invitedAs,
        "role" to role,
        "family_id" to familyId,
        "push_token" to pushToken,
        "force_sign_out_at" to forceSignOutAt,
    ),
)

fun JsonObject.toPlainMap(): Map<String, Any?> =
    entries.associate { (k, v) -> k to v.toPlain() }

private fun JsonElement.toPlain(): Any? = when (this) {
    is JsonNull -> null
    is JsonPrimitive -> content
    is JsonArray -> map { it.toPlain() }
    is JsonObject -> toPlainMap()
}
