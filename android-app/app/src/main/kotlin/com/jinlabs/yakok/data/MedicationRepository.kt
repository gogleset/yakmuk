package com.jinlabs.yakok.data

import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.med.ConditionValue
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.DayCompleteFeed
import com.jinlabs.yakok.core.med.MedMappers
import com.jinlabs.yakok.core.med.MedScheduleSlot
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.med.MedicationMeta
import com.jinlabs.yakok.core.med.MedicationMetaInput
import com.jinlabs.yakok.core.time.Kst
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.datetime.Clock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

@Serializable
data class MedicationRow(
    val id: Long,
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("scheduled_time") val scheduledTime: String,
    @SerialName("days_mask") val daysMask: String = "daily",
    @SerialName("created_at") val createdAt: String,
    @SerialName("deleted_at") val deletedAt: String? = null,
    @SerialName("item_seq") val itemSeq: String? = null,
    val color: String? = null,
    val efficacy: String? = null,
    @SerialName("use_method") val useMethod: String? = null,
    val storage: String? = null,
    val warning: String? = null,
    @SerialName("dose_amount") val doseAmount: Double? = null,
    @SerialName("dose_unit") val doseUnit: String? = null,
    @SerialName("notification_enabled") val notificationEnabled: Boolean? = null,
)

@Serializable
data class NameEmbed(val name: String? = null)

@Serializable
data class NickEmbed(val nickname: String? = null)

@Serializable
data class DailyLogRow(
    val id: Long,
    @SerialName("medication_id") val medicationId: Long? = null,
    @SerialName("user_id") val userId: String,
    @SerialName("log_date") val logDate: String,
    val status: String? = null,
    val condition: String? = null,
    val message: String? = null,
    @SerialName("family_id") val familyId: String,
    @SerialName("created_at") val createdAt: String,
    val medications: NameEmbed? = null,
    val users: NickEmbed? = null,
)

@Serializable
data class TakenIdRow(@SerialName("medication_id") val medicationId: Long? = null)

@Serializable
data class MedIdMaskRow(val id: Long, @SerialName("days_mask") val daysMask: String)

