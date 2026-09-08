package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.med.ConditionValue
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.UserRole

enum class FamilyAlertKind {
    BadCondition,
    StuckEscalate,
    ;

    val wire: String
        get() = when (this) {
            BadCondition -> "bad_condition"
            StuckEscalate -> "stuck_escalate"
        }

    companion object {
        fun fromWire(raw: String?): FamilyAlertKind = when (raw) {
            "stuck_escalate" -> StuckEscalate
            else -> BadCondition
        }
    }
}

data class FamilyAlert(
    val id: String,
    val familyId: String,
    val userId: String,
    val kind: FamilyAlertKind,
    val message: String,
    val createdAt: String,
    val ackedAt: String?,
    val nickname: String?,
)

data class FamilyMember(
    val userId: String,
    val nickname: String,
    val invitedAs: String?,
    val role: UserRole,
)

data class MemberTodayStatus(
    val userId: String,
    val nickname: String,
    val invitedAs: String?,
    val role: UserRole,
    val totalMeds: Int,
    val takenCount: Int,
    val pendingCount: Int,
    val condition: ConditionValue?,
    val conditionMessage: String?,
    val hasUnackedAlert: Boolean,
)

data class FamilyInfo(
    val id: String,
    val name: String,
    val createdBy: String,
)

data class FamilyFeedDayRead(
    val familyId: String,
    val userId: String,
    val logDate: String,
    val readAt: String,
)

data class FamilyFeedSection(
    val dateYmd: String,
    val title: String,
    val data: List<DailyLog>,
)

enum class CareAlertTone { Stuck, Bad }

data class CareAlertSlide(
    val id: String,
    val tone: CareAlertTone,
    val title: String,
    val body: String,
    val alertId: String,
)

enum class FamilySeatPendingKind { Waiting, Reentry }

sealed class FamilySeat {
    data class Member(
        val userId: String,
        val nickname: String,
        val invitedAs: String?,
        val role: UserRole,
        val inviteId: String?,
    ) : FamilySeat()

    data class Pending(
        val invite: FamilyInvite,
        val pendingKind: FamilySeatPendingKind,
    ) : FamilySeat()

    data object Empty : FamilySeat()
}
