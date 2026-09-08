package com.jinlabs.yakok.core.constants

/** RN `shared/constants/careGlance.ts` · DataStore 키 자리 (값은 S5–S6). */
object PrefKeys {
    const val StartTab = "@yakmuk/start-tab"
    const val MotionEnabled = "yakmuk.motion.animations_enabled"
    const val CareGlanceOpt = "@yakmuk/care-glance-opt"
    const val CareGlanceUpdatedAt = "@yakmuk/care-glance-updated-at"
    const val WeeklyDigestOpt = "@yakmuk/weekly-digest-opt"
    const val WeeklyDigestDismissedWeek = "@yakmuk/weekly-digest-dismissed-week"
    const val PendingAlarmOpen = "yakmuk:pending_alarm_open"
}

object CareGlance {
    const val ChannelId = "care-glance"
    const val NotificationId = "yakmuk-care-glance"
    const val Kind = "care-glance"
    const val StaleMinutes = 30
}

/** Edge care-push / announce-push Android 채널. RN과 동일 id. */
object CarePush {
    const val ChannelTaken = "care-taken"
    const val ChannelStuck = "care-stuck"
    const val ChannelAnnouncement = "announcement"
    const val NotificationId = 9801
}

object WeeklyDigest {
    const val DayCount = 7
}

object AppScheme {
    const val Value = "yakok"
}

/** RN `fingerprint.ts` · 채널 id. */
object MedAlarm {
    const val Kind = "medication"
    const val IdPrefix = "yakmuk-med-"
    const val FpTag = "clk4"
    const val ChannelId = "medication-alarm"
    const val DeepLinkHost = "medication-alarm"
    const val LogTag = "yakmuk-fsi"
}
