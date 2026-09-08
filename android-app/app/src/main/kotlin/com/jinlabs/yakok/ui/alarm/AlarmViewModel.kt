package com.jinlabs.yakok.ui.alarm

import android.app.NotificationManager
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.alarm.AlarmReconciler
import com.jinlabs.yakok.alarm.CareGlanceController
import com.jinlabs.yakok.alarm.PendingAlarmHold
import com.jinlabs.yakok.alarm.PendingAlarmLaunch
import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.constants.MedDoseUnits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.AlarmMedItem
import com.jinlabs.yakok.core.med.AlarmSlotResolver
import com.jinlabs.yakok.core.med.LoopTrigger
import com.jinlabs.yakok.core.med.MedCalendar
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.CarePushClient
import com.jinlabs.yakok.data.DayLoopRunner
import com.jinlabs.yakok.data.MedicationRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import android.content.Context
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

data class AlarmUiState(
    val loading: Boolean = true,
    val headline: String = Copy.Notif.AlarmHeadline,
    val displayTime: String = "",
    val items: List<AlarmMedItem> = emptyList(),
    val takenIds: Set<Long> = emptySet(),
    val keepChecklist: Boolean = false,
    val busy: Boolean = false,
    val familyId: String? = null,
    val userId: String? = null,
) {
    val unchecked: List<AlarmMedItem> get() = items.filter { it.medicationId !in takenIds }
    val showChecklist: Boolean get() = keepChecklist && items.isNotEmpty()
    val primaryLabel: String get() = if (showChecklist) Copy.Notif.AlarmTakeAll else Copy.Notif.AlarmTaken
}

