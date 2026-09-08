package com.jinlabs.yakok.ui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius

enum class YakokButtonVariant { Primary, Outline, Oauth }

@Composable
fun YakokButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: YakokButtonVariant = YakokButtonVariant.Primary,
    enabled: Boolean = true,
) {
    val container = when (variant) {
        YakokButtonVariant.Primary -> Color(Colors.Brand)
        YakokButtonVariant.Outline -> Color(Colors.SurfaceSoft)
        YakokButtonVariant.Oauth -> Color(Colors.White)
    }
    val content = when (variant) {
        YakokButtonVariant.Primary -> Color(Colors.Ink)
        YakokButtonVariant.Outline, YakokButtonVariant.Oauth -> Color(Colors.Text)
    }
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp),
        shape = RoundedCornerShape(Radius.Pill.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = container,
            contentColor = content,
            disabledContainerColor = Color(Colors.Disabled),
            disabledContentColor = Color(Colors.White),
        ),
        contentPadding = PaddingValues(horizontal = 20.dp),
        elevation = ButtonDefaults.buttonElevation(0.dp, 0.dp, 0.dp, 0.dp, 0.dp),
    ) {
        Text(label, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
    }
}
