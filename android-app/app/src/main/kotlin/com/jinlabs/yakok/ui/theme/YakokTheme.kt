package com.jinlabs.yakok.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.jinlabs.yakok.core.theme.Colors

private val LightScheme = lightColorScheme(
    primary = Color(Colors.Brand),
    onPrimary = Color(Colors.Ink),
    primaryContainer = Color(Colors.BrandSoft),
    onPrimaryContainer = Color(Colors.Text),
    secondary = Color(Colors.BrandSoft),
    onSecondary = Color(Colors.Text),
    background = Color(Colors.Canvas),
    onBackground = Color(Colors.Text),
    surface = Color(Colors.Surface),
    onSurface = Color(Colors.Text),
    surfaceVariant = Color(Colors.SurfaceSoft),
    onSurfaceVariant = Color(Colors.Muted),
    error = Color(Colors.Destructive),
    onError = Color(Colors.White),
    outline = Color(Colors.Line),
)

@Composable
fun YakokTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightScheme,
        content = content,
    )
}
