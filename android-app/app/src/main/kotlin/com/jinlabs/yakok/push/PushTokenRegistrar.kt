package com.jinlabs.yakok.push

import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import com.jinlabs.yakok.alarm.AlarmPermissions
import com.jinlabs.yakok.data.AuthRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import android.content.Context
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@Singleton
class PushTokenRegistrar @Inject constructor(
    @ApplicationContext private val context: Context,
    private val auth: AuthRepository,
    private val permissions: AlarmPermissions,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    fun sync() {
        scope.launch { runCatching { register() } }
    }

    fun syncWithToken(token: String) {
        scope.launch {
            runCatching {
                if (token.isBlank()) return@launch
                if (auth.currentUserId() == null) return@launch
                if (auth.getProfile()?.familyId == null) return@launch
                if (!permissions.hasPostNotifications()) return@launch
                auth.updatePushToken(token)
                Log.d(TAG, "registered prefix=${token.take(18)}")
            }.onFailure { e ->
                Log.d(TAG, "register failed ${e.message}")
            }
        }
    }

    suspend fun register() {
        if (FirebaseApp.getApps(context).isEmpty()) {
            Log.d(TAG, "skip no firebase")
            return
        }
        if (!permissions.hasPostNotifications()) {
            Log.d(TAG, "skip permission-denied")
            return
        }
        val profile = auth.getProfile()
        if (profile?.familyId == null) {
            Log.d(TAG, "skip no family")
            return
        }
        val token = FirebaseMessaging.getInstance().token.await()
        if (token.isBlank()) {
            Log.d(TAG, "skip empty-token")
            return
        }
        auth.updatePushToken(token)
        Log.d(TAG, "registered prefix=${token.take(18)}")
    }

    suspend fun clear() {
        runCatching { auth.updatePushToken(null) }
            .onFailure { Log.d(TAG, "clear failed ${it.message}") }
        Log.d(TAG, "cleared")
    }

    companion object {
        private const val TAG = "yakmuk:push"
    }
}