@HiltViewModel
class AlarmViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val auth: AuthRepository,
    private val meds: MedicationRepository,
    private val loop: DayLoopRunner,
    private val reconciler: AlarmReconciler,
    private val pending: PendingAlarmHold,
    private val glance: CareGlanceController,
    private val carePush: CarePushClient,
) : ViewModel() {

    private val launch: PendingAlarmLaunch = pending.launch.also { pending.launch = null } ?: PendingAlarmLaunch()

    private val _state = MutableStateFlow(AlarmUiState(displayTime = launch.scheduledTime))
    val state: StateFlow<AlarmUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private val _done = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val done: SharedFlow<Unit> = _done.asSharedFlow()

    init {
        cancelDisplayed()
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            val uid = auth.currentUserId()
            val profile = auth.getProfile()
            val familyId = profile?.familyId
            if (uid == null || familyId == null) {
                _done.tryEmit(Unit)
                return@launch
            }
            val today = Kst.todayDateString(Clock.System.now())
            runCatching {
                meds.listActive(uid) to meds.listTodayTaken(uid, today)
            }.onSuccess { (list, taken) ->
                applySlot(list, taken, uid, familyId)
            }.onFailure { e ->
                _messages.tryEmit(formatUserFacingError(e, Copy.Med.LoadFailed))
                applySlot(emptyList(), emptySet(), uid, familyId)
            }
        }
    }

    fun takeOne(medicationId: Long) {
        val s = _state.value
        if (medicationId in s.takenIds || s.busy) return
        take(listOf(medicationId), dismissIfSingle = !s.keepChecklist)
    }

    fun takeRemaining() {
        val ids = _state.value.unchecked.map { it.medicationId }
        if (ids.isEmpty()) {
            _done.tryEmit(Unit)
            return
        }
        take(ids, dismissIfSingle = true)
    }

    private fun take(ids: List<Long>, dismissIfSingle: Boolean) {
        val s = _state.value
        val uid = s.userId ?: return
        val familyId = s.familyId ?: return
        val valid = ids.filter { it > 0 }
        if (valid.isEmpty()) {
            _done.tryEmit(Unit)
            return
        }
        _state.update { it.copy(takenIds = it.takenIds + valid, busy = true) }
        viewModelScope.launch {
            runCatching {
                for (id in valid) {
                    meds.toggleTaken(uid, familyId, id, currentlyTaken = false)
                }
                val today = Kst.todayDateString(Clock.System.now())
                val todayMeds = meds.listActive(uid).filter {
                    MedCalendar.isMedScheduledOnDate(it, today)
                }
                val takenNow = meds.listTodayTaken(uid, today)
                val pendingAfter = todayMeds.filter { it.id !in takenNow }.map { it.id }
                if (todayMeds.isNotEmpty()) {
                    meds.syncDayCompleteFeed(uid, familyId, pendingAfter.isEmpty())
                }
                loop.step(
                    userId = uid,
                    familyId = familyId,
                    trigger = LoopTrigger.InApp,
                    pendingMedicationIds = pendingAfter,
                    plan = buildJsonObject {
                        put("action", JsonPrimitive("alarm_take"))
                    },
                    result = buildJsonObject {
                        put("kind", JsonPrimitive("alarm_take"))
                        put("count", JsonPrimitive(valid.size))
                    },
                )
                reconciler.reconcile()
                runCatching { glance.syncForCurrentUser() }
                carePush.notifyTaken(familyId, uid, valid.firstOrNull())
            }.onFailure { e ->
                _state.update { it.copy(takenIds = it.takenIds - valid.toSet()) }
                _messages.tryEmit(formatUserFacingError(e, Errors.Med.CheckFailed))
            }
            _state.update { it.copy(busy = false) }
            if (dismissIfSingle) _done.tryEmit(Unit)
            else refresh()
        }
    }

    private fun applySlot(
        list: List<Medication>,
        taken: Set<Long>,
        uid: String,
        familyId: String?,
    ) {
        val slot = AlarmSlotResolver.resolve(list, scheduledTime = launch.scheduledTime.ifBlank { null })
        val items = slot?.items.orEmpty()
        if (items.isEmpty()) {
            val fallback = fallbackItem()
            if (fallback != null) {
                _state.update {
                    it.copy(
                        loading = false,
                        userId = uid,
                        familyId = familyId,
                        displayTime = fallback.scheduledTime,
                        items = listOf(fallback),
                        takenIds = taken,
                    )
                }
                return
            }
            _state.update { it.copy(loading = false, userId = uid, familyId = familyId) }
            _done.tryEmit(Unit)
            return
        }
        val unchecked = items.filter { it.medicationId !in taken }
        if (unchecked.isEmpty()) {
            _done.tryEmit(Unit)
            return
        }
        _state.update {
            it.copy(
                loading = false,
                userId = uid,
                familyId = familyId,
                displayTime = slot?.scheduledTime ?: launch.scheduledTime,
                items = items,
                takenIds = taken,
                keepChecklist = items.size > 1 || it.keepChecklist,
            )
        }
    }

    private fun fallbackItem(): AlarmMedItem? {
        val id = launch.medicationIdLong ?: return null
        return AlarmMedItem(
            medicationId = id,
            name = launch.name.ifBlank { Copy.Notif.DoseTitle },
            scheduledTime = launch.scheduledTime,
            useMethod = launch.useMethod.takeIf { it.isNotBlank() },
            doseAmount = launch.doseAmount.toDoubleOrNull(),
            doseUnit = launch.doseUnit.takeIf { it.isNotBlank() },
        )
    }

    private fun cancelDisplayed() {
        try {
            val nm = context.getSystemService(NotificationManager::class.java) ?: return
            nm.activeNotifications
                ?.filter { it.notification.channelId == MedAlarm.ChannelId }
                ?.forEach { nm.cancel(it.tag, it.id) }
        } catch (_: Exception) {
        }
    }

    companion object {
        fun doseMeta(item: AlarmMedItem): String? {
            val dose = MedDoseUnits.formatDose(item.doseAmount, item.doseUnit)
            val method = item.useMethod?.trim()?.takeIf { it.isNotEmpty() }
            val label = listOfNotNull(dose, method).joinToString(" · ")
            return label.takeIf { it.isNotEmpty() }
        }
    }
}
