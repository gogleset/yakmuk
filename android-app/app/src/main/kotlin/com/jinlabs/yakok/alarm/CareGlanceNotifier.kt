package com.jinlabs.yakok.alarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import android.Manifest
import android.content.pm.PackageManager
import com.jinlabs.yakok.MainActivity
import com.jinlabs.yakok.R
import com.jinlabs.yakok.core.constants.CareGlance
import com.jinlabs.yakok.core.copy.Copy
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

object CareGlanceChannel {
    fun ensure(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        if (nm.getNotificationChannel(CareGlance.ChannelId) != null) return
        nm.createNotificationChannel(
            NotificationChannel(
                CareGlance.ChannelId,
                Copy.Glance.Channel,
                NotificationManager.IMPORTANCE_LOW,
            ),
        )
    }
}

@Singleton
class CareGlanceNotifier @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    fun show(line: String) {
        CareGlanceChannel.ensure(context)
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        val launch = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        val pi = PendingIntent.getActivity(
            context,
            REQ,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val notification = NotificationCompat.Builder(context, CareGlance.ChannelId)
            .setSmallIcon(R.drawable.ic_stat_alarm)
            .setContentTitle(Copy.Glance.Title)
            .setContentText(line)
            .setStyle(NotificationCompat.BigTextStyle().bigText(line))
            .setOngoing(true)
            .setAutoCancel(false)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pi)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .build()
        NotificationManagerCompat.from(context).notify(TAG, ID, notification)
    }

    fun cancel() {
        NotificationManagerCompat.from(context).cancel(TAG, ID)
    }

    companion object {
        private const val TAG = CareGlance.NotificationId
        private const val ID = 9701
        private const val REQ = 9701
    }
}
