package com.jinlabs.yakok.local

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object LocalModule {
    @Provides
    @Singleton
    fun database(@ApplicationContext context: Context): YakokDatabase =
        Room.databaseBuilder(context, YakokDatabase::class.java, "yakok.db").build()
}
