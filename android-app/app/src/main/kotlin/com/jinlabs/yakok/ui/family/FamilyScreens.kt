package com.jinlabs.yakok.ui.family

import android.content.Intent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.RoleLabels
import com.jinlabs.yakok.core.family.CareAlertTone
import com.jinlabs.yakok.core.family.FamilyFeed
import com.jinlabs.yakok.core.family.FamilySeat
import com.jinlabs.yakok.core.family.FamilySeatPendingKind
import com.jinlabs.yakok.core.family.WeeklyDigest
import com.jinlabs.yakok.core.family.WeeklyDigestView
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.core.time.Format
import com.jinlabs.yakok.core.user.FamilyInvite
import com.jinlabs.yakok.core.user.FamilyRoles
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.core.user.UserRole
import com.jinlabs.yakok.ui.components.FunnelScaffold
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant
import com.jinlabs.yakok.ui.components.YakokButton
import com.jinlabs.yakok.ui.components.YakokButtonVariant
import com.jinlabs.yakok.ui.components.YakokField
import com.jinlabs.yakok.ui.home.MonthCalendar
import kotlinx.datetime.Clock

@Composable
fun FamilyScreen(
    onOpenFeed: () -> Unit,
    onOpenMember: (userId: String, nickname: String, role: String) -> Unit,
    onCreateInvite: () -> Unit,
    onOpenInvite: (inviteId: String) -> Unit,
    viewModel: FamilyViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }
    LifecycleResumeEffect(Unit) {
        viewModel.refresh()
        onPauseOrDispose { }
    }
    LaunchedEffect(viewModel) {
        viewModel.openedInvite.collect { onOpenInvite(it) }
    }
    var kicking by remember { mutableStateOf<FamilySeat.Member?>(null) }
    var reissuing by remember { mutableStateOf<Pair<String, Boolean>?>(null) }
    var deletingInvite by remember { mutableStateOf<FamilyInvite?>(null) }

    Box(Modifier.fillMaxSize()) {
        if (state.loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(Colors.Brand))
            }
        } else {
            Column(
                Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        Format.friendlyDate(com.jinlabs.yakok.core.time.Kst.todayDateString(Clock.System.now())),
                        color = Color(Colors.Muted),
                        fontSize = 13.sp,
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = onOpenFeed) {
                        Icon(
                            if (state.hasUnread) Icons.Outlined.Notifications else Icons.Outlined.NotificationsNone,
                            contentDescription = if (state.hasUnread) {
                                Copy.Family.RecentFeedUnreadA11y
                            } else {
                                Copy.Family.RecentFeed
                            },
                            tint = Color(if (state.hasUnread) Colors.Brand else Colors.Muted),
                        )
                    }
                }

                if (state.slides.isNotEmpty()) {
                    state.slides.forEach { slide ->
                        Column(
                            Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(Radius.Lg.dp))
                                .background(
                                    Color(
                                        if (slide.tone == CareAlertTone.Stuck) Colors.WarningBg else Colors.DestructiveSoft,
                                    ),
                                )
                                .padding(14.dp),
                        ) {
                            Text(slide.title, fontWeight = FontWeight.Bold, color = Color(Colors.Text))
                            Text(slide.body, color = Color(Colors.Muted), fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                            TextButton(onClick = { viewModel.ack(slide.alertId) }) {
                                Text(Copy.Family.CareAck, color = Color(Colors.Brand))
                            }
                        }
                    }
                }

                if (!state.familyEmpty) {
                    state.digest?.let { digest ->
                        WeeklyDigestCard(digest = digest, onAck = viewModel::ackDigest)
                    }
                }

                if (state.familyEmpty) {
                    Column(
                        Modifier.fillMaxWidth().padding(top = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        KokiImage(KokiVariant.Empty, 112)
                        Spacer(Modifier.height(12.dp))
                        Text(Copy.Family.EmptyMembers, fontWeight = FontWeight.Bold, color = Color(Colors.Text))
                        Text(
                            Copy.Family.EmptyMembersMessage,
                            color = Color(Colors.Muted),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 6.dp),
                        )
                    }
                } else {
                    Text(
                        state.family?.name?.trim()?.ifEmpty { null } ?: Copy.Family.TodayStatusFallback,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Color(Colors.Text),
                    )
                    Row(
                        Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        state.seats.forEach { seat ->
                            SeatCard(
                                seat = seat,
                                isLeader = state.isLeader,
                                onMember = { member ->
                                    onOpenMember(member.userId, member.nickname, member.role.wire)
                                },
                                onPending = { onOpenInvite(it.invite.id) },
                                onEmpty = { if (state.isLeader) onCreateInvite() },
                                onKick = { kicking = it },
                                onReissue = { inviteId, connected -> reissuing = inviteId to connected },
                                onDeleteInvite = { deletingInvite = it },
                            )
                        }
                    }
                    if (state.isLeader) {
                        YakokButton(Copy.Family.InviteCta, onCreateInvite)
                    }
                }

                if (!state.familyEmpty) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            Copy.Family.RecentFeed,
                            fontWeight = FontWeight.Bold,
                            color = Color(Colors.Text),
                            modifier = Modifier.weight(1f),
                        )
                        if (state.feedCount > 0) {
                            TextButton(onClick = onOpenFeed) {
                                Text(Copy.Family.SeeMoreFeed, color = Color(Colors.Brand))
                            }
                        }
                    }
                    when {
                        state.error != null && state.previewSections.isEmpty() -> {
                            Text(Copy.Family.LoadFailedFeed, color = Color(Colors.Muted))
                        }
                        state.previewSections.isEmpty() -> {
                            Text(Copy.Family.EmptyFeedMessage, color = Color(Colors.Muted))
                        }
                        else -> {
                            state.previewSections.forEach { section ->
                                FeedSection(
                                    title = section.title,
                                    unread = section.dateYmd in state.unreadDates,
                                    items = section.data.map { log ->
                                        Triple(
                                            FamilyFeed.itemTitle(log),
                                            FamilyFeed.itemSubtitle(log),
                                            log,
                                        )
                                    },
                                    onOpen = { userId, nick ->
                                        val role = state.members.find { it.userId == userId }?.role?.wire.orEmpty()
                                        onOpenMember(userId, nick, role)
                                    },
                                    onOpened = {},
                                )
                            }
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }

    kicking?.let { member ->
        AlertDialog(
            onDismissRequest = { kicking = null },
            title = { Text(Copy.Family.KickTitle) },
            text = { Text(Copy.Family.kickBody(member.nickname)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.kick(member.userId)
                    kicking = null
                }) { Text(Copy.Actions.Export, color = Color(Colors.Destructive)) }
            },
            dismissButton = {
                TextButton(onClick = { kicking = null }) { Text(Copy.Actions.Cancel) }
            },
        )
    }
    reissuing?.let { (inviteId, connected) ->
        AlertDialog(
            onDismissRequest = { reissuing = null },
            title = { Text(Copy.Invite.ReissueTitle) },
            text = {
                Text(if (connected) Copy.Invite.ReissueConnectedBody else Copy.Invite.ReissueBody)
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.reissueInvite(inviteId)
                    reissuing = null
                }) { Text(Copy.Invite.ReissueAction, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = { reissuing = null }) { Text(Copy.Actions.Cancel) }
            },
        )
    }
    deletingInvite?.let { invite ->
        AlertDialog(
            onDismissRequest = { deletingInvite = null },
            title = { Text(Copy.Invite.DeleteTitle) },
            text = { Text(invite.invitedAs) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteInvite(invite.id)
                    deletingInvite = null
                }) { Text(Copy.Actions.Delete, color = Color(Colors.Destructive)) }
            },
            dismissButton = {
                TextButton(onClick = { deletingInvite = null }) { Text(Copy.Actions.Cancel) }
            },
        )
    }
}

