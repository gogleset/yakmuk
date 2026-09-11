package com.jinlabs.yakok.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface MedicationDao {
    @Query("SELECT * FROM medications WHERE deletedAt IS NULL ORDER BY scheduledTime ASC")
    suspend fun listActive(): List<MedicationEntity>

    @Query("SELECT * FROM medications ORDER BY scheduledTime ASC")
    suspend fun listForCalendar(): List<MedicationEntity>

    @Query("SELECT * FROM medications WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): MedicationEntity?

    @Insert
    suspend fun insert(entity: MedicationEntity): Long

    @Update
    suspend fun update(entity: MedicationEntity)

    @Query("UPDATE medications SET deletedAt = :deletedAt WHERE id = :id")
    suspend fun softDelete(id: Long, deletedAt: String)

    @Query("DELETE FROM medications")
    suspend fun deleteAll()
}

@Dao
interface DailyLogDao {
    @Query(
        "SELECT medicationId FROM daily_logs WHERE logDate = :date AND status = 'TAKEN' AND medicationId IS NOT NULL",
    )
    suspend fun listTakenIds(date: String): List<Long>

    @Query("SELECT * FROM daily_logs WHERE logDate >= :from AND logDate <= :to ORDER BY logDate ASC")
    suspend fun listInRange(from: String, to: String): List<DailyLogEntity>

    @Insert
    suspend fun insert(entity: DailyLogEntity): Long

    @Query(
        "DELETE FROM daily_logs WHERE logDate = :date AND medicationId = :medicationId AND status = 'TAKEN'",
    )
    suspend fun deleteTaken(date: String, medicationId: Long)

    @Query("DELETE FROM daily_logs")
    suspend fun deleteAll()
}

@Dao
interface ProfileDao {
    @Query("SELECT * FROM profile WHERE id = 1 LIMIT 1")
    fun observe(): Flow<ProfileEntity?>

    @Query("SELECT * FROM profile WHERE id = 1 LIMIT 1")
    suspend fun get(): ProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: ProfileEntity)
}
