package com.jinlabs.yakok.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.jinlabs.yakok.R

enum class KokiVariant { Welcome, Family, Happy, Empty, Thinking, Worried, Medicine, Cheer }

@Composable
fun KokiImage(variant: KokiVariant, size: Int, modifier: Modifier = Modifier) {
    val res = when (variant) {
        KokiVariant.Welcome, KokiVariant.Family -> R.drawable.koki_wave
        KokiVariant.Happy -> R.drawable.koki_thanks
        KokiVariant.Empty -> R.drawable.koki_empty
        KokiVariant.Thinking -> R.drawable.koki_thinking
        KokiVariant.Worried -> R.drawable.koki_worried
        KokiVariant.Medicine -> R.drawable.koki_medicine
        KokiVariant.Cheer -> R.drawable.koki_cheer
    }
    Image(
        painter = painterResource(res),
        contentDescription = null,
        modifier = modifier.size(size.dp),
        contentScale = ContentScale.Fit,
    )
}
