package com.jinlabs.yakok.ui.family

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.family.FamilyFeed
import com.jinlabs.yakok.core.family.FamilyFeedSection
import com.jinlabs.yakok.core.family.FeedUnread
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.data.AuthRepository
import com.jinlabs.yakok.data.FamilyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

data class FamilyFeedUiState(
    val loading: Boolean = true,
    val sections: List<FamilyFeedSection> = emptyList(),
    val unreadDates: Set<String> = emptySet(),
    val error: String? = null,
    val myUserId: String? = null,
)

@HiltViewModel
class FamilyFeedViewModel @Inject constructor(
    private val auth: AuthRepository,
    private val family: FamilyRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(FamilyFeedUiState())
    val state: StateFlow<FamilyFeedUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            val today = Kst.todayDateString(Clock.System.now())
            val profile = auth.getProfile()
            val uid = profile?.id
            val fid = profile?.familyId
            if (uid == null || fid == null) {
                _state.update { it.copy(loading = false, error = Errors.Auth.Required) }
                return@launch
            }
            runCatching {
                val since = Kst.addDays(today, -(Limits.FamilyFeedWindowDays - 1))
                val feed = family.listFeed(fid, since).filter { it.userId != uid }
                val reads = family.listFeedDayReads(fid)
                feed to reads
            }.onSuccess { (feed, reads) ->
                val sections = FamilyFeed.groupByDate(
                    FamilyFeed.filterLastDays(feed, today, Limits.FamilyFeedWindowDays),
                    today,
                )
                val readsByDate = FeedUnread.readsByDate(reads)
                val unread = sections.filter {
                    FeedUnread.isSectionUnread(
                        it.dateYmd,
                        it.data.map { log -> log.logDate to log.createdAt },
                        readsByDate,
                    )
                }.map { it.dateYmd }.toSet()
                _state.update {
                    it.copy(
                        loading = false,
                        sections = sections,
                        unreadDates = unread,
                        myUserId = uid,
                        error = null,
                    )
                }
            }.onFailure { e ->
                _state.update {
                    it.copy(
                        loading = false,
                        error = formatUserFacingError(e, Copy.Family.LoadFailedFeed),
                    )
                }
            }
        }
    }

    fun markDayRead(dateYmd: String) {
        viewModelScope.launch {
            val uid = _state.value.myUserId ?: auth.currentUserId() ?: return@launch
            val fid = auth.getProfile()?.familyId ?: return@launch
            runCatching { family.markFeedDayRead(uid, fid, dateYmd) }
            refresh()
        }
    }
}