@Composable
private fun SeatCard(
    seat: FamilySeat,
    isLeader: Boolean,
    onMember: (FamilySeat.Member) -> Unit,
    onPending: (FamilySeat.Pending) -> Unit,
    onEmpty: () -> Unit,
    onKick: (FamilySeat.Member) -> Unit,
    onReissue: (inviteId: String, connected: Boolean) -> Unit,
    onDeleteInvite: (FamilyInvite) -> Unit,
) {
    val label = when (seat) {
        is FamilySeat.Member -> FamilyRoles.displayNickname(seat.nickname, seat.invitedAs)
        is FamilySeat.Pending -> seat.invite.invitedAs
        FamilySeat.Empty -> if (isLeader) Copy.Family.InviteCta else "·"
    }
    val sub = when (seat) {
        is FamilySeat.Member -> RoleLabels.label(seat.role)
        is FamilySeat.Pending -> when (seat.pendingKind) {
            FamilySeatPendingKind.Reentry -> Copy.Invite.StatusReentry
            FamilySeatPendingKind.Waiting -> Copy.Invite.StatusWaiting
        }
        FamilySeat.Empty -> ""
    }
    val showMenu = isLeader && seat !is FamilySeat.Empty
    var menuOpen by remember { mutableStateOf(false) }
    Box(
        Modifier
            .width(148.dp)
            .height(148.dp)
            .clip(RoundedCornerShape(Radius.Lg.dp))
            .background(Color(Colors.SurfaceSoft)),
    ) {
        Column(
            Modifier
                .fillMaxSize()
                .clickable {
                    when (seat) {
                        is FamilySeat.Member -> onMember(seat)
                        is FamilySeat.Pending -> if (isLeader) onPending(seat)
                        FamilySeat.Empty -> onEmpty()
                    }
                }
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Box(
                Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color(Colors.BrandSoft)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    Format.nicknameInitial(if (seat is FamilySeat.Empty) null else label),
                    color = Color(Colors.Brand),
                    fontWeight = FontWeight.Bold,
                )
            }
            Text(
                label,
                fontWeight = FontWeight.SemiBold,
                color = Color(Colors.Text),
                maxLines = 1,
                modifier = Modifier.padding(top = 8.dp),
            )
            if (sub.isNotEmpty()) {
                Text(sub, color = Color(Colors.Muted), fontSize = 12.sp)
            }
        }
        if (showMenu) {
            Box(Modifier.align(Alignment.TopEnd)) {
                IconButton(onClick = { menuOpen = true }) {
                    Icon(
                        Icons.Filled.MoreVert,
                        contentDescription = null,
                        tint = Color(Colors.Muted),
                    )
                }
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    when (seat) {
                        is FamilySeat.Member -> {
                            val inviteId = seat.inviteId
                            if (inviteId != null) {
                                DropdownMenuItem(
                                    text = { Text(Copy.Invite.ReissueAction) },
                                    onClick = {
                                        menuOpen = false
                                        onReissue(inviteId, true)
                                    },
                                )
                            }
                            DropdownMenuItem(
                                text = { Text(Copy.Actions.Export, color = Color(Colors.Destructive)) },
                                onClick = {
                                    menuOpen = false
                                    onKick(seat)
                                },
                            )
                        }
                        is FamilySeat.Pending -> {
                            val connected = seat.invite.claimedBy != null || seat.invite.reentryUserId != null
                            DropdownMenuItem(
                                text = { Text(Copy.Invite.ReissueAction) },
                                onClick = {
                                    menuOpen = false
                                    onReissue(seat.invite.id, connected)
                                },
                            )
                            if (!connected) {
                                DropdownMenuItem(
                                    text = { Text(Copy.Actions.Delete, color = Color(Colors.Destructive)) },
                                    onClick = {
                                        menuOpen = false
                                        onDeleteInvite(seat.invite)
                                    },
                                )
                            }
                        }
                        FamilySeat.Empty -> Unit
                    }
                }
            }
        }
    }
}

