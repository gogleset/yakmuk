package com.jinlabs.yakok.ui.home

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.alarm.AlarmPrompt
import com.jinlabs.yakok.core.constants.MedColors
import com.jinlabs.yakok.core.constants.MedDoseUnits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.Medication
import com.jinlabs.yakok.core.med.TimeOfDaySlot
import com.jinlabs.yakok.core.med.TimeSlots
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant
import com.jinlabs.yakok.ui.components.YakokButton
import java.time.YearMonth

@Composable
fun HomeScreen(
    onAdd: () -> Unit,
    onOpenMed: (Long) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val notifPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        viewModel.ackAlarmPrompt()
        if (granted) viewModel.refresh()
    }
    LifecycleResumeEffect(Unit) {
        viewModel.refresh()
        onPauseOrDispose { }
    }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    var deleting by remember { mutableStateOf<Medication?>(null) }

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
            ) {
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
                Spacer(Modifier.height(12.dp))
                if (!state.hasRegistered) {
                    EmptyMeds(
                        onAdd = onAdd,
                        error = state.error,
                        onRetry = viewModel::refresh,
                    )
                } else if (state.showTodayCheck) {
                    TodayPanel(
                        state = state,
                        onToggle = viewModel::toggleTaken,
                        onOpen = onOpenMed,
                        onDelete = { deleting = it },
                    )
                } else if (state.showPastDay) {
                    PastPanel(state = state, onOpen = onOpenMed)
                }
                Spacer(Modifier.height(88.dp))
            }
        }
        FloatingActionButton(
                onClick = onAdd,
                containerColor = Color(Colors.Brand),
                contentColor = Color(Colors.Ink),
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(20.dp),
            ) {
                Icon(Icons.Filled.Add, contentDescription = Copy.Med.AddFab)
            }
        SnackbarHost(
            snackbar,
            modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 88.dp),
        )
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

    when (state.alarmPrompt) {
        AlarmPrompt.None -> Unit
        AlarmPrompt.Notifications -> AlertDialog(
            onDismissRequest = viewModel::ackAlarmPrompt,
            title = { Text(Copy.Notif.PermissionTitle) },
            text = { Text(Copy.Notif.PermissionBody) },
            confirmButton = {
                TextButton(onClick = {
                    if (Build.VERSION.SDK_INT >= 33) {
                        notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
                    } else {
                        viewModel.ackAlarmPrompt()
                    }
                }) { Text(Copy.Notif.ExactAlarmOpen, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = viewModel::ackAlarmPrompt) { Text(Copy.Notif.ExactAlarmLater) }
            },
        )
        AlarmPrompt.ExactAlarm -> AlertDialog(
            onDismissRequest = viewModel::ackAlarmPrompt,
            title = { Text(Copy.Notif.ExactAlarmTitle) },
            text = { Text(Copy.Notif.ExactAlarmBody) },
            confirmButton = {
                TextButton(onClick = {
                    context.startActivity(viewModel.exactAlarmSettingsIntent())
                    viewModel.ackAlarmPrompt()
                }) { Text(Copy.Notif.ExactAlarmOpen, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = viewModel::ackAlarmPrompt) { Text(Copy.Notif.ExactAlarmLater) }
            },
        )
        AlarmPrompt.Fsi -> AlertDialog(
            onDismissRequest = viewModel::ackAlarmPrompt,
            title = { Text(Copy.Notif.FsiTitle) },
            text = { Text(Copy.Notif.FsiBody) },
            confirmButton = {
                TextButton(onClick = {
                    context.startActivity(viewModel.fsiSettingsIntent())
                    viewModel.ackAlarmPrompt()
                }) { Text(Copy.Notif.ExactAlarmOpen, color = Color(Colors.Brand)) }
            },
            dismissButton = {
                TextButton(onClick = viewModel::ackAlarmPrompt) { Text(Copy.Notif.ExactAlarmLater) }
            },
        )
    }
}

@Composable
private fun EmptyMeds(onAdd: () -> Unit, error: String?, onRetry: () -> Unit) {
    Column(
        Modifier.fillMaxWidth().padding(top = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        KokiImage(if (error != null) KokiVariant.Thinking else KokiVariant.Empty, 112)
        Spacer(Modifier.height(12.dp))
        Text(
            error ?: Copy.Med.EmptyRegistered,
            color = Color(Colors.Muted),
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(16.dp))
        YakokButton(
            if (error != null) Copy.Actions.Retry else Copy.Med.EmptyRegisteredCta,
            onClick = if (error != null) onRetry else onAdd,
        )
    }
}

@Composable
internal fun MonthCalendar(
    visibleMonth: String,
    marked: Map<String, com.jinlabs.yakok.core.med.CalendarMark>,
    selected: String,
    today: String,
    streak: Int?,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onSelect: (String) -> Unit,
) {
    val parts = visibleMonth.split("-")
    val ym = runCatching { YearMonth.of(parts[0].toInt(), parts[1].toInt()) }.getOrNull() ?: return
    val firstDow = (ym.atDay(1).dayOfWeek.value + 6) % 7 // Mon=0
    val days = ym.lengthOfMonth()
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Radius.Sheet.dp))
            .background(Color(Colors.SurfaceSoft))
            .padding(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onPrev) {
                Icon(Icons.Filled.ChevronLeft, contentDescription = null, tint = Color(Colors.Brand))
            }
            Text(
                "${ym.year}.${ym.monthValue.toString().padStart(2, '0')}",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center,
                color = Color(Colors.Text),
            )
            IconButton(onClick = onNext) {
                Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Color(Colors.Brand))
            }
        }
        streak?.let {
            Text(
                Copy.Med.streakDays(it),
                color = Color(Colors.Brand),
                fontSize = 13.sp,
                modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp),
                textAlign = TextAlign.Center,
            )
        }
        Row(Modifier.fillMaxWidth()) {
            listOf("월", "화", "수", "목", "금", "토", "일").forEach { d ->
                Text(
                    d,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center,
                    color = Color(Colors.Muted),
                    fontSize = 12.sp,
                )
            }
        }
        val cells = firstDow + days
        val rows = (cells + 6) / 7
        var day = 1
        repeat(rows) { row ->
            Row(Modifier.fillMaxWidth()) {
                repeat(7) { col ->
                    val idx = row * 7 + col
                    val date = if (idx >= firstDow && day <= days) {
                        val d = day++
                        "%s-%02d".format(visibleMonth, d) to d
                    } else {
                        null
                    }
                    Box(
                        Modifier.weight(1f).height(40.dp).clickable(enabled = date != null) {
                            date?.first?.let(onSelect)
                        },
                        contentAlignment = Alignment.Center,
                    ) {
                        if (date != null) {
                            val mark = marked[date.first]
                            val selectedDay = date.first == selected
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    date.second.toString(),
                                    color = when {
                                        selectedDay -> Color(Colors.Ink)
                                        date.first == today -> Color(Colors.Brand)
                                        else -> Color(Colors.Text)
                                    },
                                    fontWeight = if (selectedDay || date.first == today) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 14.sp,
                                    modifier = if (selectedDay) {
                                        Modifier
                                            .clip(CircleShape)
                                            .background(Color(Colors.Brand))
                                            .padding(horizontal = 8.dp, vertical = 2.dp)
                                    } else Modifier
                                )
                                if (mark?.marked == true) {
                                    val dot = mark.dotColor
                                    if (dot != null) {
                                        Box(
                                            Modifier
                                                .padding(top = 2.dp)
                                                .size(5.dp)
                                                .clip(CircleShape)
                                                .background(Color(dot)),
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TodayPanel(
    state: HomeUiState,
    onToggle: (Long) -> Unit,
    onOpen: (Long) -> Unit,
    onDelete: (Medication) -> Unit,
) {
    val remaining = state.pendingIds.size
    Text(
        if (state.allDone) Copy.Med.AllDoneToday else Copy.Med.remainingToday(remaining),
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        color = Color(Colors.Text),
    )
    if (state.todayMeds.isEmpty()) {
        Text(Copy.Med.EmptyToday, color = Color(Colors.Muted), modifier = Modifier.padding(top = 8.dp))
        Text(Copy.Med.EmptyTodayHint, color = Color(Colors.Muted), fontSize = 13.sp)
        return
    }
    TimeSlots.groupMedsByScheduledTime(state.todayMeds).forEach { group ->
        Text(
            "${slotLabel(group.slot)}  ${group.scheduledTime}",
            color = Color(Colors.Muted),
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 14.dp, bottom = 6.dp),
        )
        group.meds.forEach { med ->
            MedCheckRow(
                med = med,
                taken = med.id in state.takenIds,
                onToggle = { onToggle(med.id) },
                onOpen = { onOpen(med.id) },
                onDelete = { onDelete(med) },
            )
        }
    }
}

@Composable
private fun PastPanel(state: HomeUiState, onOpen: (Long) -> Unit) {
    if (state.pastEntries.isEmpty()) {
        Text(Copy.Med.EmptyPastDay, color = Color(Colors.Muted))
        return
    }
    TimeSlots.groupTimedEntries(state.pastEntries).forEach { group ->
        Text(
            "${slotLabel(group.slot)}  ${group.scheduledTime}",
            color = Color(Colors.Muted),
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 12.dp, bottom = 4.dp),
        )
        group.entries.forEach { entry ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(Radius.Lg.dp))
                    .background(Color(Colors.SurfaceSoft))
                    .clickable { entry.key.removePrefix("med-").toLongOrNull()?.let(onOpen) }
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(if (entry.taken) "✓" else "·", color = Color(Colors.Brand), modifier = Modifier.padding(end = 8.dp))
                Text(entry.name, fontWeight = FontWeight.SemiBold, color = Color(Colors.Text))
            }
        }
    }
}

@Composable
private fun MedCheckRow(
    med: Medication,
    taken: Boolean,
    onToggle: () -> Unit,
    onOpen: () -> Unit,
    onDelete: () -> Unit,
) {
    val hex = MedColors.resolveHex(med.color)
    val color = Color(android.graphics.Color.parseColor(hex))
    Row(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(Radius.Lg.dp))
            .background(Color(Colors.SurfaceSoft))
            .clickable(onClick = onOpen)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Checkbox(
            checked = taken,
            onCheckedChange = { if (!taken) onToggle() },
            colors = CheckboxDefaults.colors(checkedColor = Color(Colors.Brand)),
        )
        Box(Modifier.size(10.dp).clip(CircleShape).background(color))
        Column(Modifier.weight(1f).padding(start = 10.dp)) {
            Text(med.name, fontWeight = FontWeight.SemiBold, color = Color(Colors.Text))
            MedDoseUnits.formatDose(med.doseAmount, med.doseUnit)?.let {
                Text(it, color = Color(Colors.Muted), fontSize = 12.sp)
            }
        }
        TextButton(onClick = onDelete) {
            Text(Copy.Actions.Delete, color = Color(Colors.Muted), fontSize = 12.sp)
        }
    }
}

private fun slotLabel(slot: TimeOfDaySlot) = when (slot) {
    TimeOfDaySlot.Dawn -> Copy.Med.TimeSlot.Dawn
    TimeOfDaySlot.Morning -> Copy.Med.TimeSlot.Morning
    TimeOfDaySlot.Lunch -> Copy.Med.TimeSlot.Lunch
    TimeOfDaySlot.Afternoon -> Copy.Med.TimeSlot.Afternoon
    TimeOfDaySlot.Bedtime -> Copy.Med.TimeSlot.Bedtime
}
