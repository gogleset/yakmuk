package com.jinlabs.yakok.data

import com.jinlabs.yakok.BuildConfig
import com.jinlabs.yakok.core.config.SupabaseConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SupabaseModule {
    @Provides
    @Singleton
    fun supabaseConfig(): SupabaseConfig = SupabaseConfig(
        url = SupabaseConfig.resolveLocalUrl(BuildConfig.SUPABASE_URL),
        anonKey = BuildConfig.SUPABASE_ANON_KEY,
    )

    @Provides
    @Singleton
    fun supabaseClient(
        config: SupabaseConfig,
        sessionStore: EncryptedSessionStore,
    ): SupabaseClient =
        createSupabaseClient(config.url, config.anonKey) {
            install(Auth) {
                sessionManager = EncryptedPrefsSessionManager(sessionStore)
            }
            install(Postgrest)
            install(Realtime)
            install(Functions)
        }
}
