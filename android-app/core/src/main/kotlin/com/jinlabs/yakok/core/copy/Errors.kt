package com.jinlabs.yakok.core.copy

import com.jinlabs.yakok.core.constants.Limits

/** 사용자에게 보이는 실패 문구. RN `shared/copy/errors.ts`. Apple 키는 미사용. */
object Errors {
    const val Fallback = "잠시 후 다시 시도해 주세요"
    const val Network = "네트워크를 확인해 주세요"
    const val RequestFailed = "잠시 후 다시 시도해 주세요"
    const val ResponseParse = "응답을 해석하지 못했어요"
    const val Constraint = "요청을 처리하지 못했어요. 다시 시도해 주세요"

    object Auth {
        const val Required = "로그인이 필요해요"
        const val LoginFailed = "로그인하지 못했어요"
        const val LogoutFailed = "로그아웃하지 못했어요"
        const val WithdrawFailed = "탈퇴하지 못했어요"
        const val SessionMismatch =
            "로그인 정보가 맞지 않아요. 로그아웃 후 다시 로그인해 주세요"
        const val SessionExpired = "로그인이 만료됐어요. 다시 로그인해 주세요"
        const val ProfileNotFound = "프로필을 찾을 수 없어요. 다시 로그인해 주세요"
        const val ProfileLoadFailed = "프로필을 불러오지 못했어요"
        const val GoogleWebClientMissing =
            "Google 로그인을 아직 설정하지 않았어요. GOOGLE_WEB_CLIENT_ID를 넣어 주세요"
        const val GoogleDeveloperError =
            "Google 앱 설정이 맞지 않아요. Android Client SHA-1을 debug.keystore 기준으로 다시 등록해 주세요"
        const val GooglePlayServicesMissing = "Google Play 서비스를 사용할 수 없어요"
    }

    object Family {
        const val NameRequired = "가족 이름을 입력해 주세요"
        const val NicknameRequired = "닉네임을 입력해 주세요"
        const val CreateFailed = "가족을 만들지 못했어요"
        const val RenameFailed = "가족 이름을 바꾸지 못했어요"
        const val NicknameChangeFailed = "닉네임을 바꾸지 못했어요"
        const val RemoveMemberFailed = "멤버를 내보내지 못했어요"
        const val DeleteFailed = "가족을 삭제하지 못했어요"
        const val LeaderOnly = "가족장만 할 수 있어요"
        const val AlreadyInFamily = "이미 가족에 속해 있어요"
        const val MemberNotFound = "가족 구성원을 찾을 수 없어요"
        const val CannotRemoveSelf = "자기 자신은 내보낼 수 없어요"
        const val CannotRemoveLeader = "가족장은 내보낼 수 없어요"
        const val AckFailed = "확인을 남기지 못했어요"
    }

    object Invite {
        const val JoinFailed = "가족에 참여하지 못했어요"
        const val CreateFailed = "초대를 보내지 못했어요"
        const val DeleteFailed = "초대를 삭제하지 못했어요"
        const val ReissueFailed = "초대장을 다시 만들지 못했어요"
        const val PeekFailed = "초대장을 확인하지 못했어요"
        const val LabelRequired = "호칭을 알려 주세요"
        const val NotFound = "초대장을 찾을 수 없어요"
        const val AlreadyClaimed =
            "이미 사용된 초대장이에요. 가족장에게 새 초대장을 받아 다시 들어와 주세요"
        const val NotFoundOrClaimed = "초대장을 찾을 수 없거나 이미 사용됐어요"
        const val CodeGenFailed = "초대장을 만들지 못했어요. 다시 시도해 주세요"
        const val InvalidCode = "초대장이 올바르지 않아요"
        const val InvalidRole = "역할이 올바르지 않아요"
        val CodeLength = "초대장은 ${Limits.InviteCodeLength}글자예요"
        val LimitReached = "자리는 최대 ${Limits.MaxFamilyInvites}명까지예요"
    }

    object Recovery {
        const val CreateFailed = "복구 코드를 만들지 못했어요"
        const val CodeGenFailed = "복구 코드를 만들지 못했어요. 다시 시도해 주세요"
        const val CannotRecoverSelf = "자기 자신은 복구 코드를 만들 수 없어요"
        const val CannotRecoverLeader = "가족장은 복구 코드 대상이 아니에요"
    }

