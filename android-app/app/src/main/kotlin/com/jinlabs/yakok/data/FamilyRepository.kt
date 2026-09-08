package com.jinlabs.yakok.data

import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.family.FamilyAlert
import com.jinlabs.yakok.core.family.FamilyFeedDayRead
import com.jinlabs.yakok.core.family.FamilyInfo
import com.jinlabs.yakok.core.family.FamilyMappers
import com.jinlabs.yakok.core.family.FamilyMember
import com.jinlabs.yakok.core.family.MemberTodayStatus
import com.jinlabs.yakok.core.family.WeeklyDigest
import com.jinlabs.yakok.core.family.WeeklyDigestView
import com.jinlabs.yakok.core.family.DayDigestInput
import com.jinlabs.yakok.core.constants.WeeklyDigest as WeeklyDigestLimits
import com.jinlabs.yakok.core.med.ConditionValue
import com.jinlabs.yakok.core.med.DailyLog
import com.jinlabs.yakok.core.med.DaysMask
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.UserMappers
import com.jinlabs.yakok.core.user.UserRole
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Columns
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresChangeFlow
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.channelFlow
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject

@Serializable
private data class FamilyInviteRow(
    val id: String,
    @SerialName("family_id") val familyId: String,
    @SerialName("invite_code") val inviteCode: String,
    @SerialName("invited_as") val invitedAs: String,
    @SerialName("target_role") val targetRole: String,
    @SerialName("claimed_by") val claimedBy: String? = null,
    @SerialName("claimed_at") val claimedAt: String? = null,
    @SerialName("reentry_user_id") val reentryUserId: String? = null,
)

@Serializable
private data class FamilyAlertRow(
    val id: String,
    @SerialName("family_id") val familyId: String,
    @SerialName("user_id") val userId: String,
    val kind: String,
    val message: String,
    @SerialName("created_at") val createdAt: String,
    @SerialName("acked_at") val ackedAt: String? = null,
    val users: NickEmbed? = null,
)

@Serializable
private data class FamilyInfoRow(
    val id: String,
    val name: String,
    @SerialName("created_by") val createdBy: String,
)

@Serializable
private data class FeedReadRow(
    @SerialName("family_id") val familyId: String,
    @SerialName("user_id") val userId: String,
    @SerialName("log_date") val logDate: String,
    @SerialName("read_at") val readAt: String,
)

@Serializable
private data class IdNickRow(val id: String, val nickname: String)

@Serializable
private data class IdNameRow(val id: Long, val name: String)

