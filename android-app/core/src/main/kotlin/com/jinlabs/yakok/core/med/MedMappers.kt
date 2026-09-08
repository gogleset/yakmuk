package com.jinlabs.yakok.core.med

import com.jinlabs.yakok.core.constants.MedColors

object MedMappers {
    fun mapMedication(row: Map<String, Any?>): Medication = Medication(
        id = row.long("id"),
        userId = row.str("user_id"),
        name = row.str("name"),
        scheduledTime = row.str("scheduled_time").take(5),
        daysMask = row.str("days_mask").ifEmpty { "daily" },
        createdAt = row.str("created_at"),
        deletedAt = row.strOrNull("deleted_at"),
        itemSeq = row.strOrNull("item_seq"),
        color = row.strOrNull("color") ?: MedColors.DefaultId,
        efficacy = row.strOrNull("efficacy"),
        useMethod = row.strOrNull("use_method"),
        storage = row.strOrNull("storage"),
        warning = row.strOrNull("warning"),
        doseAmount = row.doubleOrNull("dose_amount"),
        doseUnit = row.strOrNull("dose_unit"),
        notificationEnabled = row["notification_enabled"] != false,
    )

    fun mapDailyLog(row: Map<String, Any?>): DailyLog {
        val users = row["users"] as? Map<*, *>
        val medications = row["medications"] as? Map<*, *>
        return DailyLog(
            id = row.long("id"),
            medicationId = row.longOrNull("medication_id"),
            userId = row.str("user_id"),
            logDate = row.str("log_date"),
            status = LogStatus.fromWire(row.strOrNull("status")),
            condition = ConditionValue.fromWire(row.strOrNull("condition")),
            message = row.strOrNull("message"),
            familyId = row.str("family_id"),
            createdAt = row.str("created_at"),
            nickname = users?.get("nickname")?.toString()?.trim()?.takeIf { it.isNotEmpty() },
            medicationName = medications?.get("name")?.toString()?.trim()?.takeIf { it.isNotEmpty() },
        )
    }
}

private fun Map<String, Any?>.str(key: String): String = strOrNull(key).orEmpty()

private fun Map<String, Any?>.strOrNull(key: String): String? {
    val v = this[key] ?: return null
    val s = v.toString().trim()
    return s.takeIf { it.isNotEmpty() && it != "null" }
}

private fun Map<String, Any?>.long(key: String): Long = longOrNull(key) ?: 0L

private fun Map<String, Any?>.longOrNull(key: String): Long? {
    val v = this[key] ?: return null
    return when (v) {
        is Number -> v.toLong()
        else -> v.toString().toLongOrNull()
    }
}

private fun Map<String, Any?>.doubleOrNull(key: String): Double? {
    val v = this[key] ?: return null
    if (v is String && v.isBlank()) return null
    return when (v) {
        is Number -> v.toDouble()
        else -> v.toString().toDoubleOrNull()
    }
}
