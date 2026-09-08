package com.jinlabs.yakok.alarm

import com.jinlabs.yakok.core.family.Glance
import com.jinlabs.yakok.core.family.MemberTodayStatus
import com.jinlabs.yakok.core.user.UserRole
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.FamilyRepository
import com.jinlabs.yakok.data.PrefsRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CareGlanceController @Inject constructor(
    private val auth: AuthRepository,
    private val family: FamilyRepository,
    private val prefs: PrefsRepository,
    private val permissions: AlarmPermissions,
    private val notifier: CareGlanceNotifier,
) {
    @Volatile private var lastKey: String? = null

    suspend fun syncForCurrentUser() {
        val profile = auth.getProfile()
        val familyId = profile?.familyId
        if (profile == null || familyId == null) {
            cancel()
            return
        }
        val members = runCatching { family.listTodayStatus(familyId) }.getOrDefault(emptyList())
        sync(profile.role, profile.id, members)
    }

    suspend fun sync(role: UserRole?, myUserId: String?, members: List<MemberTodayStatus>) {
        if (!Glance.isViewer(role) || !prefs.isCareGlanceOpt()) {
            cancel()
            return
        }
        if (!permissions.hasPostNotifications()) {
            notifier.cancel()
            return
        }
        val member = Glance.pickMember(members, myUserId)
        if (member == null) {
            cancel()
            return
        }
        val line = Glance.line(member)
        val key = "${member.userId}:$line"
        if (key == lastKey) return
        notifier.show(line)
        lastKey = key
        prefs.setCareGlanceUpdatedAt(System.currentTimeMillis())
    }

    suspend fun cancel() {
        lastKey = null
        notifier.cancel()
    }
}