@Composable
private fun FeedSection(
    title: String,
    unread: Boolean,
    items: List<Triple<String, String?, com.jinlabs.yakok.core.med.DailyLog>>,
    onOpen: (String, String) -> Unit,
    onOpened: () -> Unit,
) {
    LaunchedEffect(title) { onOpened() }
    Text(
        title,
        fontWeight = FontWeight.SemiBold,
        color = Color(if (unread) Colors.Brand else Colors.Muted),
        fontSize = 13.sp,
        modifier = Modifier.padding(top = 4.dp),
    )
    items.forEach { (titleText, subtitle, log) ->
        val who = log.nickname?.trim()?.ifEmpty { null } ?: Copy.Family.MemberFallback
        Row(
            Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
                .clip(RoundedCornerShape(Radius.Lg.dp))
                .background(Color(Colors.SurfaceSoft))
                .clickable { onOpen(log.userId, who) }
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color(Colors.BrandSoft)),
                contentAlignment = Alignment.Center,
            ) {
                Text(Format.nicknameInitial(who), color = Color(Colors.Brand), fontWeight = FontWeight.Bold)
            }
            Column(Modifier.weight(1f).padding(start = 10.dp)) {
                Text(titleText, fontWeight = FontWeight.SemiBold, color = Color(Colors.Text))
                if (subtitle != null) {
                    Text(subtitle, color = Color(Colors.Muted), fontSize = 13.sp)
                }
            }
            Text(
                Format.relativeTime(log.createdAt, Clock.System.now().toEpochMilliseconds()),
                color = Color(Colors.Muted),
                fontSize = 12.sp,
            )
        }
    }
}

