package com.jinlabs.yakok.ui.settings

import android.Manifest
import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.rememberScrollState
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
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.onboarding.DiscomfortChips

@Composable
fun SettingsScreen(
    onWiped: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var wipeOpen by remember { mutableStateOf(false) }
    var exactAlarmOpen by remember { mutableStateOf(false) }
    var discomfortOpen by remember { mutableStateOf(false) }

    val notifPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        viewModel.onNotifGranted(granted)
        if (!granted) {
            runCatching { context.startActivity(viewModel.notificationSettingsIntent()) }
        }
    }

    LifecycleResumeEffect(Unit) {
        viewModel.refresh()
        onPauseOrDispose { }
    }
    LaunchedEffect(state.wiped) {
        if (state.wiped) onWiped()
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
                Text(Copy.Settings.LocalOnlyHint, color = Color(Colors.Muted), fontSize = 13.sp)

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
                }

                SectionLabel(Copy.Discomfort.Section)
                SettingsGroup {
                    SettingsRow(
                        Copy.Discomfort.Change,
                        value = state.discomfort?.let { Copy.Discomfort.label(it) },
                    ) { discomfortOpen = true }
                }

                SectionLabel(Copy.Settings.App)
                SettingsGroup {
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
                    SettingsRow(Copy.Settings.Privacy) {
                        val url = viewModel.privacyTapped()
                        if (url != null) {
                            runCatching {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                            }
                        }
                    }
                    SettingsRow(Copy.Settings.Wipe, destructive = true, showChevron = false) {
                        wipeOpen = true
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }

    if (discomfortOpen) {
        AlertDialog(
            onDismissRequest = { discomfortOpen = false },
            title = { Text(Copy.Discomfort.Change) },
            text = {
                DiscomfortChips(state.discomfort) {
                    viewModel.setDiscomfort(it)
                    discomfortOpen = false
                }
            },
            confirmButton = {
                TextButton(onClick = { discomfortOpen = false }) {
                    Text(Copy.Actions.Confirm, color = Color(Colors.Brand))
                }
            },
        )
    }

    if (wipeOpen) {
        AlertDialog(
            onDismissRequest = { wipeOpen = false },
            title = { Text(Copy.Settings.WipeTitle) },
            text = { Text(Copy.Settings.WipeBody) },
            confirmButton = {
                TextButton(
                    enabled = !state.busy,
                    onClick = {
                        wipeOpen = false
                        viewModel.wipe()
                    },
                ) { Text(Copy.Settings.Wipe, color = Color(Colors.Destructive)) }
            },
            dismissButton = {
                TextButton(onClick = { wipeOpen = false }) {
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
