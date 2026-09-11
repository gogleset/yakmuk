package com.jinlabs.yakok.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.jinlabs.yakok.core.local.LocalIdentity
import com.jinlabs.yakok.core.med.Discomfort
import com.jinlabs.yakok.core.med.LogStatus
import com.jinlabs.yakok.core.med.MedPurpose
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.med.DailyLog

@Entity(tableName = "medications")
data class MedicationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val scheduledTime: String,
    val daysMask: String,
    val createdAt: String,
    val deletedAt: String? = null,
    val itemSeq: String? = null,
    val color: String,
    val efficacy: String? = null,
    val useMethod: String? = null,
    val storage: String? = null,
    val warning: String? = null,
    val doseAmount: Double? = null,
    val doseUnit: String? = null,
    val notificationEnabled: Boolean = true,
    val purpose: String? = null,
) {
    fun toMedication(): Medication = Medication(
        id = id,
        userId = LocalIdentity.USER_ID,
        name = name,
        scheduledTime = scheduledTime.take(5),
        daysMask = daysMask.ifEmpty { "daily" },
        createdAt = createdAt,
        deletedAt = deletedAt,
        itemSeq = itemSeq,
        color = color,
        efficacy = efficacy,
        useMethod = useMethod,
        storage = storage,
        warning = warning,
        doseAmount = doseAmount,
        doseUnit = doseUnit,
        notificationEnabled = notificationEnabled,
        purpose = MedPurpose.fromWire(purpose),
    )
}

@Entity(
    tableName = "daily_logs",
    indices = [Index(value = ["logDate", "medicationId", "status"], unique = true)],
)
data class DailyLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val medicationId: Long?,
    val logDate: String,
    val status: String,
    val createdAt: String,
) {
    fun toDailyLog(): DailyLog = DailyLog(
        id = id,
        medicationId = medicationId,
        userId = LocalIdentity.USER_ID,
        logDate = logDate,
        status = LogStatus.fromWire(status),
        condition = null,
        message = null,
        familyId = "",
        createdAt = createdAt,
        nickname = null,
        medicationName = null,
    )
}

@Entity(tableName = "profile")
data class ProfileEntity(
    @PrimaryKey val id: Int = 1,
    val discomfort: String? = null,
    val onboardingDone: Boolean = false,
) {
    val discomfortValue: Discomfort? get() = Discomfort.fromWire(discomfort)
}
