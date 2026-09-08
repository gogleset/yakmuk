package com.jinlabs.yakok.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.jinlabs.yakok.AlarmReceiver
import com.jinlabs.yakok.MainActivity
import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.med.AlarmFingerprint
import com.jinlabs.yakok.core.med.ExpectedMedAlarm
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.datetime.Clock

@Singleton
class AlarmClockScheduler @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    fun storedFingerprints(): List<String> {
        val prefs = context.getSharedPreferences(PREFS_CODES, Context.MODE_PRIVATE)
        return prefs.getStringSet(KEY_FPS, emptySet()).orEmpty().sorted()
    }

    fun scheduleAll(alarms: List<ExpectedMedAlarm>, nowMs: Long = Clock.System.now().toEpochMilliseconds()) {
        cancelAll()
        for (alarm in alarms) {
            val fp = AlarmFingerprint.fingerprint(alarm)
            val trigger = AlarmFingerprint.nextTriggerAtMs(alarm, kotlinx.datetime.Instant.fromEpochMilliseconds(nowMs))
            if (trigger <= nowMs) continue
            schedule(trigger, fp, AlarmFingerprint.notifData(alarm, fp))
        }
    }

    fun schedule(triggerAtMs: Long, fingerprint: String, data: Map<String, String>) {
        val requestCode = AlarmFingerprint.requestCode(fingerprint)
        val extras = Bundle()
        for ((k, v) in data) extras.putString(k, v)
        extras.putBoolean("yakmuk_alarm_launch", true)
        extras.putInt("yakmuk_req", requestCode)

        val receiverIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_PREFIX + requestCode
            putExtras(extras)
        }
        val piFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val operation = PendingIntent.getBroadcast(context, requestCode, receiverIntent, piFlags)
        val showIntent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val showPi = PendingIntent.getActivity(
            context,
            requestCode + SHOW_PI_OFFSET,
            showIntent,
            piFlags,
        )
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.setAlarmClock(AlarmManager.AlarmClockInfo(triggerAtMs, showPi), operation)
        remember(requestCode, fingerprint)
        persistPending(extras)
        Log.i(
            MedAlarm.LogTag,
            "scheduleAlarmClock(fsi-broadcast) req=$requestCode at=${java.util.Date(triggerAtMs)}",
        )
    }

    fun cancelAll() {
        val prefs = context.getSharedPreferences(PREFS_CODES, Context.MODE_PRIVATE)
        val codes = prefs.getStringSet(KEY_CODES, emptySet()).orEmpty()
        for (raw in codes) {
            val code = raw.toIntOrNull() ?: continue
            cancelOne(code)
        }
        prefs.edit().remove(KEY_CODES).remove(KEY_FPS).apply()
        Log.i(MedAlarm.LogTag, "cancelAllAlarmClocks count=${codes.size}")
    }

    private fun cancelOne(requestCode: Int) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val piFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val receiverIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_PREFIX + requestCode
        }
        val operation = PendingIntent.getBroadcast(context, requestCode, receiverIntent, piFlags)
        am.cancel(operation)
        operation.cancel()
        val showIntent = Intent(context, MainActivity::class.java)
        val showPi = PendingIntent.getActivity(
            context,
            requestCode + SHOW_PI_OFFSET,
            showIntent,
            piFlags,
        )
        am.cancel(showPi)
        showPi.cancel()
    }

    private fun remember(requestCode: Int, fingerprint: String) {
        val prefs = context.getSharedPreferences(PREFS_CODES, Context.MODE_PRIVATE)
        val codes = prefs.getStringSet(KEY_CODES, emptySet())?.toMutableSet() ?: mutableSetOf()
        val fps = prefs.getStringSet(KEY_FPS, emptySet())?.toMutableSet() ?: mutableSetOf()
        codes.add(requestCode.toString())
        fps.add(fingerprint)
        prefs.edit().putStringSet(KEY_CODES, codes).putStringSet(KEY_FPS, fps).apply()
    }

    private fun persistPending(extras: Bundle) {
        try {
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val editor = prefs.edit().clear()
            for (key in extras.keySet()) {
                val v = extras.get(key) ?: continue
                editor.putString(key, v.toString())
            }
            editor.putLong("savedAt", System.currentTimeMillis()).apply()
        } catch (e: Exception) {
            Log.w(MedAlarm.LogTag, "persist pending failed", e)
        }
    }

    companion object {
        const val PREFS = "yakmuk_alarm_pending"
        private const val PREFS_CODES = "yakmuk_alarm_codes"
        private const val KEY_CODES = "codes"
        private const val KEY_FPS = "fingerprints"
        private const val SHOW_PI_OFFSET = 100_000
    }
}
