package com.jinlabs.yakok.alarm

data class PendingAlarmLaunch(
    val medicationId: String = "",
    val name: String = "",
    val scheduledTime: String = "",
    val useMethod: String = "",
    val doseAmount: String = "",
    val doseUnit: String = "",
) {
    val medicationIdLong: Long? get() = medicationId.toLongOrNull()?.takeIf { it > 0 }
}

@javax.inject.Singleton
class PendingAlarmHold @javax.inject.Inject constructor() {
    @Volatile
    var launch: PendingAlarmLaunch? = null
}
