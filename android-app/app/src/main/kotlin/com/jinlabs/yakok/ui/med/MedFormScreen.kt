package com.jinlabs.yakok.ui.med

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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.core.constants.MedColors
import com.jinlabs.yakok.core.constants.MedDoseUnits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.med.DaysMask
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.components.YakokButton
import com.jinlabs.yakok.ui.components.YakokField

@Composable
fun MedFormScreen(
    medicationId: Long?,
    onBack: () -> Unit,
    onSaved: () -> Unit,
    viewModel: MedFormViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val snackbar = remember { androidx.compose.material3.SnackbarHostState() }
    LaunchedEffect(medicationId) { viewModel.load(medicationId) }
    LaunchedEffect(state.saved) { if (state.saved) onSaved() }
    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    Column(
        Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .imePadding()
            .padding(horizontal = 20.dp),
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = Copy.Welcome.Back, tint = Color(Colors.Brand))
        }
        Text(
            if (medicationId == null) Copy.Med.AddTitle else Copy.Med.EditTitle,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color(Colors.Text),
            modifier = Modifier.padding(bottom = 16.dp),
        )
        Column(
            Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState()),
        ) {
            YakokField(state.name, viewModel::setName, placeholder = Copy.Med.NamePlaceholder)
            Spacer(Modifier.height(10.dp))
            if (viewModel.searchConfigured) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.weight(1f)) {
                        YakokField(state.query, viewModel::setQuery, placeholder = Copy.Med.Search)
                    }
                    Spacer(Modifier.size(8.dp))
                    YakokButton(Copy.Med.Search, viewModel::searchDrugs, modifier = Modifier.fillMaxWidth(0.35f), enabled = !state.searching)
                }
                state.searchHits.forEach { hit ->
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                            .clip(RoundedCornerShape(Radius.Lg.dp))
                            .background(Color(Colors.SurfaceSoft))
                            .clickable { viewModel.pickDrug(hit) }
                            .padding(12.dp),
                    ) {
                        Text(hit.itemName, fontWeight = FontWeight.SemiBold)
                        Text(hit.entpName, color = Color(Colors.Muted), fontSize = 12.sp)
                    }
                }
                if (state.searchHits.isEmpty() && state.query.isNotEmpty() && !state.searching) {
                    // keep quiet until a search
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(Copy.Med.ColorLabel, color = Color(Colors.Muted), fontSize = 13.sp)
            Row(Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                MedColors.All.forEach { swatch ->
                    val selected = state.color == swatch.id
                    Box(
                        Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(Color(android.graphics.Color.parseColor(swatch.hex)))
                            .then(
                                if (selected) Modifier.border(2.dp, Color(Colors.Text), CircleShape)
                                else Modifier,
                            )
                            .clickable { viewModel.setColor(swatch.id) },
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(Copy.Med.DoseLabel, color = Color(Colors.Muted), fontSize = 13.sp)
            YakokField(state.doseAmount, viewModel::setDoseAmount, placeholder = Copy.Med.DoseAmountPlaceholder)
            Row(
                Modifier.padding(vertical = 8.dp).fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                MedDoseUnits.All.take(5).forEach { unit ->
                    val selected = state.doseUnit == unit.id
                    FilterChip(
                        selected = selected,
                        onClick = { viewModel.setDoseUnit(if (selected) null else unit.id) },
                        label = { Text(unit.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(Colors.BrandSoft),
                            selectedLabelColor = Color(Colors.Brand),
                        ),
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = state.daily,
                    onClick = { viewModel.setDaily(true) },
                    label = { Text(Copy.Med.Daily) },
                )
                FilterChip(
                    selected = !state.daily,
                    onClick = { viewModel.setDaily(false) },
                    label = { Text(Copy.Med.Weekdays) },
                )
            }
            if (!state.daily) {
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    DaysMask.WeekdayLabels.forEachIndexed { i, label ->
                        val on = i in state.weekdays
                        FilterChip(
                            selected = on,
                            onClick = { viewModel.toggleWeekday(i) },
                            label = { Text(label) },
                        )
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Text(Copy.Med.TimeLabel, color = Color(Colors.Muted), fontSize = 13.sp)
            state.times.forEachIndexed { i, time ->
                YakokField(time, { viewModel.setTime(i, it) }, placeholder = "08:00")
                if (state.times.size > 1) {
                    Text(
                        Copy.Actions.Delete,
                        color = Color(Colors.Muted),
                        fontSize = 12.sp,
                        modifier = Modifier.clickable { viewModel.removeTime(i) }.padding(bottom = 8.dp),
                    )
                }
            }
            if (state.times.size < 6) {
                Text(
                    Copy.Med.AddTime,
                    color = Color(Colors.Brand),
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable(onClick = viewModel::addTime).padding(vertical = 8.dp),
                )
            }
            Spacer(Modifier.height(24.dp))
        }
        YakokButton(
            if (state.busy) Copy.Welcome.PleaseWait else Copy.Actions.Save,
            onClick = { viewModel.save(medicationId) },
            enabled = !state.busy,
            modifier = Modifier.padding(vertical = 16.dp),
        )
        androidx.compose.material3.SnackbarHost(snackbar)
    }
}
