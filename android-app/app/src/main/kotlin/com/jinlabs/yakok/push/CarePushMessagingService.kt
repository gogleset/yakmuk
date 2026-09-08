package com.jinlabs.yakok.push

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.jinlabs.yakok.core.constants.CarePush
import com.jinlabs.yakok.core.family.CarePushKind
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class CarePushMessagingService : FirebaseMessagingService() {
    @Inject lateinit var registrar: PushTokenRegistrar
    @Inject lateinit var notifier: CarePushNotifier

    override fun onNewToken(token: String) {
        registrar.syncWithToken(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val kind = message.data["kind"].orEmpty()
        val channelId = when (kind) {
            CarePushKind.StuckEscalate.wire -> CarePush.ChannelStuck
            "announcement" -> CarePush.ChannelAnnouncement
            else -> CarePush.ChannelTaken
        }
        val title = message.notification?.title
            ?: message.data["title"]
            ?: return
        val body = message.notification?.body
            ?: message.data["body"]
            ?: return
        notifier.show(title, body, channelId)
    }
}
