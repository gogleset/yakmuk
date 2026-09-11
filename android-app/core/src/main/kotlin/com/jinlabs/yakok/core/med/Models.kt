package com.jinlabs.yakok.core.med

enum class ConditionValue {
    Good,
    Normal,
    Bad,
    ;

    val wire: String
        get() = when (this) {
            Good -> "GOOD"
            Normal -> "NORMAL"
            Bad -> "BAD"
        }

    companion object {
        fun fromWire(raw: String?): ConditionValue? = when (raw) {
            "GOOD" -> Good
            "NORMAL" -> Normal
            "BAD" -> Bad
            else -> null
        }
    }
}

enum class LogStatus {
    Taken,
    Skipped,
    ;

    val wire: String
        get() = when (this) {
            Taken -> "TAKEN"
            Skipped -> "SKIPPED"
        }

    companion object {
        fun fromWire(raw: String?): LogStatus? = when (raw) {
            "TAKEN" -> Taken
            "SKIPPED" -> Skipped
            else -> null
        }
    }
}

data class Medication(
    val id: Long,
    val userId: String,
    val name: String,
    val scheduledTime: String,
    val daysMask: String,
    val createdAt: String,
    val deletedAt: String?,
    val itemSeq: String?,
    val color: String,
    val efficacy: String?,
    val useMethod: String?,
    val storage: String?,
    val warning: String?,
    val doseAmount: Double?,
    val doseUnit: String?,
    val notificationEnabled: Boolean,
    val purpose: MedPurpose? = null,
)

data class DailyLog(
    val id: Long,
    val medicationId: Long?,
    val userId: String,
    val logDate: String,
    val status: LogStatus?,
    val condition: ConditionValue?,
    val message: String?,
    val familyId: String,
    val createdAt: String,
    val nickname: String?,
    val medicationName: String?,
)

enum class DayMedStatus {
    Done,
    Partial,
    Missed,
    Scheduled,
    Empty,
}

data class DrugSearchItem(
    val itemSeq: String,
    val itemName: String,
    val entpName: String,
    val efficacy: String?,
    val useMethod: String?,
    val storage: String?,
    val warning: String?,
)

data class MedScheduleSlot(
    val scheduledTime: String,
    val daysMask: String,
    val notificationEnabled: Boolean = true,
)

data class MedicationMetaInput(
    val itemSeq: String? = null,
    val color: String? = null,
    val efficacy: String? = null,
    val useMethod: String? = null,
    val storage: String? = null,
    val warning: String? = null,
    val doseAmount: Double? = null,
    val doseUnit: String? = null,
    val purpose: MedPurpose? = null,
)

data class MedicationMetaFormFields(
    val efficacy: String = "",
    val useMethod: String = "",
    val storage: String = "",
    val warning: String = "",
    val doseAmount: String = "",
    val doseUnit: String? = null,
)

data class DayMedicationEntry(
    val key: String,
    val name: String,
    val scheduledTime: String?,
    val taken: Boolean,
    val color: String? = null,
    val doseAmount: Double? = null,
    val doseUnit: String? = null,
)

data class CalendarMark(
    val marked: Boolean = false,
    val dotColor: Long? = null,
    val selected: Boolean = false,
    val selectedColor: Long? = null,
)
