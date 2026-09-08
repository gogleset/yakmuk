package com.jinlabs.yakok.alarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.copy.Copy

object MedicationAlarmChannel {
    fun ensure(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        if (nm.getNotificationChannel(MedAlarm.ChannelId) != null) return
        val channel = NotificationChannel(
            MedAlarm.ChannelId,
            Copy.Notif.Channel,
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            setBypassDnd(true)
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 250, 250, 250)
            lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
        }
        nm.createNotificationChannel(channel)
    }
}
