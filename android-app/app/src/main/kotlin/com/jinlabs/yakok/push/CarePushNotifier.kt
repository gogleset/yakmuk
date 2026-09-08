package com.jinlabs.yakok.push

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.jinlabs.yakok.MainActivity
import com.jinlabs.yakok.R
import com.jinlabs.yakok.core.constants.CarePush
import com.jinlabs.yakok.core.copy.Copy
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

object CarePushChannel {
    fun ensure(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        fun create(id: String, name: String, importance: Int) {
            if (nm.getNotificationChannel(id) != null) return
            nm.createNotificationChannel(NotificationChannel(id, name, importance))
        }
        create(CarePush.ChannelTaken, Copy.Push.ChannelTaken, NotificationManager.IMPORTANCE_DEFAULT)
        create(CarePush.ChannelStuck, Copy.Push.ChannelStuck, NotificationManager.IMPORTANCE_HIGH)
        create(
            CarePush.ChannelAnnouncement,
            Copy.Push.ChannelAnnouncement,
            NotificationManager.IMPORTANCE_DEFAULT,
        )
    }
}

@Singleton
class CarePushNotifier @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    fun show(title: String, body: String, channelId: String) {
        CarePushChannel.ensure(context)
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
        val id = when (channelId) {
            CarePush.ChannelStuck -> ID_STUCK
            CarePush.ChannelAnnouncement -> ID_ANNOUNCE
            else -> ID_TAKEN
        }
        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_stat_alarm)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setContentIntent(pi)
            .setPriority(
                if (channelId == CarePush.ChannelStuck) NotificationCompat.PRIORITY_HIGH
                else NotificationCompat.PRIORITY_DEFAULT,
            )
            .build()
        NotificationManagerCompat.from(context).notify(id, notification)
    }

    companion object {
        private const val ID_TAKEN = 9801
        private const val ID_STUCK = 9802
        private const val ID_ANNOUNCE = 9803
        private const val REQ = 9801
    }
}
