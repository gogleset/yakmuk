package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.constants.CareGlance
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.user.FamilyRoles
import com.jinlabs.yakok.core.user.UserRole

object MemberStatus {
    fun label(hasUnackedAlert: Boolean, pendingCount: Int, totalMeds: Int): String = when {
        hasUnackedAlert -> Copy.Family.StatusAnbu
        totalMeds <= 0 -> Copy.Family.StatusNoMeds
        pendingCount == 0 -> Copy.Family.StatusAllTaken
        else -> Copy.Family.StatusInProgress
    }

    fun label(member: MemberTodayStatus): String =
        label(member.hasUnackedAlert, member.pendingCount, member.totalMeds)
}

object Glance {
    fun isViewer(role: UserRole?): Boolean = FamilyRoles.canViewGlance(role)

    fun pickMember(
        members: List<MemberTodayStatus>,
        excludeUserId: String?,
    ): MemberTodayStatus? {
        val others = members.filter { it.userId != excludeUserId }
        if (others.isEmpty()) return null
        val careRecipients = others.filter { it.role == UserRole.CareRecipient }
        val pool = careRecipients.ifEmpty { others }
        return pool.find { it.hasUnackedAlert } ?: pool.firstOrNull()
    }

    fun line(member: MemberTodayStatus): String {
        val who = member.nickname.trim().ifEmpty { Copy.Family.MemberFallback }
        return Copy.Family.glanceLine(who, MemberStatus.label(member))
    }

    /** 기본 ON — off/0/false만 끔 */
    fun parseOpt(raw: String?): Boolean = when (raw?.lowercase()) {
        "0", "false", "off" -> false
        else -> true
    }

    fun isStale(
        updatedAtMs: Long?,
        nowMs: Long,
        staleMinutes: Int = CareGlance.StaleMinutes,
    ): Boolean {
        if (updatedAtMs == null) return true
        return nowMs - updatedAtMs > staleMinutes * 60_000L
    }
}
