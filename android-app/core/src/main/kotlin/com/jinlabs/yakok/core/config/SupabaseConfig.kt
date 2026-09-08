package com.jinlabs.yakok.core.config

/**
 * 로컬 supabase start. RN `shared/config/env.ts`.
 * 에뮬레이터는 10.0.2.2, 실기기는 LAN을 gradle/local에서 덮어쓴다.
 */
data class SupabaseConfig(
    val url: String,
    val anonKey: String,
) {
    companion object {
        const val EmulatorUrl = "http://10.0.2.2:54421"
        const val LocalAnonKey =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

        fun resolveLocalUrl(url: String): String =
            url.replace("127.0.0.1", "10.0.2.2").replace("localhost", "10.0.2.2")
    }
}
