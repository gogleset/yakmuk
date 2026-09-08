package com.jinlabs.yakok

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.jinlabs.yakok.alarm.CareGlanceController
import com.jinlabs.yakok.alarm.PendingAlarmHold
import com.jinlabs.yakok.alarm.PendingAlarmLaunch
import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.push.PushTokenRegistrar
import com.jinlabs.yakok.ui.YakokApp
import com.jinlabs.yakok.ui.theme.YakokTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var pendingAlarmHold: PendingAlarmHold
    @Inject lateinit var careGlance: CareGlanceController
    @Inject lateinit var pushTokens: PushTokenRegistrar

    private var pendingJoinCode by mutableStateOf<String?>(null)
    private var pendingAlarm by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        applyIntent(intent)
        enableEdgeToEdge()
        setContent {
            YakokTheme {
                YakokApp(
                    pendingJoinCode = pendingJoinCode,
                    consumeJoinCode = { pendingJoinCode = null },
                    pendingAlarm = pendingAlarm,
                    consumeAlarm = { pendingAlarm = false },
                )
            }
        }
    }

    override fun onStart() {
        super.onStart()
        lifecycleScope.launch {
            careGlance.syncForCurrentUser()
            pushTokens.sync()
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        applyIntent(intent)
    }

    private fun applyIntent(intent: Intent) {
        pendingJoinCode = intent.joinCode()
        val alarm = intent.pendingAlarm()
        if (alarm != null) {
            pendingAlarmHold.launch = alarm
            pendingAlarm = true
        }
    }
}

private fun Intent.joinCode(): String? {
    val uri = data ?: return null
    if (uri.scheme != JoinCodes.Scheme) return null
    if (uri.host != "join") return null
    return uri.getQueryParameter("code")
}

private fun Intent.pendingAlarm(): PendingAlarmLaunch? {
    val uri = data
    if (uri != null && uri.scheme == JoinCodes.Scheme && uri.host == MedAlarm.DeepLinkHost) {
        return PendingAlarmLaunch(
            medicationId = uri.getQueryParameter("medicationId").orEmpty(),
            name = uri.getQueryParameter("name").orEmpty(),
            scheduledTime = uri.getQueryParameter("scheduledTime").orEmpty(),
            useMethod = uri.getQueryParameter("useMethod").orEmpty(),
            doseAmount = uri.getQueryParameter("doseAmount").orEmpty(),
            doseUnit = uri.getQueryParameter("doseUnit").orEmpty(),
        )
    }
    if (!getBooleanExtra("yakmuk_alarm_launch", false)) return null
    return PendingAlarmLaunch(
        medicationId = getStringExtra("medicationId").orEmpty(),
        name = getStringExtra("name").orEmpty(),
        scheduledTime = getStringExtra("scheduledTime").orEmpty(),
        useMethod = getStringExtra("useMethod").orEmpty(),
        doseAmount = getStringExtra("doseAmount").orEmpty(),
        doseUnit = getStringExtra("doseUnit").orEmpty(),
    )
}
