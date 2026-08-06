const {
  withDangerousMod,
  withMainApplication,
  createRunOncePlugin,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TAG = 'withAndroidAlarmLauncher';

const MODULE_KT = `package com.jinlabs.yakok

import android.app.ActivityOptions
import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * 복약 강제 기동:
 * 1) AlarmManager.setAlarmClock(Activity PI) — 종료/잠금해제에서도 시스템이 Activity 기동 (시계 앱과 동일)
 * 2) DELIVERED 폴백 — notify(fullScreenIntent) + allowlist 후 PI.send
 */
class AlarmLauncherModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "YakmukAlarmLauncher"

  @ReactMethod
  fun canUseFullScreenIntent(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < 34) {
        promise.resolve(true)
        return
      }
      val nm = reactContext.getSystemService(NotificationManager::class.java)
      if (nm == null) {
        promise.resolve(false)
        return
      }
      promise.resolve(nm.canUseFullScreenIntent())
    } catch (e: Exception) {
      promise.reject("FSI_CHECK_FAILED", e.message, e)
    }
  }

  /**
   * 시계 알람 — operation = AlarmReceiver(Broadcast).
   * Activity PI도 백그라운드에선 BAL_BLOCK(에뮬 API34).
   * Receiver는 FSI notify만 → 화면 OFF에서 시스템이 기동.
   */
  @ReactMethod
  fun scheduleAlarmClock(
    triggerAtMs: Double,
    requestCode: Int,
    data: ReadableMap?,
    promise: Promise,
  ) {
    try {
      val trigger = triggerAtMs.toLong()
      if (trigger <= System.currentTimeMillis()) {
        promise.reject("INVALID_TIME", "triggerAtMs must be in the future")
        return
      }

      val extras = bundleFromReadable(data)
      extras.putBoolean("yakmuk_alarm_launch", true)
      extras.putInt("yakmuk_req", requestCode)

      val receiverIntent =
        Intent(reactContext, AlarmReceiver::class.java).apply {
          action = AlarmReceiver.ACTION_PREFIX + requestCode
          putExtras(extras)
        }

      val piFlags =
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      val operation =
        PendingIntent.getBroadcast(
          reactContext,
          requestCode,
          receiverIntent,
          piFlags,
        )

      // 상태바 "다음 알람" 표시용
      val showIntent =
        Intent(reactContext, MainActivity::class.java).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
      val showPi =
        PendingIntent.getActivity(
          reactContext,
          requestCode + SHOW_PI_OFFSET,
          showIntent,
          piFlags,
        )

      val am =
        reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val info = AlarmManager.AlarmClockInfo(trigger, showPi)
      am.setAlarmClock(info, operation)

      rememberRequestCode(requestCode)
      persistPending(extras)

      Log.i(
        TAG,
        "scheduleAlarmClock(fsi-broadcast) req=" +
          requestCode +
          " at=" +
          java.util.Date(trigger),
      )
      promise.resolve(true)
    } catch (e: Exception) {
      Log.e(TAG, "scheduleAlarmClock failed", e)
      promise.reject("SCHEDULE_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun cancelAlarmClock(requestCode: Int, promise: Promise) {
    try {
      cancelOne(requestCode)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("CANCEL_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun cancelAllAlarmClocks(promise: Promise) {
    try {
      val prefs =
        reactContext.getSharedPreferences(PREFS_CODES, Context.MODE_PRIVATE)
      val codes = prefs.getStringSet(KEY_CODES, emptySet())?.toSet().orEmpty()
      for (raw in codes) {
        val code = raw.toIntOrNull() ?: continue
        cancelOne(code)
      }
      prefs.edit().remove(KEY_CODES).apply()
      Log.i(TAG, "cancelAllAlarmClocks count=\${codes.size}")
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("CANCEL_FAILED", e.message, e)
    }
  }

  @ReactMethod
  fun launchApp(promise: Promise) {
    launchAlarmUi(null, promise)
  }

  @ReactMethod
  fun launchAlarmUi(data: ReadableMap?, promise: Promise) {
    Thread {
      try {
        doLaunchAlarmUi(data)
        promise.resolve(true)
      } catch (e: Exception) {
        Log.e(TAG, "launchAlarmUi failed", e)
        promise.reject("LAUNCH_FAILED", e.message, e)
      }
    }.start()
  }

  private fun cancelOne(requestCode: Int) {
    val am =
      reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val piFlags =
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    val receiverIntent =
      Intent(reactContext, AlarmReceiver::class.java).apply {
        action = AlarmReceiver.ACTION_PREFIX + requestCode
      }
    val operation =
      PendingIntent.getBroadcast(
        reactContext,
        requestCode,
        receiverIntent,
        piFlags,
      )
    am.cancel(operation)
    operation.cancel()

    val showIntent = Intent(reactContext, MainActivity::class.java)
    val showPi =
      PendingIntent.getActivity(
        reactContext,
        requestCode + SHOW_PI_OFFSET,
        showIntent,
        piFlags,
      )
    am.cancel(showPi)
    showPi.cancel()
    forgetRequestCode(requestCode)
  }

  private fun rememberRequestCode(requestCode: Int) {
    val prefs =
      reactContext.getSharedPreferences(PREFS_CODES, Context.MODE_PRIVATE)
    val next =
      (prefs.getStringSet(KEY_CODES, emptySet())?.toMutableSet() ?: mutableSetOf())
    next.add(requestCode.toString())
    prefs.edit().putStringSet(KEY_CODES, next).apply()
  }

  private fun forgetRequestCode(requestCode: Int) {
    val prefs =
      reactContext.getSharedPreferences(PREFS_CODES, Context.MODE_PRIVATE)
    val next =
      (prefs.getStringSet(KEY_CODES, emptySet())?.toMutableSet() ?: mutableSetOf())
    next.remove(requestCode.toString())
    prefs.edit().putStringSet(KEY_CODES, next).apply()
  }

  private fun doLaunchAlarmUi(data: ReadableMap?) {
    val extras = bundleFromReadable(data)
    extras.putBoolean("yakmuk_alarm_launch", true)
    persistPending(extras)

    val fsiIntent =
      Intent(reactContext, AlarmFullScreenActivity::class.java).apply {
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_NO_USER_ACTION,
        )
        putExtras(extras)
      }

    val piFlags =
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    val fullScreenPi =
      PendingIntent.getActivity(reactContext, REQ_FSI, fsiIntent, piFlags)
    val contentPi =
      PendingIntent.getActivity(reactContext, REQ_CONTENT, fsiIntent, piFlags)

    val title =
      extras.getString("name")?.takeIf { it.isNotBlank() } ?: "약 먹을 시간"
    val body =
      extras.getString("scheduledTime")?.takeIf { it.isNotBlank() }
        ?.let { "\$it · 확인해주세요" }
        ?: "확인해주세요"

    val icon =
      reactContext.applicationInfo.icon.takeIf { it != 0 }
        ?: android.R.drawable.ic_lock_idle_alarm

    val notification =
      NotificationCompat.Builder(reactContext, CHANNEL_ID)
        .setSmallIcon(icon)
        .setContentTitle(title)
        .setContentText(body)
        .setCategory(NotificationCompat.CATEGORY_ALARM)
        .setPriority(NotificationCompat.PRIORITY_MAX)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .setAutoCancel(true)
        .setContentIntent(contentPi)
        .setFullScreenIntent(fullScreenPi, true)
        .setTimeoutAfter(60_000)
        .build()

    val pm =
      reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
    @Suppress("DEPRECATION")
    val wakeLock =
      pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "yakmuk:alarm-launch")
    wakeLock.acquire(5_000)

    try {
      NotificationManagerCompat.from(reactContext).notify(NOTIF_ID, notification)
      Log.i(TAG, "posted FSI notif id=\$NOTIF_ID title=\$title")

      val latch = CountDownLatch(1)
      Handler(Looper.getMainLooper()).postDelayed(
        {
          try {
            fireLaunch(fsiIntent, fullScreenPi)
          } finally {
            latch.countDown()
          }
        },
        200,
      )
      latch.await(3, TimeUnit.SECONDS)
    } finally {
      if (wakeLock.isHeld) wakeLock.release()
    }
  }

  private fun fireLaunch(fsiIntent: Intent, fullScreenPi: PendingIntent) {
    try {
      if (Build.VERSION.SDK_INT >= 34) {
        val options = ActivityOptions.makeBasic()
        options.setPendingIntentBackgroundActivityStartMode(
          ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED,
        )
        fullScreenPi.send(
          reactContext,
          0,
          null,
          null,
          null,
          null,
          options.toBundle(),
        )
      } else {
        fullScreenPi.send()
      }
      Log.i(TAG, "fullScreenPi.send issued")
    } catch (e: Exception) {
      Log.w(TAG, "fullScreenPi.send failed", e)
    }
    try {
      reactContext.startActivity(fsiIntent)
      Log.i(TAG, "startActivity issued")
    } catch (e: Exception) {
      Log.w(TAG, "startActivity blocked", e)
    }
  }

  private fun bundleFromReadable(data: ReadableMap?): Bundle {
    val extras = Bundle()
    if (data == null) return extras
    val it = data.keySetIterator()
    while (it.hasNextKey()) {
      val key = it.nextKey()
      when (data.getType(key)) {
        ReadableType.String -> extras.putString(key, data.getString(key))
        ReadableType.Number -> {
          val n = data.getDouble(key)
          extras.putString(
            key,
            if (n == n.toLong().toDouble()) n.toLong().toString() else n.toString(),
          )
        }
        ReadableType.Boolean ->
          extras.putString(key, data.getBoolean(key).toString())
        else -> Unit
      }
    }
    return extras
  }

  private fun persistPending(extras: Bundle) {
    try {
      val prefs =
        reactContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      val editor = prefs.edit().clear()
      for (key in extras.keySet()) {
        val v = extras.get(key) ?: continue
        editor.putString(key, v.toString())
      }
      editor.putLong("savedAt", System.currentTimeMillis()).apply()
    } catch (e: Exception) {
      Log.w(TAG, "persist pending failed", e)
    }
  }

  companion object {
    private const val TAG = "yakmuk-fsi"
    private const val CHANNEL_ID = "medication-alarm"
    private const val NOTIF_ID = 9702
    private const val REQ_FSI = 9702
    private const val REQ_CONTENT = 9703
    private const val SHOW_PI_OFFSET = 100_000
    private const val PREFS_CODES = "yakmuk_alarm_codes"
    private const val KEY_CODES = "codes"
    const val PREFS = "yakmuk_alarm_pending"
  }
}
`;


const PACKAGE_KT = `package com.jinlabs.yakok

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AlarmLauncherPackage : ReactPackage {
  override fun createNativeModules(
    reactContext: ReactApplicationContext,
  ): List<NativeModule> = listOf(AlarmLauncherModule(reactContext))

  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> = emptyList()
}
`;

function withAlarmLauncherFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const dir = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/java/com/jinlabs/yakok',
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'AlarmLauncherModule.kt'), MODULE_KT);
      fs.writeFileSync(path.join(dir, 'AlarmLauncherPackage.kt'), PACKAGE_KT);
      return mod;
    },
  ]);
}

function withAlarmLauncherPackage(config) {
  return withMainApplication(config, (mod) => {
    let src = mod.modResults.contents;
    if (src.includes('AlarmLauncherPackage()')) {
      return mod;
    }
    if (!src.includes('PackageList(this).packages.apply')) {
      throw new Error(
        `[${TAG}] PackageList apply 블록을 찾지 못함 — Expo 템플릿 확인`,
      );
    }
    src = src.replace(
      /PackageList\(this\)\.packages\.apply\s*\{/,
      (match) =>
        `${match}\n          // 알림 DELIVERED → MainActivity 강제 기동 (FSI 폴백)\n          add(AlarmLauncherPackage())`,
    );
    mod.modResults.contents = src;
    return mod;
  });
}

function withAndroidAlarmLauncher(config) {
  config = withAlarmLauncherFiles(config);
  config = withAlarmLauncherPackage(config);
  return config;
}

module.exports = createRunOncePlugin(
  withAndroidAlarmLauncher,
  TAG, '1.0.8',
);
