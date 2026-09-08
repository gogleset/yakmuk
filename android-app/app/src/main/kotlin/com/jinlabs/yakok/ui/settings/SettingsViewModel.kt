package com.jinlabs.yakok.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.BuildConfig
import com.jinlabs.yakok.alarm.AlarmPermissions
import com.jinlabs.yakok.alarm.CareGlanceController
import com.jinlabs.yakok.alarm.ExactAlarmStatus
import com.jinlabs.yakok.alarm.FsiStatus
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.RoleLabels
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.family.Glance
import com.jinlabs.yakok.core.prefs.StartTab
import com.jinlabs.yakok.core.prefs.StartTabs
import com.jinlabs.yakok.core.user.UserRole
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.FamilyRepository
import com.jinlabs.yakok.data.PrefsRepository
import com.jinlabs.yakok.push.PushTokenRegistrar
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SettingsUiState(
    val loading: Boolean = true,
    val nickname: String = "",
    val role: UserRole? = null,
    val familyId: String? = null,
    val familyName: String? = null,
    val notifGranted: Boolean = false,
    val fsiAllowed: Boolean = false,
    val fsiUnsupported: Boolean = true,
    val exactAlarmDisabled: Boolean = false,
    val careGlanceOn: Boolean = true,
    val weeklyOn: Boolean = true,
    val showCareOpts: Boolean = false,
    val startTab: StartTab = StartTabs.Default,
    val motionEnabled: Boolean = true,
    val version: String = BuildConfig.VERSION_NAME,
    val busy: Boolean = false,
) {
    val roleLabel: String? get() = role?.let { RoleLabels.label(it) }
    val isLeader: Boolean get() = role == UserRole.FamilyLeader
    val familyLine: String
        get() {
            val name = familyName?.trim()?.takeIf { it.isNotEmpty() }
            return when {
                name != null -> name
                familyId != null -> Copy.Settings.FamilyConnected
                else -> Copy.Settings.FamilyMissing
            }
        }
    val withdrawBody: String
        get() = if (isLeader) Copy.Settings.WithdrawLeader else Copy.Settings.WithdrawMember
}

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val auth: AuthRepository,
    private val family: FamilyRepository,
    private val prefs: PrefsRepository,
    private val permissions: AlarmPermissions,
    private val glance: CareGlanceController,
    private val pushTokens: PushTokenRegistrar,
) : ViewModel() {

    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private val _needExactAlarm = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val needExactAlarm: SharedFlow<Unit> = _needExactAlarm.asSharedFlow()

    private var exactAlarmPrompted = false

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch { load() }
    }

    fun saveNickname(nickname: String) {
        val trimmed = nickname.trim()
        if (trimmed.isEmpty() || trimmed == _state.value.nickname) return
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { auth.updateNickname(trimmed) }
                .onSuccess { user ->
                    _state.update { it.copy(nickname = user.nickname, busy = false) }
                }
                .onFailure { fail(Errors.Family.NicknameChangeFailed, it) }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { glance.cancel() }
            runCatching { pushTokens.clear() }
            runCatching { auth.signOut() }
                .onFailure { fail(Errors.Auth.LogoutFailed, it) }
            _state.update { it.copy(busy = false) }
        }
    }

    fun withdraw() {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { glance.cancel() }
            runCatching { pushTokens.clear() }
            runCatching { auth.withdraw() }
                .onFailure { fail(Errors.Auth.WithdrawFailed, it) }
            _state.update { it.copy(busy = false) }
        }
    }

    fun onNotifGranted(granted: Boolean) {
        _state.update { it.copy(notifGranted = granted) }
        if (granted && !exactAlarmPrompted && permissions.exactAlarmStatus() == ExactAlarmStatus.Disabled) {
            exactAlarmPrompted = true
            _needExactAlarm.tryEmit(Unit)
        }
        refreshPermissions()
        if (granted) pushTokens.sync()
    }

    fun setCareGlance(enabled: Boolean) {
        viewModelScope.launch {
            if (enabled && !permissions.hasPostNotifications()) {
                _state.update { it.copy(careGlanceOn = false) }
                prefs.setCareGlanceOpt(false)
                _messages.tryEmit(Copy.Glance.PermissionHint)
                return@launch
            }
            prefs.setCareGlanceOpt(enabled)
            _state.update { it.copy(careGlanceOn = enabled) }
            if (enabled) glance.syncForCurrentUser() else glance.cancel()
        }
    }

    fun setWeekly(enabled: Boolean) {
        viewModelScope.launch {
            prefs.setWeeklyDigestOpt(enabled)
            _state.update { it.copy(weeklyOn = enabled) }
        }
    }

    fun setStartTab(tab: StartTab) {
        viewModelScope.launch {
            prefs.setStartTab(tab)
            _state.update { it.copy(startTab = tab) }
        }
    }

    fun setMotion(enabled: Boolean) {
        viewModelScope.launch {
            prefs.setMotionEnabled(enabled)
            _state.update { it.copy(motionEnabled = enabled) }
        }
    }

    fun refreshPermissions() {
        val fsi = permissions.fsiStatus()
        _state.update {
            it.copy(
                notifGranted = permissions.hasPostNotifications(),
                fsiAllowed = fsi == FsiStatus.Allowed,
                fsiUnsupported = fsi == FsiStatus.Unsupported,
                exactAlarmDisabled = permissions.exactAlarmStatus() == ExactAlarmStatus.Disabled,
            )
        }
    }

    fun notificationSettingsIntent() = permissions.notificationSettingsIntent()
    fun exactAlarmSettingsIntent() = permissions.exactAlarmSettingsIntent()
    fun fsiSettingsIntent() = permissions.fsiSettingsIntent()

    private suspend fun load() {
        val profile = auth.getProfile()
        if (profile == null) {
            _state.update { it.copy(loading = false) }
            return
        }
        val info = profile.familyId?.let { runCatching { family.getFamily(it) }.getOrNull() }
        refreshPermissions()
        _state.update {
            it.copy(
                loading = false,
                nickname = profile.nickname,
                role = profile.role,
                familyId = profile.familyId,
                familyName = info?.name,
                careGlanceOn = prefs.isCareGlanceOpt(),
                weeklyOn = prefs.isWeeklyDigestOpt(),
                showCareOpts = Glance.isViewer(profile.role),
                startTab = prefs.getStartTab(),
                motionEnabled = prefs.isMotionEnabled(),
                version = BuildConfig.VERSION_NAME,
            )
        }
    }

    private fun fail(fallback: String, error: Throwable) {
        val msg = formatUserFacingError(error, fallback)
        _state.update { it.copy(busy = false) }
        _messages.tryEmit(msg)
    }
}
