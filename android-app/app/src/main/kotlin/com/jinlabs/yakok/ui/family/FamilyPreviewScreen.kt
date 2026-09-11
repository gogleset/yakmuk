package com.jinlabs.yakok.ui.family

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant

@Composable
fun FamilyPreviewScreen() {
    Column(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top,
    ) {
        Text(
            Copy.FamilyPreview.Title,
            fontWeight = FontWeight.Bold,
            fontSize = 24.sp,
            color = Color(Colors.Text),
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(16.dp))
        Text(
            Copy.FamilyPreview.Banner,
            color = Color(Colors.Brand),
            fontSize = 14.sp,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(Radius.Lg.dp))
                .background(Color(Colors.BrandSoft))
                .padding(14.dp),
        )
        Spacer(Modifier.height(32.dp))
        KokiImage(KokiVariant.Family, 128)
        Spacer(Modifier.height(16.dp))
        Text(
            Copy.FamilyPreview.Body,
            color = Color(Colors.Muted),
            textAlign = TextAlign.Center,
        )
    }
}
