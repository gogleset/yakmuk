package com.jinlabs.yakok.ui.auth

import android.app.Activity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jinlabs.yakok.BuildConfig
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.ui.components.FunnelScaffold
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant
import com.jinlabs.yakok.ui.components.YakokButton
import com.jinlabs.yakok.ui.components.YakokButtonVariant
import com.jinlabs.yakok.ui.components.YakokField

@Composable
fun WelcomeScreen(
    state: AuthUiState,
    googleConfigured: Boolean,
    onSignInGoogle: (Activity) -> Unit,
    onSignInDev: (String, String) -> Unit,
    onCreateFamily: (String, String) -> Unit,
    onSignOut: () -> Unit,
    onClearStaleAnon: () -> Unit,
    onOpenJoin: () -> Unit,
) {
    val activity = LocalContext.current as Activity
    LaunchedEffect(state.bootstrapping, state.sessionUserId, state.isAnonymous, state.hasFamily) {
        if (!state.bootstrapping) onClearStaleAnon()
    }

    if (state.needsFamilySetup) {
        FamilySetup(
            busy = state.busy,
            onBack = onSignOut,
            onCreate = onCreateFamily,
        )
        return
    }

    var path by rememberSaveable { mutableStateOf("choose") }
    if (path == "leader") {
        LeaderLogin(
            busy = state.busy,
            googleConfigured = googleConfigured,
            onBack = { path = "choose" },
            onGoogle = { onSignInGoogle(activity) },
            onDev = onSignInDev,
        )
    } else {
        WelcomeChoose(
            onCreateFamily = { path = "leader" },
            onHasInvite = onOpenJoin,
        )
    }
}

@Composable
private fun WelcomeChoose(
    onCreateFamily: () -> Unit,
    onHasInvite: () -> Unit,
) {
    Column(
        Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = 24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            Copy.Welcome.Title,
            color = Color(Colors.Text),
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = 36.sp,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(10.dp))
        Text(
            Copy.Welcome.Subtitle,
            color = Color(Colors.Muted),
            fontSize = 16.sp,
            lineHeight = 24.sp,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(32.dp))
        KokiImage(KokiVariant.Welcome, 240)
        Spacer(Modifier.height(32.dp))
        YakokButton(Copy.Welcome.CreateFamily, onCreateFamily)
        Spacer(Modifier.height(12.dp))
        YakokButton(
            Copy.Welcome.HasInvite,
            onHasInvite,
            variant = YakokButtonVariant.Outline,
        )
    }
}

@Composable
private fun LeaderLogin(
    busy: Boolean,
    googleConfigured: Boolean,
    onBack: () -> Unit,
    onGoogle: () -> Unit,
    onDev: (String, String) -> Unit,
) {
    var showDev by rememberSaveable { mutableStateOf(false) }
    var email by rememberSaveable { mutableStateOf("guardian@yakmuk.local") }
    var password by rememberSaveable { mutableStateOf("yakmuk-dev-123") }

    Column(
        Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(horizontal = 24.dp),
    ) {
        IconButton(onClick = onBack) {
            Icon(
                Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = Copy.Welcome.Back,
                tint = Color(Colors.Brand),
            )
        }
        Column(
            Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                Copy.Welcome.LoginTitle,
                color = Color(Colors.Text),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                lineHeight = 32.sp,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(28.dp))
            YakokButton(
                Copy.Welcome.ContinueGoogle,
                onClick = onGoogle,
                variant = YakokButtonVariant.Oauth,
                enabled = !busy && googleConfigured,
            )
            if (BuildConfig.DEBUG) {
                Spacer(Modifier.height(16.dp))
                Text(
                    if (showDev) Copy.Welcome.DevLoginHide else Copy.Welcome.DevLoginShow,
                    color = Color(Colors.Muted),
                    fontSize = 13.sp,
                    textDecoration = TextDecoration.Underline,
                    modifier = Modifier
                        .align(Alignment.CenterHorizontally)
                        .clickable { showDev = !showDev }
                        .padding(8.dp),
                )
                if (showDev) {
                    Spacer(Modifier.height(8.dp))
                    YakokField(email, { email = it }, placeholder = "이메일")
                    Spacer(Modifier.height(8.dp))
                    YakokField(password, { password = it }, placeholder = "비밀번호", secret = true)
                    Spacer(Modifier.height(12.dp))
                    YakokButton(
                        if (busy) Copy.Welcome.PleaseWait else Copy.Welcome.DevLoginCta,
                        onClick = { onDev(email, password) },
                        enabled = !busy,
                    )
                }
            }
        }
    }
}

@Composable
private fun FamilySetup(
    busy: Boolean,
    onBack: () -> Unit,
    onCreate: (String, String) -> Unit,
) {
    var step by rememberSaveable { mutableIntStateOf(0) }
    var familyName by rememberSaveable { mutableStateOf("") }
    var nickname by rememberSaveable { mutableStateOf("") }

    if (step == 0) {
        FunnelScaffold(
            title = Copy.Welcome.FamilyNameTitle,
            ctaLabel = Copy.Welcome.Next,
            ctaEnabled = familyName.trim().isNotEmpty(),
            onCta = { step = 1 },
            onBack = onBack,
        ) {
            YakokField(
                familyName,
                { familyName = it },
                placeholder = Copy.Welcome.FamilyNamePlaceholder,
                maxLength = Limits.FamilyNameMaxLength,
            )
            Text(
                "${familyName.length}/${Limits.FamilyNameMaxLength}",
                color = Color(Colors.Muted),
                fontSize = 12.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 6.dp),
                textAlign = TextAlign.End,
            )
        }
    } else {
        FunnelScaffold(
            title = Copy.Welcome.NicknameTitle,
            ctaLabel = if (busy) Copy.Welcome.PleaseWait else Copy.Welcome.Create,
            ctaEnabled = !busy && nickname.trim().isNotEmpty(),
            onCta = { onCreate(familyName, nickname) },
            onBack = { step = 0 },
        ) {
            KokiImage(KokiVariant.Happy, 96, Modifier.padding(bottom = 12.dp))
            YakokField(
                nickname,
                { nickname = it },
                placeholder = Copy.Welcome.NicknamePlaceholder,
                maxLength = Limits.NicknameMaxLength,
            )
            Text(
                "${nickname.length}/${Limits.NicknameMaxLength}",
                color = Color(Colors.Muted),
                fontSize = 12.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 6.dp),
                textAlign = TextAlign.End,
            )
        }
    }
}
