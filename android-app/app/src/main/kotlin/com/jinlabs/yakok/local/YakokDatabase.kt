package com.jinlabs.yakok.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [MedicationEntity::class, DailyLogEntity::class, ProfileEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class YakokDatabase : RoomDatabase() {
    abstract fun medications(): MedicationDao
    abstract fun logs(): DailyLogDao
    abstract fun profile(): ProfileDao
}
