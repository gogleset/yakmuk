package com.jinlabs.yakok

import android.app.Application
import com.jinlabs.yakok.alarm.MedicationAlarmChannel
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class YakokApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        MedicationAlarmChannel.ensure(this)
    }
}
