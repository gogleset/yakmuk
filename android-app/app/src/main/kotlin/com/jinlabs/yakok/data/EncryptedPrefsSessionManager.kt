package com.jinlabs.yakok.data

import io.github.jan.supabase.auth.SessionManager
import io.github.jan.supabase.auth.user.UserSession
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class EncryptedPrefsSessionManager(
    private val store: EncryptedSessionStore,
) : SessionManager {
    private val json = Json {
        encodeDefaults = true
        ignoreUnknownKeys = true
    }

    override suspend fun saveSession(session: UserSession) {
        store.write(json.encodeToString(session))
    }

    override suspend fun loadSession(): UserSession? {
        val raw = store.read() ?: return null
        return runCatching { json.decodeFromString<UserSession>(raw) }.getOrNull()
    }

    override suspend fun deleteSession() {
        store.clear()
    }
}