@Singleton
class FamilyRepository @Inject constructor(
    private val supabase: SupabaseClient,
) {
    suspend fun getFamily(familyId: String): FamilyInfo? {
        val row = supabase.from("families").select {
            filter { eq("id", familyId) }
        }.decodeSingleOrNull<FamilyInfoRow>() ?: return null
        return FamilyInfo(row.id, row.name, row.createdBy)
    }

    suspend fun listMembers(familyId: String): List<FamilyMember> =
        supabase.from("users").select {
            filter { eq("family_id", familyId) }
            order("role", Order.ASCENDING)
            order("nickname", Order.ASCENDING)
        }.decodeList<UserRow>().map { row ->
            FamilyMappers.mapFamilyMember(
                mapOf(
                    "id" to row.id,
                    "nickname" to row.nickname,
                    "invited_as" to row.invitedAs,
                    "role" to row.role,
                ),
            )
        }

    suspend fun listInvites(): List<FamilyInvite> =
        supabase.from("family_invites").select {
            order("created_at", Order.DESCENDING)
        }.decodeList<FamilyInviteRow>().map { it.toInvite() }

    suspend fun listFeed(familyId: String, sinceLogDate: String?): List<DailyLog> {
        val joined = Columns.raw(
            "*, users!daily_logs_user_id_fkey(nickname), medications(name)",
        )
        return runCatching { queryFeed(familyId, sinceLogDate, joined) }
            .getOrElse { hydrateFeed(queryFeed(familyId, sinceLogDate, Columns.ALL)) }
    }

    suspend fun listAlerts(familyId: String): List<FamilyAlert> {
        val joined = Columns.raw("*, users!family_alerts_user_id_fkey(nickname)")
        val alerts = runCatching {
            queryAlerts(familyId, joined)
        }.getOrElse {
            hydrateAlerts(queryAlerts(familyId, Columns.ALL))
        }
        return alerts.filter { it.ackedAt == null }
    }

    suspend fun listTodayStatus(familyId: String, dateKst: String = Kst.todayDateString(Clock.System.now())): List<MemberTodayStatus> {
        val members = supabase.from("users").select {
            filter { eq("family_id", familyId) }
            order("nickname", Order.ASCENDING)
        }.decodeList<UserRow>()
        if (members.isEmpty()) return emptyList()
        val memberIds = members.map { it.id }
        val meds = supabase.from("medications").select {
            filter { isIn("user_id", memberIds) }
        }.decodeList<StatusMedRow>().filter { it.deletedAt == null }
        val logs = supabase.from("daily_logs").select {
            filter {
                eq("family_id", familyId)
                eq("log_date", dateKst)
                isIn("user_id", memberIds)
            }
        }.decodeList<StatusLogRow>()
        val alerts = supabase.from("family_alerts").select {
            filter {
                eq("family_id", familyId)
                isIn("user_id", memberIds)
            }
        }.decodeList<AlertUserRow>().filter { it.ackedAt == null }
        val alertUsers = alerts.map { it.userId }.toSet()
        val weekday = Kst.weekdayMon0(dateKst)
        return members.map { member ->
            val userMeds = meds.filter {
                it.userId == member.id && DaysMask.isScheduledOnWeekday(it.daysMask ?: "daily", weekday)
            }
            val userLogs = logs.filter { it.userId == member.id }
            val takenIds = userLogs.filter { it.status == "TAKEN" && it.medicationId != null }
                .mapNotNull { it.medicationId }
                .toSet()
            val conditionLog = userLogs.find { it.condition != null }
            val total = userMeds.size
            val taken = userMeds.count { it.id in takenIds }
            MemberTodayStatus(
                userId = member.id,
                nickname = member.nickname,
                invitedAs = member.invitedAs,
                role = UserRole.fromWire(member.role),
                totalMeds = total,
                takenCount = taken,
                pendingCount = maxOf(0, total - taken),
                condition = ConditionValue.fromWire(conditionLog?.condition),
                conditionMessage = conditionLog?.message,
                hasUnackedAlert = member.id in alertUsers,
            )
        }
    }

    suspend fun listWeeklyDigest(
        familyId: String,
        todayKst: String = Kst.todayDateString(Clock.System.now()),
    ): WeeklyDigestView {
        val weekStart = WeeklyDigest.weekStartMondayKst(todayKst)
        val dayCount = WeeklyDigestLimits.DayCount
        val fromDate = Kst.addDays(todayKst, -(dayCount - 1))
        val recipients = supabase.from("users").select {
            filter {
                eq("family_id", familyId)
                eq("role", UserRole.CareRecipient.wire)
            }
        }.decodeList<IdOnlyRow>()
        val memberIds = recipients.map { it.id }
        if (memberIds.isEmpty()) return WeeklyDigest.build(emptyList(), weekStart)
        val meds = supabase.from("medications").select {
            filter { isIn("user_id", memberIds) }
        }.decodeList<StatusMedRow>().filter { it.deletedAt == null }
        val logs = supabase.from("daily_logs").select {
            filter {
                eq("family_id", familyId)
                gte("log_date", fromDate)
                lte("log_date", todayKst)
                isIn("user_id", memberIds)
            }
        }.decodeList<StatusLogRow>()
        val days = (0 until dayCount).map { i ->
            val dateYmd = Kst.addDays(fromDate, i)
            var totalMeds = 0
            var takenCount = 0
            var condition: ConditionValue? = null
            val weekday = Kst.weekdayMon0(dateYmd)
            for (userId in memberIds) {
                val userMeds = meds.filter {
                    it.userId == userId && DaysMask.isScheduledOnWeekday(it.daysMask ?: "daily", weekday)
                }
                val userLogs = logs.filter { it.userId == userId && it.logDate == dateYmd }
                val takenIds = userLogs.filter { it.status == "TAKEN" && it.medicationId != null }
                    .mapNotNull { it.medicationId }
                    .toSet()
                totalMeds += userMeds.size
                takenCount += userMeds.count { it.id in takenIds }
                val bad = userLogs.find { it.condition == "BAD" }
                if (bad != null) condition = ConditionValue.Bad
                else if (condition == null) {
                    condition = ConditionValue.fromWire(userLogs.find { it.condition != null }?.condition)
                }
            }
            DayDigestInput(dateYmd, totalMeds, takenCount, condition)
        }
        return WeeklyDigest.build(days, weekStart)
    }

    suspend fun listFeedDayReads(familyId: String): List<FamilyFeedDayRead> =
        supabase.from("family_feed_day_reads").select {
            filter { eq("family_id", familyId) }
            order("log_date", Order.DESCENDING)
        }.decodeList<FeedReadRow>().map {
            FamilyMappers.mapFamilyFeedDayRead(
                mapOf(
                    "family_id" to it.familyId,
                    "user_id" to it.userId,
                    "log_date" to it.logDate,
                    "read_at" to it.readAt,
                ),
            )
        }

    suspend fun ackAlert(alertId: String) {
        runCatching {
            supabase.from("family_alerts").update(
                buildJsonObject {
                    put("acked_at", JsonPrimitive(Clock.System.now().toString()))
                },
            ) { filter { eq("id", alertId) } }
        }.onFailure { throw wrap(it, Errors.Family.AckFailed) }
    }

    suspend fun markFeedDayRead(userId: String, familyId: String, logDate: String) {
        supabase.from("family_feed_day_reads").upsert(
            buildJsonObject {
                put("user_id", JsonPrimitive(userId))
                put("family_id", JsonPrimitive(familyId))
                put("log_date", JsonPrimitive(logDate))
                put("read_at", JsonPrimitive(Clock.System.now().toString()))
            },
        ) {
            onConflict = "user_id,family_id,log_date"
        }
    }

    suspend fun createInvite(invitedAs: String, targetRole: UserRole): FamilyInvite {
        val label = invitedAs.trim()
        if (label.isEmpty()) throw IllegalStateException(Errors.Invite.LabelRequired)
        val result = runCatching {
            supabase.postgrest.rpc(
                "create_family_invite",
                buildJsonObject {
                    put("p_invited_as", JsonPrimitive(label))
                    put("p_target_role", JsonPrimitive(targetRole.wire))
                },
            )
        }.getOrElse { throw wrap(it, Errors.Invite.CreateFailed) }
        val obj = result.decodeObject() ?: throw IllegalStateException(Errors.Invite.CreateFailed)
        return UserMappers.mapFamilyInvite(obj.toPlainMap())
    }

    suspend fun reissueInvite(inviteId: String): FamilyInvite {
        val result = runCatching {
            supabase.postgrest.rpc(
                "reissue_invite_code",
                buildJsonObject { put("p_invite_id", JsonPrimitive(inviteId)) },
            )
        }.getOrElse { throw wrap(it, Errors.Invite.ReissueFailed) }
        val obj = result.decodeObject() ?: throw IllegalStateException(Errors.Invite.ReissueFailed)
        return UserMappers.mapFamilyInvite(obj.toPlainMap())
    }

    suspend fun deleteInvite(inviteId: String) {
        runCatching {
            supabase.postgrest.rpc(
                "delete_family_invite",
                buildJsonObject { put("p_invite_id", JsonPrimitive(inviteId)) },
            )
        }.onFailure { throw wrap(it, Errors.Invite.DeleteFailed) }
    }

    suspend fun removeMember(userId: String) {
        runCatching {
            supabase.postgrest.rpc(
                "remove_family_member",
                buildJsonObject { put("p_user_id", JsonPrimitive(userId)) },
            )
        }.onFailure { throw wrap(it, Errors.Family.RemoveMemberFailed) }
    }

    fun watchFeed(familyId: String): Flow<Unit> = watchTables(
        topic = "feed:$familyId",
        tables = listOf("daily_logs", "family_alerts"),
        familyId = familyId,
    )

    fun watchRoster(familyId: String): Flow<Unit> = watchTables(
        topic = "roster:$familyId",
        tables = listOf("family_invites", "users"),
        familyId = familyId,
    )

    private fun watchTables(
        topic: String,
        tables: List<String>,
        familyId: String,
    ): Flow<Unit> = channelFlow {
        val channel = supabase.channel(topic)
        val jobs = tables.map { table ->
            val changes = channel.postgresChangeFlow<PostgresAction>(schema = "public") {
                this.table = table
                filter("family_id", FilterOperator.EQ, familyId)
            }
            launch { changes.collect { trySend(Unit) } }
        }
        try {
            channel.subscribe()
            awaitCancellation()
        } finally {
            jobs.forEach { it.cancel() }
            runCatching { channel.unsubscribe() }
        }
    }

    private suspend fun queryFeed(
        familyId: String,
        sinceLogDate: String?,
        columns: Columns,
    ): List<DailyLog> =
        supabase.from("daily_logs").select(columns) {
            filter {
                eq("family_id", familyId)
                if (sinceLogDate != null) gte("log_date", sinceLogDate)
            }
            order("created_at", Order.DESCENDING)
            limit(80)
        }.decodeList<DailyLogRow>().map { it.toDailyLog() }

    private suspend fun queryAlerts(familyId: String, columns: Columns): List<FamilyAlert> =
        supabase.from("family_alerts").select(columns) {
            filter { eq("family_id", familyId) }
            order("created_at", Order.DESCENDING)
            limit(20)
        }.decodeList<FamilyAlertRow>().map { it.toAlert() }

    private suspend fun hydrateFeed(logs: List<DailyLog>): List<DailyLog> {
        val userIds = logs.map { it.userId }.distinct()
        val medIds = logs.mapNotNull { it.medicationId }.distinct()
        val nicks = if (userIds.isEmpty()) emptyMap() else {
            supabase.from("users").select {
                filter { isIn("id", userIds) }
            }.decodeList<IdNickRow>().associate { it.id to it.nickname }
        }
        val names = if (medIds.isEmpty()) emptyMap() else {
            supabase.from("medications").select {
                filter { isIn("id", medIds) }
            }.decodeList<IdNameRow>().associate { it.id to it.name }
        }
        return logs.map { log ->
            log.copy(
                nickname = nicks[log.userId] ?: log.nickname,
                medicationName = log.medicationId?.let { names[it] } ?: log.medicationName,
            )
        }
    }

    private suspend fun hydrateAlerts(alerts: List<FamilyAlert>): List<FamilyAlert> {
        val userIds = alerts.map { it.userId }.distinct()
        if (userIds.isEmpty()) return alerts
        val nicks = supabase.from("users").select {
            filter { isIn("id", userIds) }
        }.decodeList<IdNickRow>().associate { it.id to it.nickname }
        return alerts.map { it.copy(nickname = nicks[it.userId] ?: it.nickname) }
    }

    private fun wrap(error: Throwable, fallback: String): Throwable =
        IllegalStateException(formatUserFacingError(error, fallback), error)
}

