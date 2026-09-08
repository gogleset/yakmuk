package com.jinlabs.yakok.core.med

/** daily_logs.message — 하루 약 전부 복용 피드 마커 (유저 노출 X) */
object DayCompleteFeed {
    const val Marker = "day_complete"

    fun isFeedLog(log: DailyLog): Boolean =
        log.status == LogStatus.Taken &&
            log.medicationId == null &&
            log.message == Marker &&
            log.condition == null
}
