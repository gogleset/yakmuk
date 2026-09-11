package com.jinlabs.yakok.local

import com.jinlabs.yakok.core.constants.MedColors
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.Discomfort
import com.jinlabs.yakok.core.med.MedScheduleSlot
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.med.MedicationMeta
import com.jinlabs.yakok.core.med.MedicationMetaInput
import com.jinlabs.yakok.core.time.Kst
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.datetime.Clock

data class LocalProfile(
    val discomfort: Discomfort?,
    val onboardingDone: Boolean,
)

@Singleton
class LocalMedStore @Inject constructor(
    private val db: YakokDatabase,
) {
    private val meds get() = db.medications()
    private val logs get() = db.logs()
    private val profileDao get() = db.profile()

    val profile: Flow<LocalProfile> = profileDao.observe().map { it.toLocal() }

    suspend fun getProfile(): LocalProfile = (profileDao.get() ?: ensureProfile()).toLocal()

    suspend fun listActive(): List<Medication> = meds.listActive().map { it.toMedication() }

    suspend fun listForCalendar(): List<Medication> = meds.listForCalendar().map { it.toMedication() }

    suspend fun getById(id: Long): Medication? = meds.getById(id)?.toMedication()

    suspend fun listTodayTaken(dateKst: String): Set<Long> =
        logs.listTakenIds(dateKst).toSet()

    suspend fun listLogsInRange(from: String, to: String): List<DailyLog> =
        logs.listInRange(from, to).map { it.toDailyLog() }

    suspend fun add(name: String, slots: List<MedScheduleSlot>, meta: MedicationMetaInput): List<Medication> {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) throw IllegalStateException(Errors.Med.NameRequired)
        if (slots.isEmpty()) throw IllegalStateException(Errors.Med.ScheduleEmpty)
        val cols = MedicationMeta.toColumns(meta)
        val now = Clock.System.now().toString()
        return slots.map { slot ->
            val id = meds.insert(
                MedicationEntity(
                    name = trimmed,
                    scheduledTime = slot.scheduledTime,
                    daysMask = slot.daysMask.ifEmpty { "daily" },
                    createdAt = now,
                    itemSeq = cols.itemSeq,
                    color = cols.color,
                    efficacy = cols.efficacy,
                    useMethod = cols.useMethod,
                    storage = cols.storage,
                    warning = cols.warning,
                    doseAmount = cols.doseAmount,
                    doseUnit = cols.doseUnit,
                    notificationEnabled = slot.notificationEnabled,
                    purpose = meta.purpose?.wire,
                ),
            )
            meds.getById(id)!!.toMedication()
        }
    }

    suspend fun update(
        medicationId: Long,
        name: String,
        scheduledTime: String,
        daysMask: String,
        meta: MedicationMetaInput,
    ): Medication {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) throw IllegalStateException(Errors.Med.NameRequired)
        val existing = meds.getById(medicationId) ?: throw IllegalStateException(Errors.Med.UpdateFailed)
        val cols = MedicationMeta.toColumns(meta)
        meds.update(
            existing.copy(
                name = trimmed,
                scheduledTime = scheduledTime,
                daysMask = daysMask,
                itemSeq = cols.itemSeq,
                color = cols.color.ifEmpty { MedColors.DefaultId },
                efficacy = cols.efficacy,
                useMethod = cols.useMethod,
                storage = cols.storage,
                warning = cols.warning,
                doseAmount = cols.doseAmount,
                doseUnit = cols.doseUnit,
                purpose = meta.purpose?.wire ?: existing.purpose,
            ),
        )
        return meds.getById(medicationId)!!.toMedication()
    }

    suspend fun softDelete(medicationId: Long) {
        meds.softDelete(medicationId, Clock.System.now().toString())
    }

    suspend fun toggleTaken(
        medicationId: Long,
        currentlyTaken: Boolean,
        dateKst: String = Kst.todayDateString(Clock.System.now()),
    ) {
        if (currentlyTaken) {
            logs.deleteTaken(dateKst, medicationId)
            return
        }
        logs.insert(
            DailyLogEntity(
                medicationId = medicationId,
                logDate = dateKst,
                status = "TAKEN",
                createdAt = Clock.System.now().toString(),
            ),
        )
    }

    suspend fun setDiscomfort(value: Discomfort?) {
        val current = ensureProfile()
        profileDao.upsert(current.copy(discomfort = value?.wire))
    }

    suspend fun setOnboardingDone(done: Boolean) {
        val current = ensureProfile()
        profileDao.upsert(current.copy(onboardingDone = done))
    }

    suspend fun clearAll() {
        logs.deleteAll()
        meds.deleteAll()
        profileDao.upsert(ProfileEntity())
    }

    private suspend fun ensureProfile(): ProfileEntity {
        val existing = profileDao.get()
        if (existing != null) return existing
        val created = ProfileEntity()
        profileDao.upsert(created)
        return created
    }

    private fun ProfileEntity?.toLocal(): LocalProfile = LocalProfile(
        discomfort = this?.discomfortValue,
        onboardingDone = this?.onboardingDone == true,
    )
}
