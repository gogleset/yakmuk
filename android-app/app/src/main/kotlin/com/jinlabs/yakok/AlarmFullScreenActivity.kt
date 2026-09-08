package com.jinlabs.yakok

import android.app.Activity
import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.util.Log
import android.view.WindowManager
import com.jinlabs.yakok.alarm.AlarmClockScheduler
import com.jinlabs.yakok.core.constants.AppScheme
import com.jinlabs.yakok.core.constants.MedAlarm

/**
 * 잠금/화면꺼짐 FSI · AlarmReceiver 전용.
 * 화면 깨우고 MainActivity 딥링크 후 finish.
 */
class AlarmFullScreenActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        @Suppress("DEPRECATION")
        val wakeLock = (getSystemService(POWER_SERVICE) as PowerManager).newWakeLock(
            PowerManager.FULL_WAKE_LOCK or
                PowerManager.ACQUIRE_CAUSES_WAKEUP or
                PowerManager.ON_AFTER_RELEASE,
            "yakmuk:fsi-activity",
        )
        wakeLock.acquire(10_000)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val keyguard = getSystemService(KeyguardManager::class.java)
            keyguard?.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD,
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val deepLink = buildAlarmDeepLink(intent)
        Log.i(
            MedAlarm.LogTag,
            "FSI open deepLink=$deepLink fromReceiver=${intent.getBooleanExtra("yakmuk_from_receiver", false)}",
        )

        val launch = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink)).apply {
            setClass(this@AlarmFullScreenActivity, MainActivity::class.java)
            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                    Intent.FLAG_ACTIVITY_REORDER_TO_FRONT,
            )
            putExtra("yakmuk_alarm_launch", true)
            intent.extras?.let { putExtras(it) }
        }

        try {
            startActivity(launch)
            Log.i(MedAlarm.LogTag, "MainActivity started")
        } catch (e: Exception) {
            Log.e(MedAlarm.LogTag, "MainActivity start failed", e)
        }

        window.decorView.postDelayed(
            {
                cancelMedicationAlarmNotifications()
                try {
                    if (wakeLock.isHeld) wakeLock.release()
                } catch (_: Exception) {
                }
                finish()
            },
            400,
        )
    }

    private fun cancelMedicationAlarmNotifications() {
        try {
            val nm = getSystemService(NotificationManager::class.java) ?: return
            nm.activeNotifications
                ?.filter { it.notification.channelId == MedAlarm.ChannelId }
                ?.forEach { nm.cancel(it.tag, it.id) }
        } catch (e: Exception) {
            Log.w(MedAlarm.LogTag, "cancel notification failed", e)
        }
    }

    private fun buildAlarmDeepLink(source: Intent): String {
        val extras = source.extras
        val prefs = getSharedPreferences(AlarmClockScheduler.PREFS, MODE_PRIVATE)
        fun prefOrExtra(key: String): String? =
            readExtraString(extras, key)
                ?: prefs.getString(key, null)?.takeIf { it.isNotBlank() }
        val medicationId = prefOrExtra("medicationId")
        val name = prefOrExtra("name")
        val scheduledTime = prefOrExtra("scheduledTime")
        val useMethod = prefOrExtra("useMethod")
        val doseAmount = prefOrExtra("doseAmount")
        val doseUnit = prefOrExtra("doseUnit")
        prefs.edit().clear().apply()

        val q = LinkedHashMap<String, String>()
        if (!medicationId.isNullOrBlank()) q["medicationId"] = medicationId
        if (!name.isNullOrBlank()) q["name"] = name
        if (!scheduledTime.isNullOrBlank()) q["scheduledTime"] = scheduledTime
        if (!useMethod.isNullOrBlank()) q["useMethod"] = useMethod
        if (!doseAmount.isNullOrBlank()) q["doseAmount"] = doseAmount
        if (!doseUnit.isNullOrBlank()) q["doseUnit"] = doseUnit

        val query = q.entries.joinToString("&") { (k, v) ->
            "${Uri.encode(k)}=${Uri.encode(v)}"
        }
        return if (query.isEmpty()) {
            "${AppScheme.Value}://${MedAlarm.DeepLinkHost}"
        } else {
            "${AppScheme.Value}://${MedAlarm.DeepLinkHost}?$query"
        }
    }

    private fun readExtraString(extras: Bundle?, key: String): String? {
        if (extras == null) return null
        if (extras.containsKey(key)) {
            return when (val v = extras.get(key)) {
                is String -> v
                is Number -> v.toString()
                else -> v?.toString()
            }
        }
        val dataBundle = extras.getBundle("data")
        if (dataBundle != null && dataBundle.containsKey(key)) {
            return dataBundle.getString(key) ?: dataBundle.get(key)?.toString()
        }
        @Suppress("UNCHECKED_CAST")
        val dataMap = extras.getSerializable("data") as? HashMap<String, Any?>
        if (dataMap != null) {
            return dataMap[key]?.toString()
        }
        return null
    }
}
