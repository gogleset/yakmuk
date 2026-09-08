package com.jinlabs.yakok.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.theme.Colors

@Composable
fun FunnelScaffold(
    title: String,
    ctaLabel: String,
    onCta: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    ctaEnabled: Boolean = true,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier
            .fillMaxSize()
            .statusBarsPadding()
            .imePadding()
            .padding(horizontal = 24.dp),
    ) {
        IconButton(onClick = onBack) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = Copy.Welcome.Back,
                tint = Color(Colors.Brand),
            )
        }
        Text(
            title,
            color = Color(Colors.Text),
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = 32.sp,
            modifier = Modifier.padding(top = 8.dp, bottom = 20.dp),
        )
        Column(
            Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState()),
        ) {
            content()
        }
        YakokButton(
            label = ctaLabel,
            onClick = onCta,
            enabled = ctaEnabled,
            modifier = Modifier.padding(vertical = 16.dp),
        )
        Spacer(Modifier.height(8.dp))
    }
}
