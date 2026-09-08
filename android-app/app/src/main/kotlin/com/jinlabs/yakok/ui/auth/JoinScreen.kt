package com.jinlabs.yakok.ui.auth

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Copy
import com.jinlabs.yakok.core.copy.RoleLabels
import com.jinlabs.yakok.core.theme.Colors
import com.jinlabs.yakok.core.theme.Radius
import com.jinlabs.yakok.core.user.InvitePeek
import com.jinlabs.yakok.core.user.JoinCodes
import com.jinlabs.yakok.core.user.JoinPeekKind
import com.jinlabs.yakok.ui.components.FunnelScaffold
import com.jinlabs.yakok.ui.components.InviteCodeField
import com.jinlabs.yakok.ui.components.KokiImage
import com.jinlabs.yakok.ui.components.KokiVariant
import com.jinlabs.yakok.ui.components.YakokField

@Composable
fun JoinScreen(
    initialCode: String,
    state: AuthUiState,
    onPeek: (String) -> Unit,
    onJoin: (code: String, nickname: String?) -> Unit,
    onBack: () -> Unit,
) {
    var step by rememberSaveable { mutableIntStateOf(0) }
    var code by rememberSaveable { mutableStateOf(JoinCodes.normalize(initialCode)) }
    var nickname by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(code) { onPeek(code) }

    val codeReady = JoinCodes.isComplete(code) &&
        state.peek != null &&
        state.peekError == null &&
        !state.peekLoading

    if (step == 0) {
        FunnelScaffold(
            title = Copy.Join.CodeTitle,
            ctaLabel = Copy.Join.Next,
            ctaEnabled = codeReady,
            onCta = { step = 1 },
            onBack = onBack,
        ) {
            InviteCodeField(code, { code = it })
            Spacer(Modifier.height(8.dp))
            Text(Copy.Join.CodeHint, color = Color(Colors.Muted), fontSize = 14.sp)
            if (state.peekLoading) {
                Text(Copy.Join.PeekLoading, color = Color(Colors.Muted), modifier = Modifier.padding(top = 8.dp))
            }
            state.peekError?.let {
                Text(it, color = Color(Colors.Destructive), fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp))
            }
            state.peek?.let {
                Spacer(Modifier.height(12.dp))
                PeekCard(it)
            }
        }
    } else {
        FunnelScaffold(
            title = Copy.Join.NicknameTitle,
            ctaLabel = if (state.busy) Copy.Join.Connecting else Copy.Join.Participate,
            ctaEnabled = !state.busy,
            onCta = { onJoin(code, nickname.trim().ifEmpty { null }) },
            onBack = { step = 0 },
        ) {
            KokiImage(KokiVariant.Happy, 96, Modifier.padding(bottom = 12.dp))
            YakokField(
                nickname,
                { nickname = it },
                placeholder = Copy.Join.NicknamePlaceholder,
                maxLength = Limits.NicknameMaxLength,
            )
            Text(
                "${nickname.length}/${Limits.NicknameMaxLength}",
                color = Color(Colors.Muted),
                fontSize = 12.sp,
                modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                textAlign = TextAlign.End,
            )
            Text(
                Copy.Join.Later,
                color = Color(Colors.Muted),
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .clickable(enabled = !state.busy) { onJoin(code, null) }
                    .padding(12.dp),
            )
        }
    }
}

@Composable
private fun PeekCard(peek: InvitePeek) {
    val members = peek.memberNicknames.joinToString(" · ").ifEmpty {
        peek.invitedAs.ifEmpty { RoleLabels.label(peek.targetRole) }
    }
    Surface(
        color = Color(Colors.SurfaceSoft),
        shape = RoundedCornerShape(Radius.Lg.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            KokiImage(KokiVariant.Family, 56)
            Spacer(Modifier.width(12.dp))
            androidx.compose.foundation.layout.Column(Modifier.weight(1f)) {
                Text(
                    Copy.Join.familyOf(peek.leaderNickname),
                    color = Color(Colors.Text),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                )
                if (members.isNotEmpty()) {
                    Text(members, color = Color(Colors.Muted), fontSize = 14.sp)
                }
                if (peek.kind == JoinPeekKind.Recovery) {
                    Text(Copy.Join.RecoveryHint, color = Color(Colors.Muted), fontSize = 12.sp)
                }
            }
        }
    }
}
