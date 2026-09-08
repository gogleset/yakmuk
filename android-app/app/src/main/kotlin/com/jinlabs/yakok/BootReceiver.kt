package com.jinlabs.yakok

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.jinlabs.yakok.alarm.AlarmReconciler
import com.jinlabs.yakok.core.constants.MedAlarm
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {
    @Inject lateinit var reconciler: AlarmReconciler

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (
            action != Intent.ACTION_BOOT_COMPLETED &&
            action != Intent.ACTION_MY_PACKAGE_REPLACED
        ) {
            return
        }
        Log.i(MedAlarm.LogTag, "BootReceiver action=$action")
        val pending = goAsync()
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
        scope.launch {
            try {
                reconciler.reconcile()
            } catch (e: Exception) {
                Log.w(MedAlarm.LogTag, "boot reconcile failed", e)
            } finally {
                pending.finish()
                scope.cancel()
            }
        }
    }
}
