package com.jinlabs.yakok.alarm

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.jinlabs.yakok.core.constants.MedAlarm
import com.jinlabs.yakok.core.med.AlarmFingerprint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AlarmClockSchedulerInstrumentedTest {
    @Test
    fun scheduleAndCancel_storesFingerprint() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val scheduler = AlarmClockScheduler(context)
        scheduler.cancelAll()
        val fp = "1|daily|8:0|clk4"
        val trigger = System.currentTimeMillis() + 120_000
        scheduler.schedule(
            trigger,
            fp,
            mapOf(
                "kind" to MedAlarm.Kind,
                "name" to "test",
                "medicationId" to "1",
                "fingerprint" to fp,
            ),
        )
        assertEquals(listOf(fp), scheduler.storedFingerprints())
        assertEquals(670434, AlarmFingerprint.requestCode(fp))
        scheduler.cancelAll()
        assertTrue(scheduler.storedFingerprints().isEmpty())
    }

    @Test
    fun channel_ensure_doesNotThrow() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        MedicationAlarmChannel.ensure(context)
        MedicationAlarmChannel.ensure(context)
    }
}