@Composable
fun FamilyFeedScreen(
    onBack: () -> Unit,
    onOpenMember: (userId: String, nickname: String, role: String) -> Unit,
    viewModel: FamilyFeedViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Column(Modifier.fillMaxSize().statusBarsPadding().padding(horizontal = 20.dp)) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = Copy.Welcome.Back, tint = Color(Colors.Brand))
        }
        Text(Copy.Family.RecentFeed, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(Colors.Text))
        if (state.loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(Colors.Brand))
            }
        } else if (state.error != null) {
            Text(state.error!!, color = Color(Colors.Muted), modifier = Modifier.padding(top = 16.dp))
        } else if (state.sections.isEmpty()) {
            Text(Copy.Family.EmptyFeedMessage, color = Color(Colors.Muted), modifier = Modifier.padding(top = 16.dp))
        } else {
            Column(Modifier.verticalScroll(rememberScrollState()).padding(top = 12.dp, bottom = 24.dp)) {
                state.sections.forEach { section ->
                    FeedSection(
                        title = section.title,
                        unread = section.dateYmd in state.unreadDates,
                        items = section.data.map { Triple(FamilyFeed.itemTitle(it), FamilyFeed.itemSubtitle(it), it) },
                        onOpen = { userId, nick -> onOpenMember(userId, nick, "") },
                        onOpened = { viewModel.markDayRead(section.dateYmd) },
                    )
                }
            }
        }
    }
}

