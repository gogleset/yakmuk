package com.jinlabs.yakok

import android.app.Application
import com.jinlabs.yakok.alarm.CareGlanceChannel
import com.jinlabs.yakok.alarm.MedicationAlarmChannel
import com.jinlabs.yakok.push.CarePushChannel
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class YakokApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        MedicationAlarmChannel.ensure(this)
        CareGlanceChannel.ensure(this)
        CarePushChannel.ensure(this)
    }
}