    object Med {
        const val AddFailed = "약을 추가하지 못했어요"
        const val UpdateFailed = "약을 수정하지 못했어요"
        const val DeleteFailed = "약을 삭제하지 못했어요"
        const val CheckFailed = "복약 체크를 남기지 못했어요"
        const val ScheduleEmpty = "일정이 비어 있어요"
        const val NameRequired = "이름을 적어 주세요"
        const val SearchFailed = "약 검색을 하지 못했어요"
        const val SearchNetwork = "약 정보를 불러오지 못했어요. 네트워크를 확인해 주세요"
        const val SearchForbidden = "약 검색이 막혀 있어요. 잠시 후 다시 시도해 주세요"
        const val SearchParse = "약 검색 결과를 읽지 못했어요"
        const val DosePairRequired = "용량과 단위를 같이 적어 주세요"
        const val DoseInvalid = "용량을 확인해 주세요"
        const val DoseTooLarge = "용량이 너무 커요"
        const val MetaTooLong = "글자가 너무 많아요"
    }

    object Condition {
        const val SaveFailed = "컨디션을 전하지 못했어요"
    }
}

/** RPC `raise exception` 키 → 사용자 문구. in-place 키 변경 금지. */
val BackendErrorMessages: Map<String, String> = mapOf(
    "not authenticated" to Errors.Auth.Required,
    "family name required" to Errors.Family.NameRequired,
    "nickname required" to Errors.Family.NicknameRequired,
    "profile not found" to Errors.Auth.ProfileNotFound,
    "family leader required" to Errors.Family.LeaderOnly,
    "invite not found" to Errors.Invite.NotFound,
    "invite already claimed" to Errors.Invite.AlreadyClaimed,
    "invite not found or already claimed" to Errors.Invite.NotFoundOrClaimed,
    "invite code generation failed" to Errors.Invite.CodeGenFailed,
    "recovery code generation failed" to Errors.Recovery.CodeGenFailed,
    "invalid invite code" to Errors.Invite.InvalidCode,
    "already in a family" to Errors.Family.AlreadyInFamily,
    "invited_as required" to Errors.Invite.LabelRequired,
    "invalid target_role" to Errors.Invite.InvalidRole,
    "cannot remove yourself" to Errors.Family.CannotRemoveSelf,
    "cannot recover yourself" to Errors.Recovery.CannotRecoverSelf,
    "member not found" to Errors.Family.MemberNotFound,
    "cannot remove family leader" to Errors.Family.CannotRemoveLeader,
    "cannot recover family leader" to Errors.Recovery.CannotRecoverLeader,
)

private data class TechnicalPattern(val regex: Regex, val message: String)

private val technicalPatterns: List<TechnicalPattern> = listOf(
    TechnicalPattern(
        Regex("families_created_by_fkey|created_by_fkey", RegexOption.IGNORE_CASE),
        Errors.Auth.SessionMismatch,
    ),
    TechnicalPattern(
        Regex(
            "violates foreign key constraint|violates unique constraint|duplicate key",
            RegexOption.IGNORE_CASE,
        ),
        Errors.Constraint,
    ),
    TechnicalPattern(
        Regex("jwt|session|token|refresh_token|not authenticated", RegexOption.IGNORE_CASE),
        Errors.Auth.SessionExpired,
    ),
    TechnicalPattern(
        Regex(
            "network|fetch failed|failed to fetch|network request failed",
            RegexOption.IGNORE_CASE,
        ),
        Errors.Network,
    ),
    TechnicalPattern(
        Regex("invite limit reached", RegexOption.IGNORE_CASE),
        Errors.Invite.LimitReached,
    ),
)

private val technicalDump =
    Regex(
        "violates|constraint|relation|column|syntax|postgres|sql|fkey|pkey|duplicate key|insert or update on table",
        RegexOption.IGNORE_CASE,
    )
private val fkeyName = Regex("_[a-z0-9]+_fkey", RegexOption.IGNORE_CASE)

fun formatUserFacingError(error: Any?, fallback: String = Errors.Fallback): String {
    val raw = extractErrorMessage(error)
    if (raw.isEmpty()) return fallback
    val normalized = raw.lowercase()
    for ((backend, user) in BackendErrorMessages) {
        if (normalized == backend || normalized.contains(backend)) return user
    }
    for (pattern in technicalPatterns) {
        if (pattern.regex.containsMatchIn(raw)) return pattern.message
    }
    if (technicalDump.containsMatchIn(raw) || fkeyName.containsMatchIn(raw)) return fallback
    return raw
}

private fun extractErrorMessage(error: Any?): String = when (error) {
    null -> ""
    is Throwable -> error.message?.trim().orEmpty()
    is String -> error.trim()
    else -> error.toString().trim()
}
