package com.jinlabs.yakok.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import com.jinlabs.yakok.core.prefs.StartTab
import com.jinlabs.yakok.core.prefs.StartTabs
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

@Singleton
class PrefsRepository @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    val startTab: Flow<StartTab> = context.yakokDataStore.data.map { prefs ->
        StartTabs.parse(prefs[YakokPrefKeys.StartTab])
    }

    val motionEnabled: Flow<Boolean> = context.yakokDataStore.data.map { prefs ->
        prefs[YakokPrefKeys.MotionEnabled] ?: true
    }

    val careGlanceOpt: Flow<Boolean> = context.yakokDataStore.data.map { prefs ->
        prefs[YakokPrefKeys.CareGlanceOpt] ?: true
    }

    val weeklyDigestOpt: Flow<Boolean> = context.yakokDataStore.data.map { prefs ->
        prefs[YakokPrefKeys.WeeklyDigestOpt] ?: true
    }

    suspend fun getStartTab(): StartTab = startTab.first()
    suspend fun setStartTab(tab: StartTab) {
        context.yakokDataStore.edit { it[YakokPrefKeys.StartTab] = StartTabs.storageValue(tab) }
    }

    suspend fun isMotionEnabled(): Boolean = motionEnabled.first()
    suspend fun setMotionEnabled(enabled: Boolean) {
        context.yakokDataStore.edit { it[YakokPrefKeys.MotionEnabled] = enabled }
    }

    suspend fun isCareGlanceOpt(): Boolean = careGlanceOpt.first()
    suspend fun setCareGlanceOpt(enabled: Boolean) {
        context.yakokDataStore.edit { it[YakokPrefKeys.CareGlanceOpt] = enabled }
    }

    suspend fun careGlanceUpdatedAt(): Long? =
        context.yakokDataStore.data.first()[YakokPrefKeys.CareGlanceUpdatedAt]

    suspend fun setCareGlanceUpdatedAt(ms: Long) {
        context.yakokDataStore.edit { it[YakokPrefKeys.CareGlanceUpdatedAt] = ms }
    }

    suspend fun isWeeklyDigestOpt(): Boolean = weeklyDigestOpt.first()
    suspend fun setWeeklyDigestOpt(enabled: Boolean) {
        context.yakokDataStore.edit { it[YakokPrefKeys.WeeklyDigestOpt] = enabled }
    }

    suspend fun dismissedWeeklyWeek(): String? =
        context.yakokDataStore.data.first()[YakokPrefKeys.WeeklyDigestDismissedWeek]

    suspend fun dismissWeeklyWeek(weekStartYmd: String) {
        context.yakokDataStore.edit { it[YakokPrefKeys.WeeklyDigestDismissedWeek] = weekStartYmd }
    }
}
