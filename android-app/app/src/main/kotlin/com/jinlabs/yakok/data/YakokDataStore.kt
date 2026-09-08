package com.jinlabs.yakok.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.jinlabs.yakok.core.constants.PrefKeys

val Context.yakokDataStore: DataStore<Preferences> by preferencesDataStore(name = "yakok")

object YakokPrefKeys {
    val StartTab = stringPreferencesKey(PrefKeys.StartTab)
    val MotionEnabled = booleanPreferencesKey(PrefKeys.MotionEnabled)
    val CareGlanceOpt = booleanPreferencesKey(PrefKeys.CareGlanceOpt)
    val CareGlanceUpdatedAt = longPreferencesKey(PrefKeys.CareGlanceUpdatedAt)
    val WeeklyDigestOpt = booleanPreferencesKey(PrefKeys.WeeklyDigestOpt)
    val WeeklyDigestDismissedWeek = stringPreferencesKey(PrefKeys.WeeklyDigestDismissedWeek)
}