@Composable
fun InviteCreateScreen(
    onBack: () -> Unit,
    onCreated: (String) -> Unit,
    viewModel: InviteViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(viewModel) { viewModel.messages.collect { snackbar.showSnackbar(it) } }
    Box(Modifier.fillMaxSize()) {
        FunnelScaffold(
            title = Copy.Invite.FunnelWhoTitle,
            ctaLabel = if (state.busy) Copy.Invite.FunnelCreating else Copy.Invite.FunnelCreateCta,
            onCta = { viewModel.create(onCreated) },
            onBack = onBack,
            ctaEnabled = state.canCreate && !state.busy,
        ) {
            Text(Copy.Invite.FunnelRoleHint, color = Color(Colors.Muted), fontSize = 13.sp)
            Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(UserRole.Guardian, UserRole.CareRecipient).forEach { role ->
                    val selected = state.targetRole == role
                    FilterChip(
                        selected = selected,
                        onClick = { viewModel.setRole(role) },
                        label = { Text(RoleLabels.label(role)) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(Colors.BrandSoft),
                            selectedLabelColor = Color(Colors.Brand),
                        ),
                    )
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(Copy.Invite.FunnelLabelHint, color = Color(Colors.Muted), fontSize = 13.sp)
            Row(
                Modifier.horizontalScroll(rememberScrollState()).padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Copy.Invite.LabelChips.forEach { chip ->
                    FilterChip(
                        selected = state.invitedAs == chip && !state.custom,
                        onClick = { viewModel.pickChip(chip) },
                        label = { Text(chip) },
                    )
                }
                FilterChip(
                    selected = state.custom,
                    onClick = { viewModel.setInvitedAs(state.invitedAs) },
                    label = { Text(Copy.Invite.FunnelCustomLabel) },
                )
            }
            Spacer(Modifier.height(12.dp))
            YakokField(state.invitedAs, viewModel::setInvitedAs, placeholder = Copy.Invite.LabelAlertBody)
        }
        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}

@Composable
fun InviteReadyScreen(
    onBack: () -> Unit,
    viewModel: InviteViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var confirmReissue by remember { mutableStateOf(false) }
    var confirmDelete by remember { mutableStateOf(false) }
    LaunchedEffect(viewModel) { viewModel.messages.collect { snackbar.showSnackbar(it) } }
    LaunchedEffect(viewModel) { viewModel.deleted.collect { onBack() } }
    val invite = state.invite
    Box(Modifier.fillMaxSize()) {
        FunnelScaffold(
            title = Copy.Invite.FunnelReadyTitle,
            ctaLabel = Copy.Invite.FunnelDone,
            onCta = onBack,
            onBack = onBack,
        ) {
            Text(Copy.Invite.FunnelReadyBody, color = Color(Colors.Muted))
            if (invite == null) {
                Spacer(Modifier.height(24.dp))
                CircularProgressIndicator(color = Color(Colors.Brand), modifier = Modifier.align(Alignment.CenterHorizontally))
            } else {
                val qr = remember(invite.inviteCode) {
                    QrBitmaps.encode(JoinCodes.joinDeepLink(invite.inviteCode), 512)
                }
                Image(
                    bitmap = qr.asImageBitmap(),
                    contentDescription = null,
                    modifier = Modifier
                        .padding(top = 20.dp)
                        .size(200.dp)
                        .align(Alignment.CenterHorizontally)
                        .clip(RoundedCornerShape(Radius.Lg.dp)),
                )
                Text(
                    invite.inviteCode,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 6.sp,
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                    textAlign = TextAlign.Center,
                    color = Color(Colors.Text),
                )
                Text(
                    invite.invitedAs,
                    color = Color(Colors.Muted),
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(16.dp))
                YakokButton(Copy.Invite.FunnelShare, onClick = {
                    val send = Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, state.shareText)
                    }
                    context.startActivity(Intent.createChooser(send, Copy.Invite.FunnelShare))
                })
                Spacer(Modifier.height(8.dp))
                YakokButton(
                    Copy.Invite.ReissueAction,
                    onClick = { confirmReissue = true },
                    variant = YakokButtonVariant.Outline,
                    enabled = !state.busy,
                )
                if (invite.claimedBy == null) {
                    Spacer(Modifier.height(8.dp))
                    TextButton(onClick = { confirmDelete = true }, modifier = Modifier.align(Alignment.CenterHorizontally)) {
                        Text(Copy.Invite.DeleteTitle, color = Color(Colors.Destructive))
                    }
                }
            }
        }
        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
    if (confirmReissue) {
        AlertDialog(
            onDismissRequest = { confirmReissue = false },
            title = { Text(Copy.Invite.ReissueTitle) },
            text = {
                Text(
                    if (invite?.claimedBy != null) Copy.Invite.ReissueConnectedBody else Copy.Invite.ReissueBody,
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.reissue()
                    confirmReissue = false
                }) { Text(Copy.Invite.ReissueAction, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = { confirmReissue = false }) { Text(Copy.Actions.Cancel) }
            },
        )
    }
    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text(Copy.Invite.DeleteTitle) },
            text = { Text(Copy.Invite.ClaimedCannotDeleteBody.takeIf { invite?.claimedBy != null } ?: "") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.delete()
                    confirmDelete = false
                }) { Text(Copy.Actions.Delete, color = Color(Colors.Destructive)) }
            },
            dismissButton = {
                TextButton(onClick = { confirmDelete = false }) { Text(Copy.Actions.Cancel) }
            },
        )
    }
}

