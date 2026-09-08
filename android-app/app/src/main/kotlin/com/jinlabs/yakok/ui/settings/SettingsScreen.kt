package com.jinlabs.yakok.ui.settings

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.prefs.StartTab
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.components.YakokButton
import com.jinlabs.yakok.ui.components.YakokButtonVariant
import com.jinlabs.yakok.ui.components.YakokField

@Composable
fun SettingsScreen(viewModel: SettingsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var nicknameOpen by remember { mutableStateOf(false) }
    var nicknameDraft by remember { mutableStateOf("") }
    var startTabOpen by remember { mutableStateOf(false) }
    var withdrawOpen by remember { mutableStateOf(false) }
    var exactAlarmOpen by remember { mutableStateOf(false) }
    var glancePendingOn by remember { mutableStateOf(false) }

    val notifPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        viewModel.onNotifGranted(granted)
        if (glancePendingOn) {
            glancePendingOn = false
            if (granted) viewModel.setCareGlance(true)
            else viewModel.setCareGlance(false)
        }
        if (!granted) {
            runCatching { context.startActivity(viewModel.notificationSettingsIntent()) }
        }
    }

    LifecycleResumeEffect(Unit) {
        viewModel.refresh()
        onPauseOrDispose { }
    }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }
    LaunchedEffect(viewModel) {
        viewModel.needExactAlarm.collect { exactAlarmOpen = true }
    }

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
                Text(
                    Copy.Settings.Title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
                    color = Color(Colors.Text),
                )

                Row(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(Radius.Lg.dp))
                        .background(Color(Colors.SurfaceSoft))
                        .clickable {
                            nicknameDraft = state.nickname
                            nicknameOpen = true
                        }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color(Colors.BrandSoft)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            state.nickname.trim().firstOrNull()?.toString() ?: "?",
                            fontWeight = FontWeight.Bold,
                            color = Color(Colors.Brand),
                        )
                    }
                    Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                        Text(
                            state.nickname.ifBlank { Copy.Settings.NoName },
                            fontWeight = FontWeight.Bold,
                            color = Color(Colors.Text),
                        )
                        Text(state.familyLine, color = Color(Colors.Muted), fontSize = 13.sp)
                        state.roleLabel?.let {
                            Text(it, color = Color(Colors.Brand), fontSize = 12.sp)
                        }
                    }
                    Icon(Icons.Outlined.ChevronRight, contentDescription = Copy.Settings.NicknameChange, tint = Color(Colors.Muted))
                }

                SectionLabel(Copy.Settings.Account)
                SettingsGroup {
                    SettingsRow(Copy.Settings.SignOut, showChevron = false, enabled = !state.busy) { viewModel.signOut() }
                    SettingsRow(Copy.Settings.Withdraw, destructive = true, showChevron = false, enabled = !state.busy) {
                        withdrawOpen = true
                    }
                }

                SectionLabel(Copy.Settings.Notifications)
                SettingsGroup {
                    SettingsSwitchRow(
                        label = Copy.Notif.BasicSwitch,
                        checked = state.notifGranted,
                        onCheckedChange = { next ->
                            if (next) {
                                if (Build.VERSION.SDK_INT >= 33 && !state.notifGranted) {
                                    notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                                } else {
                                    viewModel.onNotifGranted(true)
                                }
                            } else {
                                runCatching { context.startActivity(viewModel.notificationSettingsIntent()) }
                            }
                        },
                    )
                    if (!state.fsiUnsupported) {
                        SettingsSwitchRow(
                            label = Copy.Notif.FullPageSwitch,
                            checked = state.fsiAllowed,
                            enabled = state.notifGranted,
                            onCheckedChange = {
                                runCatching { context.startActivity(viewModel.fsiSettingsIntent()) }
                            },
                        )
                    }
                    if (state.showCareOpts) {
                        SettingsSwitchRow(
                            label = Copy.Settings.CareGlance,
                            checked = state.careGlanceOn,
                            onCheckedChange = { next ->
                                if (next && Build.VERSION.SDK_INT >= 33 && !state.notifGranted) {
                                    glancePendingOn = true
                                    notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                                } else {
                                    viewModel.setCareGlance(next)
                                }
                            },
                        )
                        SettingsSwitchRow(
                            label = Copy.Settings.WeeklyDigest,
                            checked = state.weeklyOn,
                            onCheckedChange = viewModel::setWeekly,
                        )
                    }
                }

                SectionLabel(Copy.Settings.App)
                SettingsGroup {
                    SettingsRow(
                        label = Copy.Settings.StartScreen,
                        value = if (state.startTab == StartTab.Family) {
                            Copy.Settings.StartScreenFamily
                        } else {
                            Copy.Settings.StartScreenHome
                        },
                    ) { startTabOpen = true }
                    SettingsSwitchRow(
                        label = Copy.Settings.Animations,
                        checked = state.motionEnabled,
                        onCheckedChange = viewModel::setMotion,
                    )
                }
                Text(
                    Copy.Settings.AnimationsHint,
                    color = Color(Colors.Muted),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(horizontal = 4.dp),
                )

                SectionLabel(Copy.Settings.Info)
                SettingsGroup {
                    SettingsRow(Copy.Settings.Version, value = state.version, showChevron = false)
                }
                Spacer(Modifier.height(24.dp))
            }
        }

        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }

    if (nicknameOpen) {
        AlertDialog(
            onDismissRequest = { nicknameOpen = false },
            title = { Text(Copy.Settings.NicknameChange) },
            text = {
                YakokField(
                    value = nicknameDraft,
                    onValueChange = { nicknameDraft = it },
                    placeholder = Copy.Welcome.NicknamePlaceholder,
                    maxLength = Limits.NicknameMaxLength,
                )
            },
            confirmButton = {
                TextButton(
                    enabled = !state.busy && nicknameDraft.trim().isNotEmpty() &&
                        nicknameDraft.trim() != state.nickname,
                    onClick = {
                        viewModel.saveNickname(nicknameDraft)
                        nicknameOpen = false
                    },
                ) { Text(Copy.Actions.Save, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = { nicknameOpen = false }) {
                    Text(Copy.Actions.Cancel, color = Color(Colors.Muted))
                }
            },
        )
    }

    if (startTabOpen) {
        AlertDialog(
            onDismissRequest = { startTabOpen = false },
            title = { Text(Copy.Settings.StartScreen) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    YakokButton(
                        Copy.Settings.StartScreenHome,
                        onClick = {
                            viewModel.setStartTab(StartTab.Home)
                            startTabOpen = false
                        },
                        variant = if (state.startTab == StartTab.Home) {
                            YakokButtonVariant.Primary
                        } else {
                            YakokButtonVariant.Outline
                        },
                    )
                    YakokButton(
                        Copy.Settings.StartScreenFamily,
                        onClick = {
                            viewModel.setStartTab(StartTab.Family)
                            startTabOpen = false
                        },
                        variant = if (state.startTab == StartTab.Family) {
                            YakokButtonVariant.Primary
                        } else {
                            YakokButtonVariant.Outline
                        },
                    )
                }
            },
            confirmButton = {},
            dismissButton = {
                TextButton(onClick = { startTabOpen = false }) {
                    Text(Copy.Actions.Cancel, color = Color(Colors.Muted))
                }
            },
        )
    }

    if (withdrawOpen) {
        AlertDialog(
            onDismissRequest = { withdrawOpen = false },
            title = { Text(Copy.Settings.WithdrawTitle) },
            text = { Text(state.withdrawBody) },
            confirmButton = {
                TextButton(
                    enabled = !state.busy,
                    onClick = {
                        withdrawOpen = false
                        viewModel.withdraw()
                    },
                ) { Text(Copy.Settings.Withdraw, color = Color(Colors.Destructive)) }
            },
            dismissButton = {
                TextButton(onClick = { withdrawOpen = false }) {
                    Text(Copy.Actions.Cancel, color = Color(Colors.Muted))
                }
            },
        )
    }

    if (exactAlarmOpen) {
        AlertDialog(
            onDismissRequest = { exactAlarmOpen = false },
            title = { Text(Copy.Notif.ExactAlarmTitle) },
            text = { Text(Copy.Notif.ExactAlarmBody) },
            confirmButton = {
                TextButton(onClick = {
                    exactAlarmOpen = false
                    runCatching { context.startActivity(viewModel.exactAlarmSettingsIntent()) }
                }) { Text(Copy.Notif.ExactAlarmOpen, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = { exactAlarmOpen = false }) {
                    Text(Copy.Notif.ExactAlarmLater, color = Color(Colors.Muted))
                }
            },
        )
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text,
        color = Color(Colors.Muted),
        fontSize = 13.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.padding(top = 8.dp, start = 4.dp),
    )
}

