package com.jinlabs.yakok.alarm

import android.content.Context
import android.util.Log
import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.med.AlarmFingerprint
import com.jinlabs.yakok.core.time.Kst
import com.jinlabs.yakok.local.LocalMedStore
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.datetime.Clock

enum class AlarmPrompt { None, Notifications, ExactAlarm, Fsi }

@Singleton
class AlarmReconciler @Inject constructor(
    @ApplicationContext private val context: Context,
    private val store: LocalMedStore,
    private val scheduler: AlarmClockScheduler,
    private val permissions: AlarmPermissions,
) {
    @Volatile private var exactPrompted = false
    @Volatile private var fsiPrompted = false
    @Volatile private var notifPrompted = false

    suspend fun reconcile(): AlarmPrompt {
        MedicationAlarmChannel.ensure(context)

        if (!permissions.hasPostNotifications()) {
            Log.i(MedAlarm.LogTag, "reconcile skip reason=permission-denied")
            return consumePrompt(notifPrompted) { notifPrompted = true; AlarmPrompt.Notifications }
        }

        val exact = permissions.exactAlarmStatus()
        if (exact == ExactAlarmStatus.Disabled) {
            Log.i(MedAlarm.LogTag, "reconcile skip reason=exact-alarm-disabled")
            return consumePrompt(exactPrompted) { exactPrompted = true; AlarmPrompt.ExactAlarm }
        }

        val today = Kst.todayDateString(Clock.System.now())
        val medications = runCatching { store.listActive() }.getOrElse {
            Log.w(MedAlarm.LogTag, "reconcile list meds failed", it)
            return AlarmPrompt.None
        }
        val taken = runCatching { store.listTodayTaken(today) }.getOrElse {
            Log.w(MedAlarm.LogTag, "reconcile list taken failed", it)
            return AlarmPrompt.None
        }
        val expected = AlarmFingerprint.buildExpectedSchedule(medications, taken)
        val expectedFp = AlarmFingerprint.fingerprintsOf(expected)
        val scheduledFp = scheduler.storedFingerprints()
        val diff = AlarmFingerprint.diffFingerprints(expectedFp, scheduledFp)
        Log.i(
            MedAlarm.LogTag,
            "reconcile start expected=${expectedFp.size} scheduled=${scheduledFp.size} inSync=${diff.inSync}",
        )
        if (!diff.inSync) {
            scheduler.scheduleAll(expected)
            Log.i(MedAlarm.LogTag, "resync done scheduled=${expected.size}")
        }

        if (permissions.fsiStatus() == FsiStatus.Denied) {
            return consumePrompt(fsiPrompted) { fsiPrompted = true; AlarmPrompt.Fsi }
        }
        return AlarmPrompt.None
    }

    private inline fun consumePrompt(already: Boolean, mark: () -> AlarmPrompt): AlarmPrompt {
        if (already) return AlarmPrompt.None
        return mark()
    }
}
