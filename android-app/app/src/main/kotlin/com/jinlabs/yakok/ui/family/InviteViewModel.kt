package com.jinlabs.yakok.ui.family

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.copy.formatUserFacingError
import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.FamilyRoles
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.core.user.UserRole
import com.jinlabs.yakok.data.FamilyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class InviteUiState(
    val targetRole: UserRole = UserRole.Guardian,
    val invitedAs: String = "",
    val custom: Boolean = false,
    val busy: Boolean = false,
    val invite: FamilyInvite? = null,
    val error: String? = null,
) {
    val canCreate: Boolean
        get() = FamilyRoles.canCreateInviteInput(targetRole, invitedAs)
    val shareText: String
        get() {
            val code = invite?.inviteCode ?: return ""
            return "${Copy.Invite.FunnelReadyBody}\n$code\n${JoinCodes.joinDeepLink(code)}"
        }
}

@HiltViewModel
class InviteViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val family: FamilyRepository,
) : ViewModel() {
    private val inviteId: String = savedStateHandle.get<String>("inviteId").orEmpty()

    private val _state = MutableStateFlow(InviteUiState())
    val state: StateFlow<InviteUiState> = _state.asStateFlow()

    private val _messages = MutableSharedFlow<String>(extraBufferCapacity = 1)
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    private val _deleted = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val deleted: SharedFlow<Unit> = _deleted.asSharedFlow()

    init {
        if (inviteId.isNotEmpty()) load()
    }

    fun setRole(role: UserRole) {
        _state.update { it.copy(targetRole = role) }
    }

    fun setInvitedAs(value: String) {
        _state.update { it.copy(invitedAs = value, custom = true) }
    }

    fun pickChip(label: String) {
        _state.update { it.copy(invitedAs = label, custom = false) }
    }

    fun create(onReady: (String) -> Unit) {
        val s = _state.value
        if (!s.canCreate) {
            _messages.tryEmit(Copy.Invite.LabelAlertBody)
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { family.createInvite(s.invitedAs, s.targetRole) }
                .onSuccess { invite ->
                    _state.update { it.copy(busy = false, invite = invite) }
                    onReady(invite.id)
                }
                .onFailure { e ->
                    _state.update { it.copy(busy = false) }
                    _messages.tryEmit(formatUserFacingError(e, Errors.Invite.CreateFailed))
                }
        }
    }

    fun reissue() {
        val id = _state.value.invite?.id ?: inviteId.takeIf { it.isNotEmpty() } ?: return
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { family.reissueInvite(id) }
                .onSuccess { invite -> _state.update { it.copy(busy = false, invite = invite) } }
                .onFailure { e ->
                    _state.update { it.copy(busy = false) }
                    _messages.tryEmit(formatUserFacingError(e, Errors.Invite.ReissueFailed))
                }
        }
    }

    fun delete() {
        val id = _state.value.invite?.id ?: inviteId.takeIf { it.isNotEmpty() } ?: return
        if (_state.value.invite?.claimedBy != null) {
            _messages.tryEmit(Copy.Invite.ClaimedCannotDeleteBody)
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(busy = true) }
            runCatching { family.deleteInvite(id) }
                .onSuccess {
                    _state.update { it.copy(busy = false) }
                    _deleted.tryEmit(Unit)
                }
                .onFailure { e ->
                    _state.update { it.copy(busy = false) }
                    _messages.tryEmit(formatUserFacingError(e, Errors.Invite.DeleteFailed))
                }
        }
    }

    private fun load() {
        viewModelScope.launch {
            runCatching { family.listInvites() }
                .onSuccess { list ->
                    val found = list.find { it.id == inviteId }
                    if (found == null) {
                        _messages.tryEmit(Errors.Invite.NotFound)
                    } else {
                        _state.update { it.copy(invite = found) }
                    }
                }
                .onFailure { e ->
                    _messages.tryEmit(formatUserFacingError(e, Errors.Invite.NotFound))
                }
        }
    }
}
