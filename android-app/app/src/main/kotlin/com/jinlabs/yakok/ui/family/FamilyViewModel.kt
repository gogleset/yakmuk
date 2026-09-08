package com.jinlabs.yakok.ui.family

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.alarm.CareGlanceController
import com.jinlabs.yakok.core.family.CareAlertSlide
import com.jinlabs.yakok.core.family.CareAlerts
import com.jinlabs.yakok.core.family.FamilyFeed
import com.jinlabs.yakok.core.family.FamilyFeedSection
import com.jinlabs.yakok.core.family.FamilyInfo
import com.jinlabs.yakok.core.family.FamilyMember
import com.jinlabs.yakok.core.family.FamilySeat
import com.jinlabs.yakok.core.family.FamilySeats
import com.jinlabs.yakok.core.family.FeedUnread
import com.jinlabs.yakok.core.family.Glance
import com.jinlabs.yakok.core.family.WeeklyDigest
import com.jinlabs.yakok.core.family.WeeklyDigestView
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.UserRole
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.FamilyRepository
import com.jinlabs.yakok.data.PrefsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

data class FamilyUiState(
    val loading: Boolean = true,
    val myUserId: String? = null,
    val myRole: UserRole? = null,
    val familyId: String? = null,
    val family: FamilyInfo? = null,
    val members: List<FamilyMember> = emptyList(),
    val invites: List<FamilyInvite> = emptyList(),
    val seats: List<FamilySeat> = emptyList(),
    val slides: List<CareAlertSlide> = emptyList(),
    val previewSections: List<FamilyFeedSection> = emptyList(),
    val weekSections: List<FamilyFeedSection> = emptyList(),
    val feedCount: Int = 0,
    val hasUnread: Boolean = false,
    val unreadDates: Set<String> = emptySet(),
    val digest: WeeklyDigestView? = null,
    val error: String? = null,
    val busy: Boolean = false,
) {
    val isLeader: Boolean get() = myRole == UserRole.FamilyLeader
    val hasMembers: Boolean get() = members.any { it.role != UserRole.FamilyLeader }
    val familyEmpty: Boolean get() = !loading && !hasMembers && !isLeader
}

