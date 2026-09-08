package com.jinlabs.yakok

import android.app.ActivityOptions
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.jinlabs.yakok.alarm.MedicationAlarmChannel
import com.jinlabs.yakok.core.constants.MedAlarm

/**
 * setAlarmClock 발화.
 * startActivity는 API34+ BAL_BLOCK → 하지 않음.
 * 화면 OFF일 때 시스템이 fullScreenIntent로 Activity 기동.
 */
class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val pending = goAsync()
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val interactive = pm.isInteractive
        Log.i(
            MedAlarm.LogTag,
            "AlarmReceiver onReceive action=${intent.action} interactive=$interactive",
        )

        @Suppress("DEPRECATION")
        val wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "yakmuk:alarm-receiver")
        wakeLock.acquire(10_000)

        try {
            postFullScreenNotification(context, intent.extras)
        } finally {
            Handler(Looper.getMainLooper()).postDelayed(
                {
                    try {
                        if (wakeLock.isHeld) wakeLock.release()
                    } catch (_: Exception) {
                    }
                    pending.finish()
                },
                3_000,
            )
        }
    }

    private fun postFullScreenNotification(context: Context, extras: android.os.Bundle?) {
        try {
            MedicationAlarmChannel.ensure(context)
            val fsiIntent = Intent(context, AlarmFullScreenActivity::class.java).apply {
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_NO_USER_ACTION,
                )
                if (extras != null) putExtras(extras)
                putExtra("yakmuk_alarm_launch", true)
                putExtra("yakmuk_from_receiver", true)
            }

            val piFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val fullScreenPi = activityPi(context, REQ_FSI, fsiIntent, piFlags)
            val contentPi = activityPi(context, REQ_CONTENT, fsiIntent, piFlags)

            val title = extras?.getString("name")?.takeIf { it.isNotBlank() } ?: "약 먹을 시간"
            val body = extras?.getString("scheduledTime")?.takeIf { it.isNotBlank() }
                ?.let { "$it · 확인해주세요" }
                ?: "확인해주세요"
            val icon = R.drawable.ic_stat_alarm

            val notification = NotificationCompat.Builder(context, MedAlarm.ChannelId)
                .setSmallIcon(icon)
                .setContentTitle(title)
                .setContentText(body)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setContentIntent(contentPi)
                .setFullScreenIntent(fullScreenPi, true)
                .setTimeoutAfter(60_000)
                .build()

            NotificationManagerCompat.from(context).notify(NOTIF_ID, notification)
            Log.i(MedAlarm.LogTag, "posted FSI notif from receiver title=$title")
        } catch (e: Exception) {
            Log.e(MedAlarm.LogTag, "post FSI notif failed", e)
        }
    }

    private fun activityPi(
        context: Context,
        requestCode: Int,
        intent: Intent,
        flags: Int,
    ): PendingIntent {
        if (Build.VERSION.SDK_INT >= 34) {
            val options = ActivityOptions.makeBasic()
            options.setPendingIntentCreatorBackgroundActivityStartMode(
                ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED,
            )
            return PendingIntent.getActivity(context, requestCode, intent, flags, options.toBundle())
        }
        return PendingIntent.getActivity(context, requestCode, intent, flags)
    }

    companion object {
        private const val NOTIF_ID = 9702
        private const val REQ_FSI = 9702
        private const val REQ_CONTENT = 9703
        const val ACTION_PREFIX = "com.jinlabs.yakok.ALARM_CLOCK_"
    }
}
