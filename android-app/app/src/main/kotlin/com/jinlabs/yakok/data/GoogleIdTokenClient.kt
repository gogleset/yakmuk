package com.jinlabs.yakok.data

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.jinlabs.yakok.BuildConfig
import com.jinlabs.yakok.core.copy.Errors
import javax.inject.Inject
import javax.inject.Singleton

class GoogleSignInCancelled : Exception()

@Singleton
class GoogleIdTokenClient @Inject constructor() {
    val webClientId: String = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()

    val isConfigured: Boolean get() = webClientId.isNotEmpty()

    suspend fun fetchIdToken(activity: Activity): String {
        if (!isConfigured) throw IllegalStateException(Errors.Auth.GoogleWebClientMissing)
        val option = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(webClientId)
            .setAutoSelectEnabled(false)
            .build()
        val request = GetCredentialRequest.Builder()
            .addCredentialOption(option)
            .build()
        return try {
            val result = CredentialManager.create(activity).getCredential(activity, request)
            GoogleIdTokenCredential.createFrom(result.credential.data).idToken
        } catch (_: GetCredentialCancellationException) {
            throw GoogleSignInCancelled()
        }
    }
}
