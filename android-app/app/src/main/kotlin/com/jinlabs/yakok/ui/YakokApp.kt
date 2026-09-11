package com.jinlabs.yakok.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.ui.alarm.MedicationAlarmScreen
import com.jinlabs.yakok.ui.home.MainTabs
import com.jinlabs.yakok.ui.med.MedFormScreen
import com.jinlabs.yakok.ui.onboarding.OnboardingFunnel

@Composable
fun YakokApp(
    viewModel: SessionViewModel = hiltViewModel(),
    pendingAlarm: Boolean = false,
    consumeAlarm: () -> Unit = {},
) {
    val onboardingDone by viewModel.onboardingDone.collectAsStateWithLifecycle()
    val nav = rememberNavController()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(onboardingDone, pendingAlarm) {
        if (onboardingDone == null) return@LaunchedEffect
        val dest = nav.currentDestination?.route.orEmpty()
        if (onboardingDone == true) {
            if (pendingAlarm) {
                if (dest == "alarm") nav.popBackStack()
                if (!dest.startsWith("tabs") && dest != "alarm") {
                    nav.navigate("tabs") { popUpTo(0) { inclusive = true } }
                }
                nav.navigate("alarm")
                consumeAlarm()
            } else if (dest == "onboarding" || dest.isEmpty()) {
                nav.navigate("tabs") { popUpTo(0) { inclusive = true } }
            }
        } else if (dest.startsWith("tabs") || dest == "alarm") {
            nav.navigate("onboarding") { popUpTo(0) { inclusive = true } }
        }
    }

    Box(Modifier.fillMaxSize()) {
        if (onboardingDone == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(Colors.Brand))
            }
        } else {
            NavHost(
                navController = nav,
                startDestination = if (onboardingDone == true) "tabs" else "onboarding",
            ) {
                composable("onboarding") {
                    OnboardingFunnel(
                        onFinished = {
                            nav.navigate("tabs") { popUpTo(0) { inclusive = true } }
                        },
                    )
                }
                composable("alarm") {
                    MedicationAlarmScreen(
                        onBack = {
                            if (!nav.popBackStack()) {
                                nav.navigate("tabs") { popUpTo(0) { inclusive = true } }
                            }
                        },
                    )
                }
                composable("tabs") {
                    MainTabs(
                        onAddMedication = { nav.navigate("add-med") },
                        onOpenMedication = { id -> nav.navigate("med/$id") },
                        onWiped = {
                            nav.navigate("onboarding") { popUpTo(0) { inclusive = true } }
                        },
                    )
                }
                composable("add-med") {
                    MedFormScreen(
                        medicationId = null,
                        onBack = { nav.popBackStack() },
                        onSaved = { nav.popBackStack() },
                    )
                }
                composable(
                    route = "med/{id}",
                    arguments = listOf(navArgument("id") { type = NavType.LongType }),
                ) { entry ->
                    val id = entry.arguments?.getLong("id")
                    MedFormScreen(
                        medicationId = id,
                        onBack = { nav.popBackStack() },
                        onSaved = { nav.popBackStack() },
                    )
                }
            }
        }

        SnackbarHost(
            snackbar,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding(),
        )
    }
}