@Singleton
class MedicationRepository @Inject constructor(
    private val supabase: SupabaseClient,
) {
    suspend fun listActive(userId: String): List<Medication> =
        supabase.from("medications").select {
            filter { eq("user_id", userId) }
            order("scheduled_time", Order.ASCENDING)
        }.decodeList<MedicationRow>()
            .filter { it.deletedAt == null }
            .map { it.toMedication() }

    suspend fun listForCalendar(userId: String): List<Medication> =
        supabase.from("medications").select {
            filter { eq("user_id", userId) }
            order("scheduled_time", Order.ASCENDING)
        }.decodeList<MedicationRow>().map { it.toMedication() }

    suspend fun getById(id: Long): Medication? =
        supabase.from("medications").select {
            filter { eq("id", id) }
        }.decodeSingleOrNull<MedicationRow>()?.toMedication()

    suspend fun listTodayTaken(userId: String, dateKst: String): Set<Long> =
        supabase.from("daily_logs").select {
            filter {
                eq("user_id", userId)
                eq("log_date", dateKst)
                eq("status", "TAKEN")
            }
        }.decodeList<TakenIdRow>().mapNotNull { it.medicationId }.toSet()

    suspend fun listLogsInRange(userId: String, from: String, to: String): List<DailyLog> =
        supabase.from("daily_logs").select(columns = io.github.jan.supabase.postgrest.query.Columns.raw("*, medications(name)")) {
            filter {
                eq("user_id", userId)
                gte("log_date", from)
                lte("log_date", to)
            }
            order("log_date", Order.ASCENDING)
        }.decodeList<DailyLogRow>().map { it.toDailyLog() }

    suspend fun listIdMasks(userId: String): List<Pair<Long, String>> =
        supabase.from("medications").select {
            filter { eq("user_id", userId) }
        }.decodeList<MedIdMaskRow>()
            .let { rows ->
                val deleted = listForCalendar(userId).filter { it.deletedAt != null }.map { it.id }.toSet()
                rows.filter { it.id !in deleted }.map { it.id to it.daysMask }
            }

    suspend fun add(
        userId: String,
        name: String,
        slots: List<MedScheduleSlot>,
        meta: MedicationMetaInput,
    ): List<Medication> {
        val trimmed = name.trim()
        if (trimmed.isEmpty()) throw IllegalStateException(Errors.Med.NameRequired)
        if (slots.isEmpty()) throw IllegalStateException(Errors.Med.ScheduleEmpty)
        val cols = MedicationMeta.toColumns(meta)
        val payloads = slots.map { slot ->
            buildJsonObject {
                put("user_id", JsonPrimitive(userId))
                put("name", JsonPrimitive(trimmed))
                put("scheduled_time", JsonPrimitive(slot.scheduledTime))
                put("days_mask", JsonPrimitive(slot.daysMask.ifEmpty { "daily" }))
                put("notification_enabled", JsonPrimitive(slot.notificationEnabled))
                put("item_seq", cols.itemSeq?.let { JsonPrimitive(it) } ?: JsonNull)
                put("color", JsonPrimitive(cols.color))
                put("efficacy", cols.efficacy?.let { JsonPrimitive(it) } ?: JsonNull)
                put("use_method", cols.useMethod?.let { JsonPrimitive(it) } ?: JsonNull)
                put("storage", cols.storage?.let { JsonPrimitive(it) } ?: JsonNull)
                put("warning", cols.warning?.let { JsonPrimitive(it) } ?: JsonNull)
                put("dose_amount", cols.doseAmount?.let { JsonPrimitive(it) } ?: JsonNull)
                put("dose_unit", cols.doseUnit?.let { JsonPrimitive(it) } ?: JsonNull)
            }
        }
        val rows = runCatching {
            supabase.from("medications").insert(payloads) { select() }.decodeList<MedicationRow>()
        }.getOrElse { throw wrap(it, Errors.Med.AddFailed) }
        if (rows.isEmpty()) throw IllegalStateException(Errors.Med.AddFailed)
        return rows.map { it.toMedication() }
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
        val cols = MedicationMeta.toColumns(meta)
        val patch = buildJsonObject {
            put("name", JsonPrimitive(trimmed))
            put("scheduled_time", JsonPrimitive(scheduledTime))
            put("days_mask", JsonPrimitive(daysMask))
            put("item_seq", cols.itemSeq?.let { JsonPrimitive(it) } ?: JsonNull)
            put("color", JsonPrimitive(cols.color))
            put("efficacy", cols.efficacy?.let { JsonPrimitive(it) } ?: JsonNull)
            put("use_method", cols.useMethod?.let { JsonPrimitive(it) } ?: JsonNull)
            put("storage", cols.storage?.let { JsonPrimitive(it) } ?: JsonNull)
            put("warning", cols.warning?.let { JsonPrimitive(it) } ?: JsonNull)
            put("dose_amount", cols.doseAmount?.let { JsonPrimitive(it) } ?: JsonNull)
            put("dose_unit", cols.doseUnit?.let { JsonPrimitive(it) } ?: JsonNull)
        }
        val row = runCatching {
            supabase.from("medications").update(patch) {
                filter { eq("id", medicationId) }
                select()
            }.decodeSingle<MedicationRow>()
        }.getOrElse { throw wrap(it, Errors.Med.UpdateFailed) }
        return row.toMedication()
    }

    suspend fun softDelete(medicationId: Long) {
        val iso = Clock.System.now().toString()
        runCatching {
            supabase.from("medications").update(
                buildJsonObject { put("deleted_at", JsonPrimitive(iso)) },
            ) {
                filter { eq("id", medicationId) }
            }
        }.onFailure { throw wrap(it, Errors.Med.DeleteFailed) }
    }

    suspend fun toggleTaken(
        userId: String,
        familyId: String,
        medicationId: Long,
        currentlyTaken: Boolean,
        dateKst: String = Kst.todayDateString(Clock.System.now()),
    ) {
        if (currentlyTaken) {
            supabase.from("daily_logs").delete {
                filter {
                    eq("user_id", userId)
                    eq("log_date", dateKst)
                    eq("medication_id", medicationId)
                    eq("status", "TAKEN")
                }
            }
            return
        }
        supabase.from("daily_logs").insert(
            buildJsonObject {
                put("medication_id", JsonPrimitive(medicationId))
                put("user_id", JsonPrimitive(userId))
                put("log_date", JsonPrimitive(dateKst))
                put("status", JsonPrimitive("TAKEN"))
                put("family_id", JsonPrimitive(familyId))
            },
        )
    }

    suspend fun submitCondition(
        userId: String,
        familyId: String,
        condition: ConditionValue,
        message: String?,
        dateKst: String = Kst.todayDateString(Clock.System.now()),
    ) {
        val existing = supabase.from("daily_logs").select {
            filter {
                eq("user_id", userId)
                eq("log_date", dateKst)
            }
        }.decodeList<DailyLogRow>()
        existing.filter { it.medicationId == null && it.condition != null }.forEach { row ->
            supabase.from("daily_logs").delete { filter { eq("id", row.id) } }
        }
        supabase.from("daily_logs").insert(
            buildJsonObject {
                put("medication_id", JsonNull)
                put("user_id", JsonPrimitive(userId))
                put("log_date", JsonPrimitive(dateKst))
                put("condition", JsonPrimitive(condition.wire))
                put("message", message?.trim()?.takeIf { it.isNotEmpty() }?.let { JsonPrimitive(it) } ?: JsonNull)
                put("family_id", JsonPrimitive(familyId))
            },
        )
    }

    suspend fun syncDayCompleteFeed(
        userId: String,
        familyId: String,
        allDone: Boolean,
        dateKst: String = Kst.todayDateString(Clock.System.now()),
    ) {
        val existing = supabase.from("daily_logs").select {
            filter {
                eq("user_id", userId)
                eq("log_date", dateKst)
                eq("family_id", familyId)
                eq("status", "TAKEN")
                eq("message", DayCompleteFeed.Marker)
            }
        }.decodeList<DailyLogRow>()
        existing.filter { it.medicationId == null }.forEach { row ->
            supabase.from("daily_logs").delete { filter { eq("id", row.id) } }
        }
        if (!allDone) return
        supabase.from("daily_logs").insert(
            buildJsonObject {
                put("medication_id", JsonNull)
                put("user_id", JsonPrimitive(userId))
                put("log_date", JsonPrimitive(dateKst))
                put("status", JsonPrimitive("TAKEN"))
                put("message", JsonPrimitive(DayCompleteFeed.Marker))
                put("family_id", JsonPrimitive(familyId))
            },
        )
    }

    suspend fun conditionCount(userId: String, dateKst: String): Int =
        supabase.from("daily_logs").select {
            filter {
                eq("user_id", userId)
                eq("log_date", dateKst)
            }
        }.decodeList<DailyLogRow>().count { it.condition in listOf("GOOD", "NORMAL", "BAD") }

    private fun wrap(error: Throwable, fallback: String): Throwable =
        IllegalStateException(formatUserFacingError(error, fallback), error)

    companion object {
        val DrugSearchMin = Limits.DrugSearchMinQueryLength
    }
}

fun MedicationRow.toMedication(): Medication = MedMappers.mapMedication(
    mapOf(
        "id" to id,
        "user_id" to userId,
        "name" to name,
        "scheduled_time" to scheduledTime,
        "days_mask" to daysMask,
        "created_at" to createdAt,
        "deleted_at" to deletedAt,
        "item_seq" to itemSeq,
        "color" to color,
        "efficacy" to efficacy,
        "use_method" to useMethod,
        "storage" to storage,
        "warning" to warning,
        "dose_amount" to doseAmount,
        "dose_unit" to doseUnit,
        "notification_enabled" to (notificationEnabled ?: true),
    ),
)

fun DailyLogRow.toDailyLog(): DailyLog = MedMappers.mapDailyLog(
    mapOf(
        "id" to id,
        "medication_id" to medicationId,
        "user_id" to userId,
        "log_date" to logDate,
        "status" to status,
        "condition" to condition,
        "message" to message,
        "family_id" to familyId,
        "created_at" to createdAt,
        "medications" to medications?.let { mapOf("name" to it.name) },
        "users" to users?.let { mapOf("nickname" to it.nickname) },
    ),
)
