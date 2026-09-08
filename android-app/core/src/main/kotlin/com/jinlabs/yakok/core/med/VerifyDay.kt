package com.jinlabs.yakok.core.med

enum class VerifyStatus { Success, Continue, FailedVerify }

data class VerifyDayResult(
    val status: VerifyStatus,
    val pendingMeds: Int,
    val conditionCount: Int,
)

object VerifyDay {
    fun scheduledIds(meds: List<Pair<Long, String>>, weekdayMon0: Int): List<Long> =
        meds.filter { DaysMask.isScheduledOnWeekday(it.second, weekdayMon0) }.map { it.first }

    fun evaluate(
        scheduledIds: List<Long>,
        takenIds: Set<Long>,
        conditionCount: Int,
    ): VerifyDayResult {
        val pending = scheduledIds.count { it !in takenIds }
        val conditions = conditionCount.coerceAtLeast(0)
        val status = if (pending == 0 && conditions >= 1) {
            VerifyStatus.Success
        } else {
            VerifyStatus.Continue
        }
        return VerifyDayResult(status, pending, conditions)
    }
}