@Composable
fun MemberMedScreen(
    onBack: () -> Unit,
    onAdd: () -> Unit,
    onOpenMed: (Long) -> Unit,
    viewModel: MemberMedViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var deleting by remember { mutableStateOf<Medication?>(null) }
    LaunchedEffect(viewModel) { viewModel.messages.collect { snackbar.showSnackbar(it) } }
    Box(Modifier.fillMaxSize().statusBarsPadding()) {
        Column(Modifier.fillMaxSize().padding(horizontal = 20.dp)) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = Copy.Welcome.Back, tint = Color(Colors.Brand))
            }
            Text(state.nickname, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(Colors.Text))
            if (state.loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(Colors.Brand))
                }
            } else if (state.error != null) {
                Text(state.error!!, color = Color(Colors.Muted), modifier = Modifier.padding(top = 12.dp))
            } else {
                Column(Modifier.verticalScroll(rememberScrollState()).padding(top = 8.dp, bottom = 88.dp)) {
                    MonthCalendar(
                        visibleMonth = state.visibleMonth,
                        marked = state.markedDates,
                        selected = state.selectedDate,
                        today = state.today,
                        streak = state.streakDays.takeIf { state.hasRegistered && it >= 3 },
                        onPrev = { viewModel.shiftMonth(-1) },
                        onNext = { viewModel.shiftMonth(1) },
                        onSelect = viewModel::selectDate,
                    )
                    Spacer(Modifier.height(16.dp))
                    if (!state.hasRegistered) {
                        Text(Copy.Med.EmptyRegistered, color = Color(Colors.Muted))
                    } else {
                        state.meds.forEach { med ->
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(Radius.Lg.dp))
                                    .background(Color(Colors.SurfaceSoft))
                                    .clickable(enabled = state.canManage) { onOpenMed(med.id) }
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(med.name, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f), color = Color(Colors.Text))
                                if (state.canManage) {
                                    TextButton(onClick = { deleting = med }) {
                                        Text(Copy.Actions.Delete, color = Color(Colors.Muted), fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (state.canManage) {
            FloatingActionButton(
                onClick = onAdd,
                containerColor = Color(Colors.Brand),
                contentColor = Color(Colors.Ink),
                modifier = Modifier.align(Alignment.BottomEnd).padding(20.dp),
            ) {
                Icon(Icons.Filled.Add, contentDescription = Copy.Med.AddFab)
            }
        }
        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 88.dp))
    }
    deleting?.let { med ->
        AlertDialog(
            onDismissRequest = { deleting = null },
            title = { Text(Copy.Med.DeleteTitle) },
            text = { Text(Copy.Med.deleteBody(med.name)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteMedication(med.id)
                    deleting = null
                }) { Text(Copy.Actions.Delete, color = Color(Colors.Destructive)) }
            },
            dismissButton = {
                TextButton(onClick = { deleting = null }) { Text(Copy.Actions.Cancel) }
            },
        )
    }
}

@Composable
private fun WeeklyDigestCard(digest: WeeklyDigestView, onAck: () -> Unit) {
    val anomalyLines = WeeklyDigest.formatAnomalyLines(digest.anomalyDays)
    val koki = when (WeeklyDigest.koki(digest)) {
        WeeklyDigest.Koki.Empty -> KokiVariant.Empty
        WeeklyDigest.Koki.Worried -> KokiVariant.Worried
        WeeklyDigest.Koki.Thinking -> KokiVariant.Thinking
        WeeklyDigest.Koki.Cheer -> KokiVariant.Cheer
        WeeklyDigest.Koki.Happy -> KokiVariant.Happy
    }
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Radius.Lg.dp))
            .background(Color(Colors.SurfaceSoft))
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        KokiImage(koki, 88)
        Column(Modifier.weight(1f).padding(start = 12.dp)) {
            Text(Copy.Family.WeeklyTitle, color = Color(Colors.Muted), fontSize = 12.sp)
            Text(
                digest.approxLine,
                fontWeight = FontWeight.Bold,
                color = Color(Colors.Text),
                modifier = Modifier.padding(top = 4.dp),
            )
            if (anomalyLines.isEmpty()) {
                Text(
                    Copy.Family.WeeklyEmptyAnomaly,
                    color = Color(Colors.Muted),
                    fontSize = 13.sp,
                    modifier = Modifier.padding(top = 4.dp),
                )
            } else {
                anomalyLines.forEach { line ->
                    Text(
                        line,
                        color = Color(Colors.Text),
                        fontSize = 13.sp,
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
            }
            TextButton(onClick = onAck, modifier = Modifier.align(Alignment.End)) {
                Text(Copy.Family.WeeklyAck, color = Color(Colors.Brand))
            }
        }
    }
}
