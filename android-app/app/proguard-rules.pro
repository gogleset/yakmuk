# supabase-kt / kotlinx.serialization — minify off in S1, rules ready for later
-keep class io.github.jan.supabase.** { *; }
-keep class kotlinx.serialization.** { *; }
-keepattributes *Annotation*, InnerClasses
-dontwarn kotlinx.serialization.**
-dontwarn io.github.jan.supabase.**
-keep class com.google.firebase.** { *; }