@Composable
private fun SettingsGroup(content: @Composable () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Radius.Lg.dp))
            .background(Color(Colors.SurfaceSoft)),
    ) {
        content()
    }
}

@Composable
private fun SettingsRow(
    label: String,
    value: String? = null,
    destructive: Boolean = false,
    showChevron: Boolean = true,
    enabled: Boolean = true,
    onClick: (() -> Unit)? = null,
) {
    Row(
        Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(enabled = enabled, onClick = onClick) else Modifier)
            .padding(horizontal = 14.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            label,
            modifier = Modifier.weight(1f),
            color = Color(if (destructive) Colors.Destructive else Colors.Text),
            fontWeight = FontWeight.Medium,
        )
        if (value != null) {
            Text(value, color = Color(Colors.Muted), fontSize = 13.sp, modifier = Modifier.padding(end = 4.dp))
        }
        if (showChevron && onClick != null) {
            Icon(Icons.Outlined.ChevronRight, contentDescription = null, tint = Color(Colors.Muted))
        }
    }
}

@Composable
private fun SettingsSwitchRow(
    label: String,
    checked: Boolean,
    enabled: Boolean = true,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, modifier = Modifier.weight(1f), color = Color(Colors.Text), fontWeight = FontWeight.Medium)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = enabled,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color(Colors.White),
                checkedTrackColor = Color(Colors.Brand),
            ),
        )
    }
}
