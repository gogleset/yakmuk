package com.jinlabs.yakok.core.med

enum class LoopTrigger { InApp, Cli, Http, Watch }

enum class RunStatus {
    Running,
    Success,
    FailedBound,
    FailedVerify,
    StuckAbort,
    StuckEscalate,
}

data class LoopRun(
    val id: String,
    val goal: String,
    val status: RunStatus,
    val trigger: LoopTrigger,
    val ownerUserId: String,
    val goalDate: String,
    val maxIterations: Int,
    val maxWallClockMs: Long,
    val createdAt: String,
    val endedAt: String? = null,
    val endedReason: String? = null,
)

sealed class DayLoopOutcome {
    data class Bound(val reason: String) : DayLoopOutcome()
    data class Finish(val status: RunStatus, val reason: String, val verify: VerifyDayResult) : DayLoopOutcome()
    data class Continue(val verify: VerifyDayResult) : DayLoopOutcome()
}

object DayLoop {
    const val MaxIterations = 10
    const val StuckThreshold = 3

    fun hashPending(ids: List<Long>): String =
        ids.sorted().joinToString(",")

    fun isStuck(recentHashes: List<String>, pendingHash: String): Boolean =
        recentHashes.size >= StuckThreshold &&
            recentHashes.all { it == pendingHash && it.isNotEmpty() }

    fun decide(
        verify: VerifyDayResult,
        nextTurn: Int,
        maxIterations: Int,
        elapsedMs: Long,
        maxWallClockMs: Long,
        recentHashesIncludingCurrent: List<String>,
        pendingHash: String,
    ): DayLoopOutcome {
        if (maxWallClockMs > 0 && elapsedMs > maxWallClockMs) {
            return DayLoopOutcome.Bound("wall_clock")
        }
        if (nextTurn > maxIterations) {
            return DayLoopOutcome.Bound("max_iterations")
        }
        when (verify.status) {
            VerifyStatus.Success ->
                return DayLoopOutcome.Finish(RunStatus.Success, "day_complete", verify)
            VerifyStatus.FailedVerify ->
                return DayLoopOutcome.Finish(RunStatus.FailedVerify, "verify_failed", verify)
            VerifyStatus.Continue -> Unit
        }
        if (isStuck(recentHashesIncludingCurrent, pendingHash)) {
            return DayLoopOutcome.Finish(RunStatus.StuckEscalate, "same_observe_hash", verify)
        }
        return DayLoopOutcome.Continue(verify)
    }

    fun triggerWire(trigger: LoopTrigger): String = when (trigger) {
        LoopTrigger.InApp -> "in_app"
        LoopTrigger.Cli -> "cli"
        LoopTrigger.Http -> "http"
        LoopTrigger.Watch -> "watch"
    }

    fun triggerFromWire(raw: String): LoopTrigger = when (raw) {
        "cli" -> LoopTrigger.Cli
        "http" -> LoopTrigger.Http
        "watch" -> LoopTrigger.Watch
        else -> LoopTrigger.InApp
    }

    fun statusWire(status: RunStatus): String = when (status) {
        RunStatus.Running -> "running"
        RunStatus.Success -> "success"
        RunStatus.FailedBound -> "failed_bound"
        RunStatus.FailedVerify -> "failed_verify"
        RunStatus.StuckAbort -> "stuck_abort"
        RunStatus.StuckEscalate -> "stuck_escalate"
    }

    fun statusFromWire(raw: String): RunStatus = when (raw) {
        "success" -> RunStatus.Success
        "failed_bound" -> RunStatus.FailedBound
        "failed_verify" -> RunStatus.FailedVerify
        "stuck_abort" -> RunStatus.StuckAbort
        "stuck_escalate" -> RunStatus.StuckEscalate
        else -> RunStatus.Running
    }
}
