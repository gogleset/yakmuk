package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.user.UserRole

object FamilyMappers {
    fun mapFamilyAlert(row: Map<String, Any?>): FamilyAlert {
        val users = row["users"] as? Map<*, *>
        return FamilyAlert(
            id = row.str("id"),
            familyId = row.str("family_id"),
            userId = row.str("user_id"),
            kind = FamilyAlertKind.fromWire(row.strOrNull("kind")),
            message = row.str("message"),
            createdAt = row.str("created_at"),
            ackedAt = row.strOrNull("acked_at"),
            nickname = users?.get("nickname")?.toString()?.trim()?.takeIf { it.isNotEmpty() },
        )
    }

    fun mapFamilyFeedDayRead(row: Map<String, Any?>): FamilyFeedDayRead = FamilyFeedDayRead(
        familyId = row.str("family_id"),
        userId = row.str("user_id"),
        logDate = row.str("log_date").take(10),
        readAt = row.str("read_at"),
    )

    fun mapFamilyMember(row: Map<String, Any?>): FamilyMember = FamilyMember(
        userId = row.str("id").ifEmpty { row.str("user_id") },
        nickname = row.str("nickname"),
        invitedAs = row.strOrNull("invited_as"),
        role = UserRole.fromWire(row.strOrNull("role")),
    )

    fun mapFamilyInfo(row: Map<String, Any?>): FamilyInfo = FamilyInfo(
        id = row.str("id"),
        name = row.str("name"),
        createdBy = row.str("created_by"),
    )
}

private fun Map<String, Any?>.str(key: String): String = strOrNull(key).orEmpty()

private fun Map<String, Any?>.strOrNull(key: String): String? {
    val v = this[key] ?: return null
    val s = v.toString().trim()
    return s.takeIf { it.isNotEmpty() && it != "null" }
}
