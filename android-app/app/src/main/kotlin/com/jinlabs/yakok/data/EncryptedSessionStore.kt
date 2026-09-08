package com.jinlabs.yakok.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/** 세션 JSON. RN AsyncStorage 평문 대신 EncryptedSharedPreferences. */
@Singleton
class EncryptedSessionStore @Inject constructor(
    @ApplicationContext context: Context,
) {
    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        FILE,
        MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    fun read(): String? = prefs.getString(KEY, null)

    fun write(json: String) {
        prefs.edit().putString(KEY, json).apply()
    }

    fun clear() {
        prefs.edit().remove(KEY).apply()
    }

    companion object {
        const val FILE = "yakmuk.session"
        private const val KEY = "session_json"
    }
}
