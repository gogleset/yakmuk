package com.jinlabs.yakok.core.user

object UserMappers {
    fun mapUser(row: Map<String, Any?>): AppUser = AppUser(
        id = row.str("id"),
        nickname = row.str("nickname"),
        invitedAs = row.strOrNull("invited_as"),
        role = UserRole.fromWire(row.strOrNull("role")),
        familyId = row.strOrNull("family_id"),
        pushToken = row.strOrNull("push_token") ?: row.strOrNull("expo_push_token"),
        forceSignOutAt = row.strOrNull("force_sign_out_at"),
    )

    fun parseInvitePeek(row: Map<String, Any?>): InvitePeek {
        val kind = when (row.strOrNull("kind")) {
            "recovery" -> JoinPeekKind.Recovery
            else -> JoinPeekKind.Invite
        }
        return InvitePeek(
            kind = kind,
            familyName = row.str("family_name"),
            invitedAs = row.str("invited_as"),
            targetRole = UserRole.fromWire(row.strOrNull("target_role")),
            leaderNickname = row.strOrNull("leader_nickname") ?: "가족장",
            nickname = row.strOrNull("nickname"),
            memberNicknames = parseNicknames(row["member_nicknames"]),
        )
    }

    fun mapFamilyInvite(row: Map<String, Any?>): FamilyInvite = FamilyInvite(
        id = row.str("id"),
        familyId = row.str("family_id"),
        inviteCode = row.str("invite_code"),
        invitedAs = row.str("invited_as"),
        targetRole = UserRole.fromWire(row.strOrNull("target_role")),
        claimedBy = row.strOrNull("claimed_by"),
        claimedAt = row.strOrNull("claimed_at"),
        reentryUserId = row.strOrNull("reentry_user_id"),
    )

    fun parseNicknames(raw: Any?): List<String> {
        if (raw !is List<*>) return emptyList()
        return raw.mapNotNull { (it as? String)?.trim()?.takeIf { s -> s.isNotEmpty() } }
    }
}

private fun Map<String, Any?>.str(key: String): String = strOrNull(key).orEmpty()

private fun Map<String, Any?>.strOrNull(key: String): String? {
    val v = this[key] ?: return null
    val s = v.toString().trim()
    return s.takeIf { it.isNotEmpty() && it != "null" }
}
