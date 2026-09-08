package com.jinlabs.yakok.ui.family

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.CalendarMark
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.DayMedicationEntry
import com.jinlabs.yakok.core.med.MedCalendar
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.core.user.FamilyRoles
import com.jinlabs.yakok.core.user.UserRole
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.MedicationRepository
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
import kotlinx.datetime.Clock

data class MemberMedUiState(
    val loading: Boolean = true,
    val nickname: String = Copy.Family.MemberFallback,
    val canManage: Boolean = false,
    val meds: List<Medication> = emptyList(),
    val calendarMeds: List<Medication> = emptyList(),
    val logs: List<DailyLog> = emptyList(),
    val selectedDate: String = "",
    val visibleMonth: String = "",
    val today: String = "",
    val error: String? = null,
) {
    val hasRegistered: Boolean get() = meds.isNotEmpty()
    val markedDates: Map<String, CalendarMark>
        get() = MedCalendar.buildMarkedDates(visibleMonth, calendarMeds, logs, selectedDate, today)
    val pastEntries: List<DayMedicationEntry>
        get() = MedCalendar.buildDayMedicationEntries(selectedDate, calendarMeds, logs)
    val streakDays: Int
        get() = MedCalendar.computeStreakDays(calendarMeds, logs, today)
}

@HiltViewModel
class MemberMedViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val auth: AuthRepository,
    private val meds: MedicationRepository,
) : ViewModel() {
    val userId: String = savedStateHandle.get<String>("userId").orEmpty()
    private val nicknameArg: String = savedStateHandle.get<String>("nickname").orEmpty()
    private val roleArg: String = savedStateHandle.get<String>("role").orEmpty()

    private val _state = MutableStateFlow(
        MemberMedUiState(nickname = nicknameArg.ifBlank { Copy.Family.MemberFallback }),
    )
    val state: StateFlow<MemberMedUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            val today = Kst.todayDateString(Clock.System.now())
            val month = _state.value.visibleMonth.ifEmpty { MedCalendar.currentYearMonth(today) }
            val selected = _state.value.selectedDate.ifEmpty { today }
            val me = auth.getProfile()
            val targetRole = roleArg.takeIf { it.isNotBlank() }?.let { UserRole.fromWire(it) }
            val canManage = FamilyRoles.canManageMemberMeds(me?.role, targetRole)
            _state.update {
                it.copy(
                    loading = it.meds.isEmpty(),
                    today = today,
                    visibleMonth = month,
                    selectedDate = selected,
                    canManage = canManage,
                    nickname = nicknameArg.ifBlank { it.nickname },
                )
            }
            if (userId.isEmpty()) {
                _state.update { it.copy(loading = false, error = Errors.Family.MemberNotFound) }
                return@launch
            }
            runCatching {
                val (from, to) = MedCalendar.monthRange(month)
                Triple(
                    meds.listActive(userId),
                    meds.listForCalendar(userId),
                    meds.listLogsInRange(userId, from, to),
                )
            }.onSuccess { (active, calendar, logs) ->
                _state.update {
                    it.copy(
                        loading = false,
                        meds = active,
                        calendarMeds = calendar,
                        logs = logs,
                        error = null,
                    )
                }
            }.onFailure { e ->
                _state.update { it.copy(loading = false) }
                _messages.tryEmit(formatUserFacingError(e, Copy.Med.LoadFailed))
            }
        }
    }

    fun selectDate(dateKst: String) {
        _state.update { it.copy(selectedDate = dateKst) }
    }

    fun shiftMonth(delta: Int) {
        val current = _state.value.visibleMonth
        val parts = current.split("-")
        val y = parts.getOrNull(0)?.toIntOrNull() ?: return
        val m = parts.getOrNull(1)?.toIntOrNull() ?: return
        val ym = java.time.YearMonth.of(y, m).plusMonths(delta.toLong())
        val next = "%04d-%02d".format(ym.year, ym.monthValue)
        _state.update { it.copy(visibleMonth = next) }
        refresh()
    }

    fun deleteMedication(id: Long) {
        if (!_state.value.canManage) return
        viewModelScope.launch {
            runCatching { meds.softDelete(id) }
                .onFailure { _messages.tryEmit(formatUserFacingError(it, Errors.Med.DeleteFailed)) }
            refresh()
        }
    }
}
