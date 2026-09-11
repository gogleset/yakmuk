package com.jinlabs.yakok.ui.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.alarm.AlarmPermissions
import com.jinlabs.yakok.alarm.AlarmReconciler
import com.jinlabs.yakok.alarm.ExactAlarmStatus
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.DaysMask
import com.jinlabs.yakok.core.med.DaysMode
import com.jinlabs.yakok.core.med.Discomfort
import com.jinlabs.yakok.core.med.MedPurpose
import com.jinlabs.yakok.core.med.MedicationMetaInput
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

enum class OnboardingStep {
    HasMed,
    Name,
    Schedule,
    Purpose,
    Discomfort,
    Permission,
}

data class OnboardingUiState(
    val step: OnboardingStep = OnboardingStep.HasMed,
    val addingMed: Boolean = true,
    val name: String = "",
    val time: String = com.jinlabs.yakok.core.constants.Limits.DefaultDoseTime,
    val daily: Boolean = true,
    val weekdays: Set<Int> = emptySet(),
    val purpose: MedPurpose? = null,
    val discomfort: Discomfort? = null,
    val busy: Boolean = false,
    val finished: Boolean = false,
) {
    val title: String
        get() = when (step) {
            OnboardingStep.HasMed -> Copy.Onboarding.HasMedTitle
            OnboardingStep.Name -> Copy.Onboarding.NameTitle
            OnboardingStep.Schedule -> Copy.Onboarding.ScheduleTitle
            OnboardingStep.Purpose -> Copy.Onboarding.PurposeTitle
            OnboardingStep.Discomfort -> Copy.Onboarding.DiscomfortTitle
            OnboardingStep.Permission -> Copy.Onboarding.PermissionTitle
        }
    val cta: String
        get() = when (step) {
            OnboardingStep.HasMed -> Copy.Onboarding.HasMedYes
            OnboardingStep.Permission -> Copy.Onboarding.PermissionCta
            OnboardingStep.Discomfort -> Copy.Onboarding.Done
            else -> Copy.Onboarding.Next
        }
    val ctaEnabled: Boolean
        get() = when (step) {
            OnboardingStep.Name -> name.trim().isNotEmpty() && !busy
            OnboardingStep.Schedule -> {
                val times = listOf(DaysMask.normalizeHhmm(time))
                val mode = if (daily) DaysMode.Daily else DaysMode.Weekday
                DaysMask.validateSameSchedule(times, mode, weekdays.toList()) == null && !busy
            }
            else -> !busy
        }
}

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val store: LocalMedStore,
    private val reconciler: AlarmReconciler,
    val permissions: AlarmPermissions,
) : ViewModel() {

    private val _state = MutableStateFlow(OnboardingUiState())
    val state: StateFlow<OnboardingUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    fun setName(v: String) { _state.update { it.copy(name = v) } }
    fun setTime(v: String) { _state.update { it.copy(time = v) } }
    fun setDaily(v: Boolean) { _state.update { it.copy(daily = v) } }
    fun toggleWeekday(d: Int) {
        _state.update {
            val next = it.weekdays.toMutableSet()
            if (d in next) next.remove(d) else next.add(d)
            it.copy(weekdays = next, daily = false)
        }
    }
    fun setPurpose(v: MedPurpose?) { _state.update { it.copy(purpose = v) } }
    fun setDiscomfort(v: Discomfort?) { _state.update { it.copy(discomfort = v) } }

    fun back() {
        val s = _state.value
        val prev = when (s.step) {
            OnboardingStep.HasMed -> return
            OnboardingStep.Name -> OnboardingStep.HasMed
            OnboardingStep.Schedule -> OnboardingStep.Name
            OnboardingStep.Purpose -> OnboardingStep.Schedule
            OnboardingStep.Discomfort -> if (s.addingMed) OnboardingStep.Purpose else OnboardingStep.HasMed
            OnboardingStep.Permission -> OnboardingStep.Discomfort
        }
        _state.update { it.copy(step = prev) }
    }

    fun skipMed() {
        _state.update { it.copy(addingMed = false, step = OnboardingStep.Discomfort) }
    }

    fun primary() {
        val s = _state.value
        when (s.step) {
            OnboardingStep.HasMed -> _state.update { it.copy(addingMed = true, step = OnboardingStep.Name) }
            OnboardingStep.Name -> _state.update { it.copy(step = OnboardingStep.Schedule) }
            OnboardingStep.Schedule -> {
                if (!s.ctaEnabled) return
                _state.update { it.copy(step = OnboardingStep.Purpose) }
            }
            OnboardingStep.Purpose -> _state.update { it.copy(step = OnboardingStep.Discomfort) }
            OnboardingStep.Discomfort -> _state.update { it.copy(step = OnboardingStep.Permission) }
            OnboardingStep.Permission -> finish()
        }
    }

    fun skipPurpose() {
        _state.update { it.copy(purpose = null, step = OnboardingStep.Discomfort) }
    }

    fun skipDiscomfort() {
        _state.update { it.copy(discomfort = null, step = OnboardingStep.Permission) }
    }

    fun finish() {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching {
                val s = _state.value
                if (s.addingMed && s.name.trim().isNotEmpty()) {
                    val times = listOf(DaysMask.normalizeHhmm(s.time))
                    val mode = if (s.daily) DaysMode.Daily else DaysMode.Weekday
                    val mask = DaysMask.format(mode, s.weekdays.toList())
                    store.add(
                        s.name,
                        DaysMask.expandSameSchedule(times, mask),
                        MedicationMetaInput(purpose = s.purpose),
                    )
                }
                store.setDiscomfort(s.discomfort)
                store.setOnboardingDone(true)
                reconciler.reconcile()
            }.onSuccess {
                _state.update { it.copy(busy = false, finished = true) }
            }.onFailure { e ->
                _state.update { it.copy(busy = false) }
                _messages.tryEmit(formatUserFacingError(e, Errors.Med.AddFailed))
            }
        }
    }

    fun needsExactAlarm(): Boolean =
        permissions.exactAlarmStatus() == ExactAlarmStatus.Disabled
}
