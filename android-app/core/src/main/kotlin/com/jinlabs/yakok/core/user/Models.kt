package com.jinlabs.yakok.core.user

enum class UserRole {
    FamilyLeader,
    Guardian,
    CareRecipient,
    ;

    val wire: String
        get() = when (this) {
            FamilyLeader -> "family_leader"
            Guardian -> "guardian"
            CareRecipient -> "care_recipient"
        }

    companion object {
        fun fromWire(raw: String?): UserRole = when (raw) {
            "guardian" -> Guardian
            "care_recipient" -> CareRecipient
            else -> FamilyLeader
        }
    }
}

data class AppUser(
    val id: String,
    val nickname: String,
    val invitedAs: String?,
    val role: UserRole,
    val familyId: String?,
    val pushToken: String?,
    val forceSignOutAt: String?,
)

enum class JoinPeekKind { Invite, Recovery }

data class InvitePeek(
    val kind: JoinPeekKind,
    val familyName: String,
    val invitedAs: String,
    val targetRole: UserRole,
    val leaderNickname: String,
    val nickname: String?,
    val memberNicknames: List<String>,
)

data class FamilyInvite(
    val id: String,
    val familyId: String,
    val inviteCode: String,
    val invitedAs: String,
    val targetRole: UserRole,
    val claimedBy: String?,
    val claimedAt: String?,
    val reentryUserId: String?,
)

object FamilyRoles {
    fun canCreateInvite(actor: UserRole): Boolean = actor == UserRole.FamilyLeader

    fun canManageMemberMeds(actor: UserRole?, target: UserRole?): Boolean {
        if (actor == null || target == null) return false
        return (actor == UserRole.FamilyLeader || actor == UserRole.Guardian) &&
            target == UserRole.CareRecipient
    }

    fun canCreateInviteInput(targetRole: UserRole?, invitedAs: String): Boolean {
        if (targetRole != UserRole.Guardian && targetRole != UserRole.CareRecipient) return false
        return invitedAs.trim().isNotEmpty()
    }

    fun displayNickname(nickname: String, invitedAs: String?): String {
        val nick = nickname.trim()
        if (nick.isNotEmpty()) return nick
        return invitedAs?.trim()?.takeIf { it.isNotEmpty() } ?: "이름 없음"
    }

    fun canViewGlance(actor: UserRole?): Boolean =
        actor == UserRole.FamilyLeader || actor == UserRole.Guardian
}
