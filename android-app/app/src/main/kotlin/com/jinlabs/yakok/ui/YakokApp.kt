package com.jinlabs.yakok.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import android.net.Uri
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.ui.auth.AuthViewModel
import com.jinlabs.yakok.ui.auth.JoinScreen
import com.jinlabs.yakok.ui.auth.WelcomeScreen
import com.jinlabs.yakok.ui.family.FamilyFeedScreen
import com.jinlabs.yakok.ui.family.InviteCreateScreen
import com.jinlabs.yakok.ui.family.InviteReadyScreen
import com.jinlabs.yakok.ui.family.MemberMedScreen
import com.jinlabs.yakok.ui.alarm.MedicationAlarmScreen
import com.jinlabs.yakok.ui.home.MainTabs
import com.jinlabs.yakok.ui.med.MedFormScreen

@Composable
fun YakokApp(
    viewModel: AuthViewModel = hiltViewModel(),
    pendingJoinCode: String? = null,
    consumeJoinCode: () -> Unit = {},
    pendingAlarm: Boolean = false,
    consumeAlarm: () -> Unit = {},
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val nav = rememberNavController()
    val snackbar = remember { SnackbarHostState() }

    LaunchedEffect(viewModel) {
        viewModel.messages.collect { snackbar.showSnackbar(it) }
    }

    LaunchedEffect(state.hasFamily, state.bootstrapping, pendingAlarm) {
        if (state.bootstrapping) return@LaunchedEffect
        val dest = nav.currentDestination?.route.orEmpty()
        if (state.hasFamily) {
                if (pendingAlarm) {
                    if (dest == "alarm") nav.popBackStack()
                    if (!dest.startsWith("tabs") && dest != "alarm") {
                        nav.navigate("tabs") { popUpTo(0) { inclusive = true } }
                    }
                    nav.navigate("alarm")
                    consumeAlarm()
            } else if (!dest.startsWith("tabs") && dest != "alarm") {
                nav.navigate("tabs") { popUpTo(0) { inclusive = true } }
            }
        } else if (dest.startsWith("tabs") || dest == "alarm") {
            nav.navigate("welcome") { popUpTo(0) { inclusive = true } }
        }
    }

    LaunchedEffect(pendingJoinCode) {
        val code = pendingJoinCode ?: return@LaunchedEffect
        if (code.isNotEmpty()) {
            nav.navigate("join?code=$code")
            consumeJoinCode()
        }
    }

    Box(Modifier.fillMaxSize()) {
        if (state.bootstrapping) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(Colors.Brand))
            }
        } else {
            NavHost(navController = nav, startDestination = "welcome") {
                composable("welcome") {
                    WelcomeScreen(
                        state = state,
                        googleConfigured = viewModel.googleConfigured,
                        onSignInGoogle = viewModel::signInGoogle,
                        onSignInDev = viewModel::signInDev,
                        onCreateFamily = viewModel::createFamily,
                        onSignOut = viewModel::signOut,
                        onClearStaleAnon = viewModel::clearStaleAnonymous,
                        onOpenJoin = { nav.navigate("join?code=") },
                    )
                }
                composable(
                    route = "join?code={code}",
                    arguments = listOf(
                        navArgument("code") {
                            type = NavType.StringType
                            defaultValue = ""
                        },
                    ),
                    deepLinks = listOf(
                        navDeepLink { uriPattern = "yakok://join?code={code}" },
                        navDeepLink { uriPattern = "yakok://join" },
                    ),
                ) { entry ->
                    val code = entry.arguments?.getString("code").orEmpty()
                    JoinScreen(
                        initialCode = code,
                        state = state,
                        onPeek = viewModel::peekIfReady,
                        onJoin = viewModel::join,
                        onBack = { nav.popBackStack() },
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
                        onOpenFeed = { nav.navigate("family-feed") },
                        onOpenMember = { userId, nickname, role ->
                            nav.navigate(
                                "member/$userId?nickname=${Uri.encode(nickname)}&role=${Uri.encode(role)}",
                            )
                        },
                        onCreateInvite = { nav.navigate("invite-create") },
                        onOpenInvite = { id -> nav.navigate("invite/$id") },
                    )
                }
                composable(
                    route = "add-med?owner={owner}",
                    arguments = listOf(
                        navArgument("owner") {
                            type = NavType.StringType
                            defaultValue = ""
                        },
                    ),
                ) { entry ->
                    val owner = entry.arguments?.getString("owner").orEmpty()
                    MedFormScreen(
                        medicationId = null,
                        ownerUserId = owner.takeIf { it.isNotEmpty() },
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
                composable("family-feed") {
                    FamilyFeedScreen(
                        onBack = { nav.popBackStack() },
                        onOpenMember = { userId, nickname, role ->
                            nav.navigate(
                                "member/$userId?nickname=${Uri.encode(nickname)}&role=${Uri.encode(role)}",
                            )
                        },
                    )
                }
                composable("invite-create") {
                    InviteCreateScreen(
                        onBack = { nav.popBackStack() },
                        onCreated = { id -> nav.navigate("invite/$id") { popUpTo("invite-create") { inclusive = true } } },
                    )
                }
                composable(
                    route = "invite/{inviteId}",
                    arguments = listOf(navArgument("inviteId") { type = NavType.StringType }),
                ) {
                    InviteReadyScreen(onBack = { nav.popBackStack() })
                }
                composable(
                    route = "member/{userId}?nickname={nickname}&role={role}",
                    arguments = listOf(
                        navArgument("userId") { type = NavType.StringType },
                        navArgument("nickname") {
                            type = NavType.StringType
                            defaultValue = ""
                        },
                        navArgument("role") {
                            type = NavType.StringType
                            defaultValue = ""
                        },
                    ),
                ) { entry ->
                    val userId = entry.arguments?.getString("userId").orEmpty()
                    MemberMedScreen(
                        onBack = { nav.popBackStack() },
                        onAdd = { nav.navigate("add-med?owner=$userId") },
                        onOpenMed = { id -> nav.navigate("med/$id") },
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

    if (state.forceSignOut) {
        AlertDialog(
            onDismissRequest = {},
            title = { Text(Copy.Auth.ForceSignOutTitle) },
            text = { Text(Copy.Auth.ForceSignOutBody) },
            confirmButton = {
                TextButton(onClick = viewModel::ackForceSignOut) {
                    Text(Copy.Welcome.Confirm, color = Color(Colors.Brand))
                }
            },
        )
    }
}
