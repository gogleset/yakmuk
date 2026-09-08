package com.jinlabs.yakok.ui.auth

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.alarm.CareGlanceController
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.user.AppUser
import com.jinlabs.yakok.core.user.InvitePeek
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.core.user.StaleSession
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.GoogleIdTokenClient
import com.jinlabs.yakok.data.GoogleSignInCancelled
import com.jinlabs.yakok.push.PushTokenRegistrar
import dagger.hilt.android.lifecycle.HiltViewModel
import io.github.jan.supabase.auth.status.SessionStatus
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val bootstrapping: Boolean = true,
    val busy: Boolean = false,
    val sessionUserId: String? = null,
    val isAnonymous: Boolean = false,
    val profile: AppUser? = null,
    val error: String? = null,
    val forceSignOut: Boolean = false,
    val peek: InvitePeek? = null,
    val peekLoading: Boolean = false,
    val peekError: String? = null,
) {
    val hasFamily: Boolean get() = profile?.familyId != null
    val needsFamilySetup: Boolean
        get() = sessionUserId != null && !hasFamily && !isAnonymous
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repo: AuthRepository,
    private val google: GoogleIdTokenClient,
    private val glance: CareGlanceController,
    private val pushTokens: PushTokenRegistrar,
) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private var peekJob: Job? = null
    private var forceWatchJob: Job? = null
    private var watchingUserId: String? = null

    val googleConfigured: Boolean get() = google.isConfigured

    init {
        viewModelScope.launch {
            repo.sessionStatus.collect { status ->
                when (status) {
                    is SessionStatus.Authenticated, is SessionStatus.NotAuthenticated -> {
                        if (!_state.value.busy) refresh()
                    }
                    else -> Unit
                }
            }
        }
        viewModelScope.launch { refresh(initial = true) }
    }

    fun clearError() {
        _state.update { it.copy(error = null) }
    }

    fun ackForceSignOut() {
        viewModelScope.launch {
            runCatching { glance.cancel() }
            runCatching { pushTokens.clear() }
            runCatching { repo.signOut() }
            _state.update {
                it.copy(
                    forceSignOut = false,
                    profile = null,
                    sessionUserId = null,
                    isAnonymous = false,
                )
            }
            bindForceSignOutWatch(null)
        }
    }

    fun peekIfReady(code: String) {
        peekJob?.cancel()
        val trimmed = JoinCodes.normalize(code)
        if (!JoinCodes.isComplete(trimmed)) {
            _state.update { it.copy(peek = null, peekError = null, peekLoading = false) }
            return
        }
        peekJob = viewModelScope.launch {
            _state.update { it.copy(peekLoading = true, peekError = null) }
            runCatching { repo.peekInvite(trimmed) }
                .onSuccess { peek ->
                    _state.update { it.copy(peek = peek, peekLoading = false, peekError = null) }
                }
                .onFailure { e ->
                    _state.update {
                        it.copy(
                            peek = null,
                            peekLoading = false,
                            peekError = formatUserFacingError(e, Errors.Invite.PeekFailed),
                        )
                    }
                }
        }
    }

    fun signInGoogle(activity: Activity) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true, error = null) }
            runCatching { repo.signInGoogle(google.fetchIdToken(activity)) }
                .onFailure { e ->
                    if (e is GoogleSignInCancelled) {
                        _state.update { it.copy(busy = false) }
                        return@launch
                    }
                    fail(Errors.Auth.LoginFailed, e)
                }
            _state.update { it.copy(busy = false) }
            refresh()
        }
    }

    fun signInDev(email: String, password: String) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true, error = null) }
            runCatching { repo.signInDev(email.trim(), password) }
                .onFailure { fail(Errors.Auth.LoginFailed, it) }
            _state.update { it.copy(busy = false) }
            refresh()
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { glance.cancel() }
            runCatching { pushTokens.clear() }
            runCatching { repo.signOut() }
                .onFailure { fail(Errors.Auth.LogoutFailed, it) }
            _state.update {
                it.copy(
                    busy = false,
                    profile = null,
                    sessionUserId = null,
                    isAnonymous = false,
                    forceSignOut = false,
                )
            }
            bindForceSignOutWatch(null)
        }
    }

    fun createFamily(familyName: String, nickname: String) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true, error = null) }
            runCatching { repo.createFamily(familyName, nickname) }
                .onFailure { fail(Errors.Family.CreateFailed, it) }
            _state.update { it.copy(busy = false) }
            refresh()
        }
    }

    fun join(code: String, nickname: String?) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true, error = null) }
            runCatching { repo.joinWithCode(code, nickname) }
                .onFailure { fail(Errors.Invite.JoinFailed, it) }
            _state.update { it.copy(busy = false) }
            refresh()
        }
    }

    fun clearStaleAnonymous() {
        val s = _state.value
        if (s.bootstrapping || s.hasFamily) return
        if (s.sessionUserId == null || !s.isAnonymous) return
        signOut()
    }

    private suspend fun refresh(initial: Boolean = false) {
        try {
            val profile = repo.getProfile()
            val uid = repo.currentUserId()
            // 조인/가족생성 직후엔 users 행이 아직 없을 수 있음. stale JWT는 콜드스타트만 정리.
            if (initial &&
                StaleSession.shouldSignOut(
                    hasLocalSession = uid != null,
                    hasProfile = profile != null,
                    remoteUserExists = uid != null && profile != null,
                )
            ) {
                runCatching { repo.signOut() }
            }
            val nextProfile = repo.getProfile()
            val nextUid = repo.currentUserId()
            _state.update {
                it.copy(
                    bootstrapping = false,
                    sessionUserId = nextUid,
                    isAnonymous = repo.isAnonymous(),
                    profile = nextProfile,
                    forceSignOut = nextProfile?.forceSignOutAt != null || it.forceSignOut,
                )
            }
            bindForceSignOutWatch(nextUid)
            if (nextProfile?.familyId != null) pushTokens.sync()
        } catch (e: kotlinx.coroutines.CancellationException) {
            throw e
        } catch (e: Throwable) {
            _state.update { s ->
                s.copy(bootstrapping = false, profile = null)
            }
            if (!initial) fail(Errors.Auth.ProfileLoadFailed, e)
        }
    }

    private fun bindForceSignOutWatch(userId: String?) {
        if (watchingUserId == userId) return
        watchingUserId = userId
        forceWatchJob?.cancel()
        if (userId == null) return
        forceWatchJob = viewModelScope.launch {
            runCatching {
                repo.watchForceSignOut(userId).collect {
                    _state.update { it.copy(forceSignOut = true) }
                }
            }
        }
    }

    private fun fail(fallback: String, error: Throwable) {
        val msg = formatUserFacingError(error, fallback)
        _state.update { it.copy(busy = false, error = msg) }
        _messages.tryEmit(msg)
    }
}