@Serializable
private data class StatusMedRow(
    val id: Long,
    @SerialName("user_id") val userId: String,
    @SerialName("days_mask") val daysMask: String? = null,
    @SerialName("deleted_at") val deletedAt: String? = null,
)

@Serializable
private data class StatusLogRow(
    @SerialName("user_id") val userId: String,
    @SerialName("medication_id") val medicationId: Long? = null,
    val status: String? = null,
    val condition: String? = null,
    val message: String? = null,
    @SerialName("log_date") val logDate: String? = null,
)

@Serializable
private data class AlertUserRow(
    @SerialName("user_id") val userId: String,
    @SerialName("acked_at") val ackedAt: String? = null,
)

@Serializable
private data class IdOnlyRow(val id: String)

private fun FamilyInviteRow.toInvite() = UserMappers.mapFamilyInvite(
    mapOf(
        "id" to id,
        "family_id" to familyId,
        "invite_code" to inviteCode,
        "invited_as" to invitedAs,
        "target_role" to targetRole,
        "claimed_by" to claimedBy,
        "claimed_at" to claimedAt,
        "reentry_user_id" to reentryUserId,
    ),
)

private fun FamilyAlertRow.toAlert() = FamilyMappers.mapFamilyAlert(
    mapOf(
        "id" to id,
        "family_id" to familyId,
        "user_id" to userId,
        "kind" to kind,
        "message" to message,
        "created_at" to createdAt,
        "acked_at" to ackedAt,
        "users" to users?.let { mapOf("nickname" to it.nickname) },
    ),
)
