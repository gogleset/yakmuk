package com.jinlabs.yakok.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.core.user.JoinCodes

@Composable
fun YakokField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    maxLength: Int? = null,
    singleLine: Boolean = true,
    secret: Boolean = false,
) {
    OutlinedTextField(
        value = value,
        onValueChange = { next ->
            val clipped = if (maxLength != null) next.take(maxLength) else next
            onValueChange(clipped)
        },
        modifier = modifier.fillMaxWidth(),
        placeholder = {
            Text(placeholder, color = Color(Colors.Muted))
        },
        singleLine = singleLine,
        visualTransformation = if (secret) {
            androidx.compose.ui.text.input.PasswordVisualTransformation()
        } else {
            androidx.compose.ui.text.input.VisualTransformation.None
        },
        shape = RoundedCornerShape(Radius.Lg.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = Color(Colors.Surface),
            unfocusedContainerColor = Color(Colors.Surface),
            focusedBorderColor = Color(Colors.Brand),
            unfocusedBorderColor = Color.Transparent,
            cursorColor = Color(Colors.Brand),
        ),
    )
}

@Composable
fun InviteCodeField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value,
        onValueChange = { next ->
            onValueChange(JoinCodes.normalize(next).take(Limits.InviteCodeLength))
        },
        modifier = modifier.fillMaxWidth(),
        singleLine = true,
        textStyle = androidx.compose.ui.text.TextStyle(
            letterSpacing = Limits.InviteCodeLetterSpacing.sp,
            fontSize = 24.sp,
        ),
        keyboardOptions = KeyboardOptions(
            capitalization = KeyboardCapitalization.Characters,
            keyboardType = KeyboardType.Ascii,
        ),
        shape = RoundedCornerShape(Radius.Lg.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = Color(Colors.SurfaceSoft),
            unfocusedContainerColor = Color(Colors.SurfaceSoft),
            focusedBorderColor = Color(Colors.Brand),
            unfocusedBorderColor = Color.Transparent,
            cursorColor = Color(Colors.Brand),
        ),
    )
}
