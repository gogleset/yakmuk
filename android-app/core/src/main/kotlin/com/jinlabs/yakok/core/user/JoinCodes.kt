package com.jinlabs.yakok.core.user

import com.jinlabs.yakok.core.constants.Limits

object JoinCodes {
    const val Scheme = "yakok"

    fun normalize(raw: String): String =
        raw.uppercase().filter { it in 'A'..'Z' || it in '0'..'9' }

    fun isComplete(raw: String): Boolean =
        normalize(raw).length == Limits.InviteCodeLength

    fun joinDeepLink(inviteCode: String): String =
        "$Scheme://join?code=${normalize(inviteCode)}"
}
