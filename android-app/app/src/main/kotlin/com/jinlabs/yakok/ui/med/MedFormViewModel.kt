package com.jinlabs.yakok.ui.med

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.alarm.AlarmReconciler
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.constants.MedColors
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.DaysMask
import com.jinlabs.yakok.core.med.DaysMode
import com.jinlabs.yakok.core.med.DrugSearchItem
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.med.MedicationMeta
import com.jinlabs.yakok.core.med.MedicationMetaInput
import com.jinlabs.yakok.data.DrugSearchClient
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

data class MedFormState(
    val name: String = "",
    val query: String = "",
    val searchHits: List<DrugSearchItem> = emptyList(),
    val searching: Boolean = false,
    val times: List<String> = listOf(Limits.DefaultDoseTime),
    val daily: Boolean = true,
    val weekdays: Set<Int> = emptySet(),
    val color: String = MedColors.DefaultId,
    val doseAmount: String = "",
    val doseUnit: String? = null,
    val itemSeq: String? = null,
    val busy: Boolean = false,
    val saved: Boolean = false,
)

@HiltViewModel
class MedFormViewModel @Inject constructor(
    private val store: LocalMedStore,
    private val search: DrugSearchClient,
    private val reconciler: AlarmReconciler,
) : ViewModel() {

    private val _state = MutableStateFlow(MedFormState())
    val state: StateFlow<MedFormState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    val searchConfigured: Boolean get() = search.isConfigured

    fun load(medicationId: Long?) {
        if (medicationId == null) return
        viewModelScope.launch {
            val med = store.getById(medicationId) ?: return@launch
            applyMed(med)
        }
    }

    fun setName(v: String) { _state.update { it.copy(name = v) } }
    fun setQuery(v: String) { _state.update { it.copy(query = v) } }
    fun setColor(v: String) { _state.update { it.copy(color = v) } }
    fun setDoseAmount(v: String) {
        _state.update { it.copy(doseAmount = MedicationMeta.sanitizeDoseAmountInput(v)) }
    }
    fun setDoseUnit(v: String?) { _state.update { it.copy(doseUnit = v) } }
    fun setDaily(v: Boolean) { _state.update { it.copy(daily = v) } }
    fun toggleWeekday(d: Int) {
        _state.update {
            val next = it.weekdays.toMutableSet()
            if (d in next) next.remove(d) else next.add(d)
            it.copy(weekdays = next, daily = false)
        }
    }
    fun setTime(index: Int, raw: String) {
        _state.update {
            val times = it.times.toMutableList()
            if (index in times.indices) times[index] = raw
            it.copy(times = times)
        }
    }
    fun addTime() {
        _state.update {
            if (it.times.size >= Limits.MaxTimeSlots) it
            else it.copy(times = it.times + Limits.DefaultDoseTime)
        }
    }
    fun removeTime(index: Int) {
        _state.update {
            if (it.times.size <= 1) it
            else it.copy(times = it.times.filterIndexed { i, _ -> i != index })
        }
    }

    fun searchDrugs() {
        viewModelScope.launch {
            _state.update { it.copy(searching = true) }
            runCatching { search.search(_state.value.query) }
                .onSuccess { hits -> _state.update { it.copy(searchHits = hits, searching = false) } }
                .onFailure { e ->
                    _state.update { it.copy(searching = false, searchHits = emptyList()) }
                    _messages.tryEmit(formatUserFacingError(e, Errors.Med.SearchFailed))
                }
        }
    }

    fun pickDrug(item: DrugSearchItem) {
        _state.update {
            it.copy(
                name = item.itemName,
                itemSeq = item.itemSeq,
                query = item.itemName,
                searchHits = emptyList(),
            )
        }
    }

    fun save(replaceId: Long?) {
        val s = _state.value
        val name = s.name.trim()
        if (name.isEmpty()) {
            _messages.tryEmit(Errors.Med.NameRequired)
            return
        }
        val times = s.times.map { DaysMask.normalizeHhmm(it) }
        val mode = if (s.daily) DaysMode.Daily else DaysMode.Weekday
        val err = DaysMask.validateSameSchedule(times, mode, s.weekdays.toList())
        if (err != null) {
            _messages.tryEmit(DaysMask.scheduleErrorMessage(err))
            return
        }
        val mask = DaysMask.format(mode, s.weekdays.toList())
        val metaErr = MedicationMeta.validateForm(
            com.jinlabs.yakok.core.med.MedicationMetaFormFields(
                doseAmount = s.doseAmount,
                doseUnit = s.doseUnit,
            ),
        )
        if (metaErr != null) {
            _messages.tryEmit(metaErr)
            return
        }
        val slots = DaysMask.expandSameSchedule(times, mask)
        val meta = MedicationMetaInput(
            itemSeq = s.itemSeq,
            color = s.color,
            doseAmount = MedicationMeta.parseDoseAmount(s.doseAmount),
            doseUnit = s.doseUnit,
        )
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching {
                if (replaceId != null && slots.size == 1) {
                    val slot = slots.first()
                    store.update(replaceId, name, slot.scheduledTime, slot.daysMask, meta)
                } else {
                    if (replaceId != null) store.softDelete(replaceId)
                    store.add(name, slots, meta)
                }
            }.onSuccess {
                runCatching { reconciler.reconcile() }
                _state.update { it.copy(busy = false, saved = true) }
            }.onFailure { e ->
                _state.update { it.copy(busy = false) }
                _messages.tryEmit(formatUserFacingError(e, Errors.Med.AddFailed))
            }
        }
    }

    private fun applyMed(med: Medication) {
        val (mode, days) = DaysMask.parse(med.daysMask)
        _state.update {
            it.copy(
                name = med.name,
                times = listOf(med.scheduledTime),
                daily = mode == DaysMode.Daily,
                weekdays = days.toSet(),
                color = med.color,
                doseAmount = med.doseAmount?.toString().orEmpty(),
                doseUnit = med.doseUnit,
                itemSeq = med.itemSeq,
            )
        }
    }
}
