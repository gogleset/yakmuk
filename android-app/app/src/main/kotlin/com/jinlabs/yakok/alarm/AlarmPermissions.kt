package com.jinlabs.yakok.alarm

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

enum class ExactAlarmStatus { Enabled, Disabled, Unsupported }
enum class FsiStatus { Allowed, Denied, Unsupported }

@Singleton
class AlarmPermissions @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    fun hasPostNotifications(): Boolean {
        if (Build.VERSION.SDK_INT < 33) return true
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun exactAlarmStatus(): ExactAlarmStatus {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return ExactAlarmStatus.Unsupported
        val am = context.getSystemService(AlarmManager::class.java) ?: return ExactAlarmStatus.Disabled
        return if (am.canScheduleExactAlarms()) ExactAlarmStatus.Enabled else ExactAlarmStatus.Disabled
    }

    fun fsiStatus(): FsiStatus {
        if (Build.VERSION.SDK_INT < 34) return FsiStatus.Unsupported
        val nm = context.getSystemService(NotificationManager::class.java)
            ?: return FsiStatus.Denied
        return if (nm.canUseFullScreenIntent()) FsiStatus.Allowed else FsiStatus.Denied
    }

    fun exactAlarmSettingsIntent(): Intent =
        Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
            data = Uri.parse("package:${context.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

    fun notificationSettingsIntent(): Intent =
        Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
            putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

    fun fsiSettingsIntent(): Intent {
        val action = if (Build.VERSION.SDK_INT >= 34) {
            Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT
        } else {
            Settings.ACTION_APPLICATION_DETAILS_SETTINGS
        }
        return Intent(action).apply {
            data = Uri.parse("package:${context.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }
}
