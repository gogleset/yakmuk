package com.jinlabs.yakok.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.BuildConfig
import com.jinlabs.yakok.alarm.AlarmClockScheduler
import com.jinlabs.yakok.alarm.AlarmPermissions
import com.jinlabs.yakok.alarm.AlarmReconciler
import com.jinlabs.yakok.alarm.ExactAlarmStatus
import com.jinlabs.yakok.alarm.FsiStatus
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.Discomfort
import com.jinlabs.yakok.data.PrefsRepository
import com.jinlabs.yakok.local.LocalMedStore
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
    val discomfort: Discomfort? = null,
    val notifGranted: Boolean = false,
    val fsiAllowed: Boolean = false,
    val fsiUnsupported: Boolean = true,
    val exactAlarmDisabled: Boolean = false,
    val motionEnabled: Boolean = true,
    val version: String = BuildConfig.VERSION_NAME,
    val privacyUrl: String = BuildConfig.PRIVACY_POLICY_URL,
    val wiped: Boolean = false,
    val busy: Boolean = false,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val store: LocalMedStore,
    private val prefs: PrefsRepository,
    private val permissions: AlarmPermissions,
    private val reconciler: AlarmReconciler,
    private val scheduler: AlarmClockScheduler,
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

    fun onNotifGranted(granted: Boolean) {
        _state.update { it.copy(notifGranted = granted) }
        if (granted && !exactAlarmPrompted && permissions.exactAlarmStatus() == ExactAlarmStatus.Disabled) {
            exactAlarmPrompted = true
            _needExactAlarm.tryEmit(Unit)
        }
        refreshPermissions()
        if (granted) viewModelScope.launch { reconciler.reconcile() }
    }

    fun setMotion(enabled: Boolean) {
        viewModelScope.launch {
            prefs.setMotionEnabled(enabled)
            _state.update { it.copy(motionEnabled = enabled) }
        }
    }

    fun setDiscomfort(value: Discomfort?) {
        viewModelScope.launch {
            store.setDiscomfort(value)
            _state.update { it.copy(discomfort = value) }
        }
    }

    fun privacyTapped(): String? {
        val url = _state.value.privacyUrl.trim()
        if (url.isEmpty()) {
            _messages.tryEmit(Copy.Settings.PrivacySoon)
            return null
        }
        return url
    }

    fun wipe() {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching {
                store.clearAll()
                scheduler.cancelAll()
            }.onSuccess {
                _state.update { it.copy(busy = false, wiped = true) }
            }.onFailure {
                _state.update { it.copy(busy = false) }
                _messages.tryEmit(formatUserFacingError(it, Copy.Settings.Wipe))
            }
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
        val profile = store.getProfile()
        refreshPermissions()
        _state.update {
            it.copy(
                loading = false,
                discomfort = profile.discomfort,
                motionEnabled = prefs.isMotionEnabled(),
                version = BuildConfig.VERSION_NAME,
                privacyUrl = BuildConfig.PRIVACY_POLICY_URL,
            )
        }
    }
}
