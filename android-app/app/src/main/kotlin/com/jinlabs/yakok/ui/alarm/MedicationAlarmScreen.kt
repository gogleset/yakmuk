package com.jinlabs.yakok.ui.alarm

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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.AlarmMedItem
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant
import com.jinlabs.yakok.ui.components.YakokButton

@Composable
fun MedicationAlarmScreen(
    onBack: () -> Unit,
    viewModel: AlarmViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }
    LaunchedEffect(viewModel) {
        viewModel.done.collect { onBack() }
    }

    Box(
        Modifier
            .fillMaxSize()
            .background(Color(Colors.Canvas))
            .statusBarsPadding()
            .navigationBarsPadding(),
    ) {
        if (state.loading) {
            CircularProgressIndicator(
                Modifier.align(Alignment.Center),
                color = Color(Colors.Brand),
            )
        } else {
            Column(
                Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(24.dp))
                Text(
                    state.headline,
                    color = Color(Colors.Text),
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                )
                if (state.displayTime.isNotBlank()) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        state.displayTime,
                        color = Color(Colors.Text),
                        fontSize = 40.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(Modifier.height(12.dp))
                KokiImage(
                    KokiVariant.Medicine,
                    size = if (state.showChecklist) 168 else 220,
                )
                if (state.showChecklist) {
                    Spacer(Modifier.height(8.dp))
                    Column(
                        Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        state.items.forEach { item ->
                            AlarmMedRow(
                                item = item,
                                taken = item.medicationId in state.takenIds,
                                enabled = !state.busy && item.medicationId !in state.takenIds,
                                onClick = { viewModel.takeOne(item.medicationId) },
                            )
                        }
                    }
                } else {
                    val hero = state.unchecked.firstOrNull() ?: state.items.firstOrNull()
                    if (hero != null) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            hero.name,
                            color = Color(Colors.Text),
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                        )
                        AlarmViewModel.doseMeta(hero)?.let { meta ->
                            Text(
                                meta,
                                color = Color(Colors.Muted),
                                fontSize = 16.sp,
                                textAlign = TextAlign.Center,
                            )
                        }
                    }
                    Spacer(Modifier.weight(1f))
                }
                YakokButton(
                    label = state.primaryLabel,
                    onClick = viewModel::takeRemaining,
                    enabled = !state.busy,
                )
                Spacer(Modifier.height(12.dp))
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter))
    }
}

@Composable
private fun AlarmMedRow(
    item: AlarmMedItem,
    taken: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    val bg = if (taken) Color(Colors.BrandSoft) else Color(Colors.SurfaceSoft)
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Radius.Lg.dp))
            .background(bg)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(item.name, color = Color(Colors.Text), fontSize = 20.sp, fontWeight = FontWeight.Bold)
            AlarmViewModel.doseMeta(item)?.let {
                Text(it, color = Color(Colors.Muted), fontSize = 14.sp)
            }
        }
        if (taken) {
            Icon(Icons.Filled.Check, contentDescription = Copy.Notif.AlarmTaken, tint = Color(Colors.Brand))
        }
    }
}
