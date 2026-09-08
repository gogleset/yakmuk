package com.jinlabs.yakok.ui.home

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Medication
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.prefs.StartTab
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.ui.settings.SettingsScreen

private data class TabSpec(val label: String, val icon: ImageVector)

@Composable
fun MainTabs(
    onAddMedication: () -> Unit = {},
    onOpenMedication: (Long) -> Unit = {},
    onOpenFeed: () -> Unit = {},
    onOpenMember: (userId: String, nickname: String, role: String) -> Unit = { _, _, _ -> },
    onCreateInvite: () -> Unit = {},
    onOpenInvite: (String) -> Unit = {},
    tabsViewModel: TabsViewModel = hiltViewModel(),
) {
    val startTab by tabsViewModel.startTab.collectAsStateWithLifecycle()
    val tabs = listOf(
        TabSpec(Copy.Tabs.Home, Icons.Filled.Medication),
        TabSpec(Copy.Tabs.Family, Icons.Filled.Groups),
        TabSpec(Copy.Tabs.Settings, Icons.Filled.Settings),
    )
    var appliedStart by rememberSaveable { mutableStateOf(false) }
    var selected by rememberSaveable { mutableIntStateOf(0) }
    LaunchedEffect(startTab) {
        if (!appliedStart) {
            selected = if (startTab == StartTab.Family) 1 else 0
            appliedStart = true
        }
    }
    val brand = Color(Colors.Brand)
    val muted = Color(Colors.Muted)
    Scaffold(
        containerColor = Color(Colors.Canvas),
        bottomBar = {
            NavigationBar(containerColor = Color(Colors.Surface), tonalElevation = 0.dp) {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selected == index,
                        onClick = { selected = index },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = {
                            Text(tab.label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = brand,
                            selectedTextColor = brand,
                            unselectedIconColor = muted,
                            unselectedTextColor = muted,
                            indicatorColor = Color.Transparent,
                        ),
                    )
                }
            }
        },
    ) { padding ->
        Box(
            Modifier.fillMaxSize().padding(padding),
            contentAlignment = Alignment.Center,
        ) {
            when (selected) {
                0 -> HomeScreen(onAdd = onAddMedication, onOpenMed = onOpenMedication)
                1 -> com.jinlabs.yakok.ui.family.FamilyScreen(
                    onOpenFeed = onOpenFeed,
                    onOpenMember = onOpenMember,
                    onCreateInvite = onCreateInvite,
                    onOpenInvite = onOpenInvite,
                )
                else -> SettingsScreen()
            }
        }
    }
}