@HiltViewModel
class FamilyViewModel @Inject constructor(
    private val auth: AuthRepository,
    private val family: FamilyRepository,
    private val prefs: PrefsRepository,
    private val glance: CareGlanceController,
) : ViewModel() {

    private val _state = MutableStateFlow(FamilyUiState())
    val state: StateFlow<FamilyUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private val _openedInvite = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val openedInvite: SharedFlow<String> = _openedInvite.asSharedFlow()

    private var watchJob: Job? = null
    private var refreshJob: Job? = null

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch { load() }
    }

    fun ack(slideId: String) {
        viewModelScope.launch {
            runCatching { family.ackAlert(slideId) }
                .onFailure { fail(Errors.Family.AckFailed, it) }
            load()
        }
    }

    fun markDayRead(dateYmd: String) {
        val s = _state.value
        val uid = s.myUserId ?: return
        val fid = s.familyId ?: return
        viewModelScope.launch {
            runCatching { family.markFeedDayRead(uid, fid, dateYmd) }
            load()
        }
    }

    fun ackDigest() {
        val week = _state.value.digest?.weekStartYmd ?: return
        viewModelScope.launch {
            prefs.dismissWeeklyWeek(week)
            _state.update { it.copy(digest = null) }
        }
    }

    fun kick(userId: String) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { family.removeMember(userId) }
                .onFailure { fail(Errors.Family.RemoveMemberFailed, it) }
            _state.update { it.copy(busy = false) }
            load()
        }
    }

    fun reissueInvite(inviteId: String) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { family.reissueInvite(inviteId) }
                .onSuccess { invite ->
                    _state.update { it.copy(busy = false) }
                    load()
                    _openedInvite.tryEmit(invite.id)
                }
                .onFailure { fail(Errors.Invite.ReissueFailed, it) }
        }
    }

    fun deleteInvite(inviteId: String) {
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { family.deleteInvite(inviteId) }
                .onFailure { fail(Errors.Invite.DeleteFailed, it) }
            _state.update { it.copy(busy = false) }
            load()
        }
    }

    private suspend fun load() {
        val today = Kst.todayDateString(Clock.System.now())
        val profile = auth.getProfile()
        val uid = profile?.id
        val fid = profile?.familyId
        if (uid == null || fid == null) {
            _state.update { it.copy(loading = false, error = Errors.Auth.Required) }
            return
        }
        _state.update {
            it.copy(
                loading = it.members.isEmpty() && it.loading,
                myUserId = uid,
                myRole = profile.role,
                familyId = fid,
            )
        }
        bindRealtime(fid)
        runCatching {
            val members = family.listMembers(fid)
            val invites = if (profile.role == UserRole.FamilyLeader) family.listInvites() else emptyList()
            val info = family.getFamily(fid)
            val since = Kst.addDays(today, -(Limits.FamilyFeedWindowDays - 1))
            val feed = family.listFeed(fid, since).filter { it.userId != uid }
            val alerts = family.listAlerts(fid).filter { it.userId != uid }
            val reads = family.listFeedDayReads(fid)
            val digest = runCatching {
                if (Glance.isViewer(profile.role) && prefs.isWeeklyDigestOpt()) {
                    val view = family.listWeeklyDigest(fid)
                    if (WeeklyDigest.isDismissed(view.weekStartYmd, prefs.dismissedWeeklyWeek())) null else view
                } else {
                    null
                }
            }.getOrNull()
            runCatching { glance.syncForCurrentUser() }
            Triple(Triple(members, invites, info), Triple(feed, alerts, reads), digest)
        }.onSuccess { (triple, rest, digest) ->
            val (members, invites, info) = triple
            val (feed, alerts, reads) = rest
            val week = FamilyFeed.groupByDate(
                FamilyFeed.filterLastDays(feed, today, Limits.FamilyFeedWindowDays),
                today,
            )
            val todaySections = FamilyFeed.groupByDate(
                FamilyFeed.filterLastDays(feed, today, 1),
                today,
            )
            val preview = FamilyFeed.sliceSections(todaySections, Limits.FamilyFeedPreviewCount)
            val readsByDate = FeedUnread.readsByDate(reads)
            val unread = todaySections.filter { section ->
                FeedUnread.isSectionUnread(
                    section.dateYmd,
                    section.data.map { it.logDate to it.createdAt },
                    readsByDate,
                )
            }.map { it.dateYmd }.toSet()
            _state.update {
                it.copy(
                    loading = false,
                    family = info,
                    members = members,
                    invites = invites,
                    seats = FamilySeats.build(members, invites, Limits.MaxFamilyInvites),
                    slides = CareAlerts.toSlides(alerts),
                    previewSections = preview,
                    weekSections = week,
                    feedCount = todaySections.sumOf { s -> s.data.size },
                    hasUnread = FeedUnread.hasUnreadDays(week, readsByDate),
                    unreadDates = unread,
                    digest = digest,
                    error = null,
                )
            }
        }.onFailure { e ->
            _state.update { it.copy(loading = false) }
            fail(Copy.Family.LoadFailed, e)
        }
    }

    private fun bindRealtime(familyId: String) {
        if (watchJob?.isActive == true) return
        watchJob = viewModelScope.launch {
            launch {
                family.watchFeed(familyId).collect { scheduleRefresh() }
            }
            launch {
                family.watchRoster(familyId).collect { scheduleRefresh() }
            }
        }
    }

    private fun scheduleRefresh() {
        refreshJob?.cancel()
        refreshJob = viewModelScope.launch {
            delay(250)
            load()
        }
    }

    private fun fail(fallback: String, error: Throwable) {
        val msg = formatUserFacingError(error, fallback)
        _state.update { it.copy(error = msg, busy = false) }
        _messages.tryEmit(msg)
    }
}
