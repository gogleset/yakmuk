package com.jinlabs.yakok.ui.onboarding

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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.DaysMask
import com.jinlabs.yakok.core.med.Discomfort
import com.jinlabs.yakok.core.med.MedPurpose
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.components.FunnelScaffold
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant
import com.jinlabs.yakok.ui.components.YakokField

@Composable
fun OnboardingFunnel(
    onFinished: () -> Unit,
    viewModel: OnboardingViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val notif = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { viewModel.finish() }

    LaunchedEffect(state.finished) {
        if (state.finished) onFinished()
    }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Box {
        FunnelScaffold(
            title = state.title,
            ctaLabel = if (state.busy) Copy.Welcome.PleaseWait else state.cta,
            onCta = {
                if (state.step == OnboardingStep.Permission) {
                    if (Build.VERSION.SDK_INT >= 33) {
                        notif.launch(Manifest.permission.POST_NOTIFICATIONS)
                    } else {
                        viewModel.finish()
                    }
                    if (viewModel.needsExactAlarm()) {
                        runCatching { context.startActivity(viewModel.permissions.exactAlarmSettingsIntent()) }
                    }
                } else {
                    viewModel.primary()
                }
            },
            onBack = viewModel::back,
            ctaEnabled = state.ctaEnabled,
        ) {
            if (state.step == OnboardingStep.HasMed || state.step == OnboardingStep.Permission) {
                KokiImage(KokiVariant.Happy, 96)
                Spacer(Modifier.height(16.dp))
            }
            when (state.step) {
                OnboardingStep.HasMed -> {
                    TextButton(onClick = viewModel::skipMed) {
                        Text(Copy.Onboarding.HasMedLater, color = Color(Colors.Muted))
                    }
                }
                OnboardingStep.Name -> YakokField(
                    state.name,
                    viewModel::setName,
                    placeholder = Copy.Onboarding.NamePlaceholder,
                )
                OnboardingStep.Schedule -> {
                    YakokField(state.time, viewModel::setTime, placeholder = "08:00")
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = state.daily,
                            onClick = { viewModel.setDaily(true) },
                            label = { Text(Copy.Med.Daily) },
                            colors = chipColors(state.daily),
                        )
                        FilterChip(
                            selected = !state.daily,
                            onClick = { viewModel.setDaily(false) },
                            label = { Text(Copy.Med.Weekdays) },
                            colors = chipColors(!state.daily),
                        )
                    }
                    if (!state.daily) {
                        Spacer(Modifier.height(12.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            DaysMask.WeekdayLabels.forEachIndexed { i, label ->
                                val on = i in state.weekdays
                                Box(
                                    Modifier
                                        .clip(RoundedCornerShape(Radius.Pill.dp))
                                        .background(Color(if (on) Colors.Brand else Colors.SurfaceSoft))
                                        .clickable { viewModel.toggleWeekday(i) }
                                        .padding(horizontal = 8.dp, vertical = 8.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(label, color = Color(if (on) Colors.Ink else Colors.Muted), fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }
                OnboardingStep.Purpose -> {
                    PurposeChips(state.purpose, viewModel::setPurpose)
                    TextButton(onClick = viewModel::skipPurpose) {
                        Text(Copy.Onboarding.PurposeSkip, color = Color(Colors.Muted))
                    }
                }
                OnboardingStep.Discomfort -> {
                    DiscomfortChips(state.discomfort, viewModel::setDiscomfort)
                    TextButton(onClick = viewModel::skipDiscomfort) {
                        Text(Copy.Onboarding.DiscomfortSkip, color = Color(Colors.Muted))
                    }
                }
                OnboardingStep.Permission -> {
                    Text(Copy.Notif.PermissionBody, color = Color(Colors.Muted))
                    TextButton(onClick = viewModel::finish) {
                        Text(Copy.Onboarding.PermissionSkip, color = Color(Colors.Muted))
                    }
                }
            }
        }
        SnackbarHost(snackbar, modifier = Modifier.align(Alignment.BottomCenter))
    }
}

@Composable
fun PurposeChips(selected: MedPurpose?, onSelect: (MedPurpose) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        MedPurpose.entries.forEach { purpose ->
            val on = selected == purpose
            ChoiceRow(Copy.Purpose.label(purpose), on) { onSelect(purpose) }
        }
    }
}

@Composable
fun DiscomfortChips(selected: Discomfort?, onSelect: (Discomfort) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Discomfort.entries.forEach { value ->
            val on = selected == value
            ChoiceRow(Copy.Discomfort.label(value), on) { onSelect(value) }
        }
    }
}

@Composable
private fun ChoiceRow(label: String, selected: Boolean, onClick: () -> Unit) {
    Text(
        label,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(Radius.Lg.dp))
            .background(Color(if (selected) Colors.BrandSoft else Colors.SurfaceSoft))
            .then(
                if (selected) Modifier.border(1.dp, Color(Colors.Brand), RoundedCornerShape(Radius.Lg.dp))
                else Modifier,
            )
            .clickable(onClick = onClick)
            .padding(16.dp),
        color = Color(Colors.Text),
        fontWeight = FontWeight.Medium,
    )
}

@Composable
private fun chipColors(selected: Boolean) = FilterChipDefaults.filterChipColors(
    selectedContainerColor = Color(Colors.BrandSoft),
    selectedLabelColor = Color(Colors.Brand),
    containerColor = Color(Colors.SurfaceSoft),
    labelColor = Color(Colors.Muted),
)
