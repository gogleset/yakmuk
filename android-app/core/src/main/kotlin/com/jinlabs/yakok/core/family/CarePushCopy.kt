package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.constants.CarePush
import com.jinlabs.yakok.core.copy.Copy

enum class CarePushKind {
    Taken,
    StuckEscalate,
    ;

    val wire: String
        get() = when (this) {
            Taken -> "taken"
            StuckEscalate -> "stuck_escalate"
        }

    val channelId: String
        get() = when (this) {
            Taken -> CarePush.ChannelTaken
            StuckEscalate -> CarePush.ChannelStuck
        }
}

data class CarePushMessage(
    val title: String,
    val body: String,
)

object CarePushCopy {
    fun build(kind: CarePushKind, actorNickname: String?): CarePushMessage {
        val who = actorNickname?.trim().orEmpty().ifEmpty { Copy.Family.MemberFallback }
        return when (kind) {
            CarePushKind.Taken -> CarePushMessage(
                title = Copy.Push.CareTakenTitle,
                body = Copy.Push.careTakenBody(who),
            )
            CarePushKind.StuckEscalate -> CarePushMessage(
                title = Copy.Push.CareStuckTitle,
                body = Copy.Push.careStuckBody(who),
            )
        }
    }
}
