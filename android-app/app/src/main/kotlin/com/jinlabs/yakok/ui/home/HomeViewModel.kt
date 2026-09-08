package com.jinlabs.yakok.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.CalendarMark
import com.jinlabs.yakok.core.med.ConditionValue
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.DayMedicationEntry
import com.jinlabs.yakok.core.med.LoopTrigger
import com.jinlabs.yakok.core.med.MedCalendar
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.alarm.AlarmPermissions
import com.jinlabs.yakok.alarm.AlarmPrompt
import com.jinlabs.yakok.alarm.AlarmReconciler
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.alarm.CareGlanceController
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.CarePushClient
import com.jinlabs.yakok.data.DayLoopRunner
import com.jinlabs.yakok.data.FamilyAlertRepository
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
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

data class HomeUiState(
    val loading: Boolean = true,
    val meds: List<Medication> = emptyList(),
    val calendarMeds: List<Medication> = emptyList(),
    val logs: List<DailyLog> = emptyList(),
    val takenIds: Set<Long> = emptySet(),
    val selectedDate: String = "",
    val visibleMonth: String = "",
    val today: String = "",
    val familyId: String? = null,
    val condition: ConditionValue = ConditionValue.Good,
    val message: String = "",
    val busy: Boolean = false,
    val error: String? = null,
    val alarmPrompt: AlarmPrompt = AlarmPrompt.None,
) {
    val hasRegistered: Boolean get() = meds.isNotEmpty()
    val todayMeds: List<Medication>
        get() = meds.filter { MedCalendar.isMedScheduledOnDate(it, today) }
    val pendingIds: List<Long>
        get() = todayMeds.filter { it.id !in takenIds }.map { it.id }
    val allDone: Boolean get() = todayMeds.isNotEmpty() && pendingIds.isEmpty()
    val viewingTodayMonth: Boolean get() = visibleMonth == MedCalendar.currentYearMonth(today)
    val showTodayCheck: Boolean
        get() = hasRegistered && selectedDate == today && viewingTodayMonth
    val showPastDay: Boolean get() = hasRegistered && selectedDate != today
    val streakDays: Int
        get() = MedCalendar.computeStreakDays(calendarMeds, logs, today)
    val markedDates: Map<String, CalendarMark>
        get() = MedCalendar.buildMarkedDates(visibleMonth, calendarMeds, logs, selectedDate, today)
    val pastEntries: List<DayMedicationEntry>
        get() = MedCalendar.buildDayMedicationEntries(selectedDate, calendarMeds, logs)
    val todayCondition: DailyLog?
        get() = logs.find { it.logDate == today && it.condition != null }
    val selectedConditionLogs: List<DailyLog>
        get() = logs.filter { it.logDate == selectedDate && it.condition != null }
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val auth: AuthRepository,
    private val meds: MedicationRepository,
    private val loop: DayLoopRunner,
    private val alerts: FamilyAlertRepository,
    private val reconciler: AlarmReconciler,
    private val alarmPermissions: AlarmPermissions,
    private val glance: CareGlanceController,
    private val carePush: CarePushClient,
) : ViewModel() {

    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

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
            _state.update { it.copy(loading = it.meds.isEmpty(), today = today, visibleMonth = month, selectedDate = selected) }
            val uid = auth.currentUserId() ?: return@launch
            val familyId = auth.getProfile()?.familyId
            runCatching {
                val (from, to) = MedCalendar.monthRange(month)
                val streakFrom = Kst.addDays(today, -60)
                val rangeFrom = if (streakFrom < from) streakFrom else from
                Triple(
                    meds.listActive(uid),
                    meds.listForCalendar(uid),
                    meds.listLogsInRange(uid, rangeFrom, to),
                ) to meds.listTodayTaken(uid, today)
            }.onSuccess { (triple, taken) ->
                val (active, calendar, logs) = triple
                _state.update {
                    it.copy(
                        loading = false,
                        meds = active,
                        calendarMeds = calendar,
                        logs = logs,
                        takenIds = taken,
                        today = today,
                        familyId = familyId,
                    )
                }
                runCatching { reconciler.reconcile() }
                    .onSuccess { prompt ->
                        if (prompt != AlarmPrompt.None) {
                            _state.update { it.copy(alarmPrompt = prompt) }
                        }
                    }
            }.onFailure { e ->
                _state.update { it.copy(loading = false) }
                fail(Copy.Med.LoadFailed, e)
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

    fun setCondition(value: ConditionValue) {
        _state.update { it.copy(condition = value) }
    }

    fun setMessage(value: String) {
        _state.update { it.copy(message = value) }
    }

    fun toggleTaken(medicationId: Long) {
        val s = _state.value
        if (medicationId in s.takenIds) return
        val uid = auth.currentUserId() ?: return
        val familyId = s.familyId ?: return
        val pendingAfter = s.pendingIds.filter { it != medicationId }
        _state.update { it.copy(takenIds = it.takenIds + medicationId, busy = true) }
        viewModelScope.launch {
            val result = runCatching {
                meds.toggleTaken(uid, familyId, medicationId, currentlyTaken = false)
                val total = s.todayMeds.size
                if (total > 0) {
                    meds.syncDayCompleteFeed(uid, familyId, pendingAfter.isEmpty())
                }
                loop.step(
                    userId = uid,
                    familyId = familyId,
                    trigger = LoopTrigger.InApp,
                    pendingMedicationIds = pendingAfter,
                    plan = buildJsonObject {
                        put("action", JsonPrimitive("toggle_medication"))
                        put("medicationId", JsonPrimitive(medicationId))
                    },
                    result = buildJsonObject {
                        put("kind", JsonPrimitive("toggle_medication"))
                    },
                )
            }
            result.onFailure { e ->
                _state.update { it.copy(takenIds = it.takenIds - medicationId) }
                fail(Errors.Med.CheckFailed, e)
            }
            if (result.isSuccess) {
                carePush.notifyTaken(familyId, uid, medicationId)
            }
            _state.update { it.copy(busy = false) }
            refresh()
            runCatching { glance.syncForCurrentUser() }
        }
    }

    fun submitCondition() {
        val s = _state.value
        val uid = auth.currentUserId() ?: return
        val familyId = s.familyId ?: return
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching {
                meds.submitCondition(uid, familyId, s.condition, s.message)
                if (s.condition == ConditionValue.Bad) {
                    alerts.upsertBadCondition(
                        familyId,
                        uid,
                        s.message.trim().ifEmpty { Copy.Condition.DefaultBadMessage },
                        s.today,
                    )
                }
                loop.step(
                    userId = uid,
                    familyId = familyId,
                    trigger = LoopTrigger.InApp,
                    pendingMedicationIds = s.pendingIds,
                    plan = buildJsonObject {
                        put("action", JsonPrimitive("submit_condition"))
                        put("condition", JsonPrimitive(s.condition.wire))
                    },
                    result = buildJsonObject { put("kind", JsonPrimitive("submit_condition")) },
                )
            }.onSuccess {
                _messages.tryEmit(Copy.Condition.SavedBody)
            }.onFailure { fail(Errors.Condition.SaveFailed, it) }
            _state.update { it.copy(busy = false) }
            refresh()
            runCatching { glance.syncForCurrentUser() }
        }
    }

    fun ackAlarmPrompt() {
        _state.update { it.copy(alarmPrompt = AlarmPrompt.None) }
    }

    fun exactAlarmSettingsIntent() = alarmPermissions.exactAlarmSettingsIntent()
    fun fsiSettingsIntent() = alarmPermissions.fsiSettingsIntent()

    fun deleteMedication(id: Long) {
        viewModelScope.launch {
            runCatching { meds.softDelete(id) }
                .onFailure { fail(Errors.Med.DeleteFailed, it) }
            refresh()
        }
    }

    private fun fail(fallback: String, error: Throwable) {
        val msg = formatUserFacingError(error, fallback)
        _state.update { it.copy(error = msg, busy = false) }
        _messages.tryEmit(msg)
    }
}
