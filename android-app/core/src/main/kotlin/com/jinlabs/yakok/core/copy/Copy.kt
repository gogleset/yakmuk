package com.jinlabs.yakok.core.copy

import com.jinlabs.yakok.core.user.UserRole

object Copy {
    object Tabs {
        const val Home = "기록"
        const val Family = "가족"
        const val Settings = "설정"
    }

    object Onboarding {
        const val HasMedTitle = "지금 먹는 약이 있어요?"
        const val HasMedYes = "있어요"
        const val HasMedLater = "나중에"
        const val NameTitle = "약 이름이 뭐예요?"
        const val NamePlaceholder = "예) 혈압약, 타이레놀"
        const val ScheduleTitle = "몇 시에 먹어요?"
        const val PurposeTitle = "이 약은 어디 쪽이에요?"
        const val PurposeSkip = "나중에 할게요"
        const val DiscomfortTitle = "요즘 어디가 불편해요?"
        const val DiscomfortSkip = "나중에 할게요"
        const val PermissionTitle = "약 시간에 알려드릴게요"
        const val PermissionCta = "알림 허용하기"
        const val PermissionSkip = "나중에"
        const val Next = "다음"
        const val Done = "시작하기"
    }

    object Purpose {
        const val Bp = "혈압"
        const val Diabetes = "당뇨"
        const val Heart = "심장"
        const val Gi = "위장"
        const val Pain = "진통·해열"
        const val Other = "영양·기타"
        const val Unknown = "잘 모르겠음"
        fun label(purpose: com.jinlabs.yakok.core.med.MedPurpose): String = when (purpose) {
            com.jinlabs.yakok.core.med.MedPurpose.Bp -> Bp
            com.jinlabs.yakok.core.med.MedPurpose.Diabetes -> Diabetes
            com.jinlabs.yakok.core.med.MedPurpose.Heart -> Heart
            com.jinlabs.yakok.core.med.MedPurpose.Gi -> Gi
            com.jinlabs.yakok.core.med.MedPurpose.Pain -> Pain
            com.jinlabs.yakok.core.med.MedPurpose.Other -> Other
            com.jinlabs.yakok.core.med.MedPurpose.Unknown -> Unknown
        }
    }

    object Discomfort {
        const val Head = "머리"
        const val Chest = "가슴"
        const val Belly = "배"
        const val Joint = "관절"
        const val None = "없어요"
        const val Section = "불편한 곳"
        const val Change = "불편한 곳 바꾸기"
        fun label(value: com.jinlabs.yakok.core.med.Discomfort): String = when (value) {
            com.jinlabs.yakok.core.med.Discomfort.Head -> Head
            com.jinlabs.yakok.core.med.Discomfort.Chest -> Chest
            com.jinlabs.yakok.core.med.Discomfort.Belly -> Belly
            com.jinlabs.yakok.core.med.Discomfort.Joint -> Joint
            com.jinlabs.yakok.core.med.Discomfort.None -> None
        }
    }

    object FamilyPreview {
        const val Banner = "이 버전은 이 폰에서만 약을 챙깁니다. 가족 안부는 다음 업데이트에서."
        const val Title = "가족 안부"
        const val Body = "나중에 가족이 약을 먹으면 여기에 안부가 보여요."
    }

    object Welcome {
        const val Title = "안녕하세요.\n저는 콕이에요"
        const val Subtitle = "약 시간에 알려 드리고,\n한 번에 먹었다고 표시해요."
        const val CreateFamily = "가족을 만들어요"
        const val HasInvite = "초대장을 받았어요"
        const val LoginTitle = "안부를 나누기 위해\n로그인이 필요해요"
        const val ContinueGoogle = "Google로 계속"
        const val FamilyNameTitle = "우리 가족을\n어떻게 부를까요?"
        const val FamilyNamePlaceholder = "예) 우리집, 행복한 가족 등"
        const val NicknameTitle = "콕이는\n뭐라고 불러드릴까요?"
        const val NicknamePlaceholder = "예) 엄마, 아빠, 언니 등"
        const val Next = "다음"
        const val Create = "만들기"
        const val PleaseWait = "잠시만요…"
        const val DevLoginShow = "개발용 이메일 로그인"
        const val DevLoginHide = "개발 로그인 접기"
        const val DevLoginCta = "이메일로 시작하기"
        const val Back = "이전"
        const val Confirm = "확인"
    }

    object Join {
        const val CodeTitle = "초대장 여섯 글자를 적어 주세요"
        const val CodeHint = "가족이 전해 준 여섯 글자"
        const val PeekLoading = "초대장 확인 중…"
        const val NicknameTitle = "콕이는\n뭐라고 불러드릴까요?"
        const val NicknamePlaceholder = "예) 엄마, 언니, 아들 등 (선택)"
        const val Later = "나중에 할게요"
        const val Next = "다음"
        const val Participate = "참여하기"
        const val Connecting = "연결 중…"
        const val RecoveryHint = "기기 복구 · 약·기록 유지"

        fun familyOf(leaderNickname: String): String {
            val n = leaderNickname.ifBlank { "가족장" }
            return "${n}님의 가족"
        }
    }

    object Auth {
        const val ForceSignOutTitle = "다시 로그인이 필요해요"
        const val ForceSignOutBody =
            "가족이 초대장을 바꿨어요. 새 초대장으로 다시 들어와 주세요."
    }

    object Actions {
        const val Cancel = "취소"
        const val Delete = "삭제"
        const val Retry = "다시 시도"
        const val Save = "저장"
        const val Export = "내보내기"
        const val Confirm = "확인"
    }

    object Med {
        const val DeleteTitle = "약을 삭제할까요?"
        fun deleteBody(name: String) = "\"$name\" 일정을 지울게요."
        const val LoadFailed = "약 목록을 불러오지 못했어요"
        const val EmptyRegistered = "아직 등록한 약이 없어요"
        const val EmptyRegisteredCta = "첫 약 등록하기"
        const val EmptyToday = "오늘은 먹을 약이 없어요"
        const val EmptyTodayHint = "다른 요일 일정은 캘린더에서 볼 수 있어요."
        const val EmptyPastDay = "이 날에는 먹을 약이 없어요"
        const val AddFab = "약 추가"
        const val AllDoneToday = "오늘 다 먹었어요"
        fun remainingToday(count: Int) = "약 ${count}개 남았어요"
        fun progressFraction(taken: Int, total: Int) = "$taken / $total"
        const val CheckPromptTitle = "약 복용 시간을 체크해볼까요?"
        const val CheckPromptDone = "다 먹었어요! 잘했어요"
        fun streakDays(days: Int) = "${days}일 연속이에요"
        const val Search = "검색"
        const val SearchEmpty = "검색 결과가 없어요."
        const val SelectThisDrug = "이 약 선택"
        const val DoseLabel = "용량"
        const val DoseAmountPlaceholder = "예) 1"
        const val ColorLabel = "구분 색"
        const val NamePlaceholder = "약 이름"
        const val AddTitle = "약 추가"
        const val EditTitle = "약 수정"
        const val Daily = "매일"
        const val Weekdays = "요일 선택"
        const val TimeLabel = "시간"
        const val AddTime = "시간 추가"
        object TimeSlot {
            const val Dawn = "새벽"
            const val Morning = "아침"
            const val Lunch = "점심"
            const val Afternoon = "오후"
            const val Bedtime = "취침 전"
        }
    }

    object Condition {
        const val SavedTitle = "저장했어요"
        const val SavedBody = "오늘 컨디션을 가족에게 전했어요"
        const val DefaultBadMessage = "오늘 컨디션이 좋지 않아요"
        const val Prompt = "오늘 컨디션은 어때요?"
        fun savedPrompt(label: String) = "오늘 컨디션은 ${label}이에요!"
        const val MessagePlaceholder = "가족에게 전할 한마디 (선택)"
        const val Submit = "컨디션 남기기"
        const val Good = "좋음"
        const val Normal = "보통"
        const val Bad = "아픔"
    }

    object Calendar {
        const val LegendDone = "다 먹었어요"
        const val LegendPartial = "일부만"
        const val LegendMissed = "안 먹었어요"
        const val LegendScheduled = "약 있는 날"
    }

    object Alert {
        const val MedCheckStalled = "복약 체크가 멈춘 것 같아요. 안부를 한번 봐 주세요."
    }

    object Family {
        const val Title = "가족 안부"
        const val TodayStatusFallback = "가족"
        const val RecentFeed = "최근 소식"
        const val RecentFeedUnreadA11y = "최근 소식, 읽지 않은 소식 있음"
        fun memberCount(count: Int) = "우리 가족 ${count}명"
        const val SeeMoreFeed = "더보기"
        const val EmptyMembers = "아직 가족이 등록되지 않았어요"
        const val EmptyMembersMessage = "가족을 불러서 서로의 하루를 챙겨보세요."
        const val InviteCta = "가족 부르기"
        const val EmptyFeed = "아직 소식이 없어요"
        const val EmptyFeedMessage = "가족이 약을 체크하면 여기에 보여요."
        const val LoadFailed = "가족 정보를 불러오지 못했어요"
        const val LoadFailedFeed = "소식을 불러오지 못했어요"
        const val LoadFailedAlerts = "알림을 불러오지 못했어요"
        const val MemberFallback = "가족"
        const val StatusAnbu = "안부"
        const val StatusAllTaken = "다 먹음"
        const val StatusInProgress = "진행 중"
        const val StatusNoMeds = "약 없음"
        fun glanceLine(who: String, status: String) = "$who · $status"
        const val WeeklyTitle = "이번 주 안부"
        const val WeeklyOk = "이번 주 괜찮았어요"
        const val WeeklyMostly = "이번 주 대체로 잘 챙겼어요"
        const val WeeklyUneven = "이번 주 챙김이 들쑥날쑥했어요"
        const val WeeklyNoMeds = "이번 주 등록된 약이 없어요"
        fun weeklyMissedDays(weekdays: String) = "$weekdays 약이 조금 남았어요"
        fun weeklyBadDays(weekdays: String) = "$weekdays 컨디션이 안 좋았어요"
        const val WeeklyAck = "확인했어요"
        const val WeeklyEmptyAnomaly = "특이했던 날은 없어요"
        const val CareAck = "확인했어요"
        fun careStuckTitle(who: String) = "${who}의 약 안부가 궁금해요"
        fun careStuckDays(days: Int) = "${days}일째 확인이 없어요"
        fun careBadTitle(who: String) = "${who}의 컨디션이 걱정돼요"
        fun careBadBody(whenLabel: String, label: String) =
            "$whenLabel '${label}'으로 기록했어요"
        fun feedTaken(who: String) = "${who}${Copy.subjectGa(who)} 약을 복용했어요"
        fun feedAllTaken(who: String) = "${who}${Copy.subjectGa(who)} 약을 다 먹었어요"
        fun feedCondition(who: String, label: String) = "${who}의 컨디션이 $label"
        fun feedFallback(who: String) = "${who}님 소식"
        const val KickTitle = "멤버를 내보낼까요?"
        fun kickBody(nickname: String) =
            "${nickname} 님은 가족에서 빠지고, 약·기록도 함께 삭제돼요."
        const val ConditionFeedGood = "좋아요"
        const val ConditionFeedNormal = "보통이에요"
        const val ConditionFeedBad = "안 좋아요"
    }

    object Invite {
        const val ClaimedCannotDeleteTitle = "이미 함께하는 자리예요"
        const val ClaimedCannotDeleteBody =
            "이미 함께하는 자리·다시 오는 길은 지울 수 없어요."
        const val DeleteTitle = "이 자리를 비울까요?"
        const val ReissueTitle = "초대장을 새로 줄까요?"
        const val ReissueBody = "기존 초대장·QR은 더 이상 쓸 수 없어요."
        const val ReissueConnectedBody =
            "새 초대장으로 바뀌고, 지금 들어와 있는 기기는 로그아웃돼요. 새 초대장으로 다시 들어와야 약·기록이 이어져요."
        const val ReissueAction = "초대장 새로 주기"
        const val StatusWaiting = "아직 안 오셨어요"
        const val StatusConnected = "함께 있어요"
        const val StatusReentry = "다시 오는 길"
        const val LimitTitle = "자리가 가득 찼어요"
        const val LabelAlertTitle = "호칭을 알려 주세요"
        const val LabelAlertBody = "예: 아빠, 할머니"
        const val FunnelWhoTitle = "누구를 부를까요?"
        const val FunnelRoleHint = "역할을 골라 주세요"
        const val FunnelLabelHint = "호칭을 선택해 주세요"
        const val FunnelCustomLabel = "직접 입력"
        const val FunnelCreateCta = "초대장 만들기"
        const val FunnelCreating = "만드는 중…"
        const val FunnelReadyTitle = "초대장을 준비했어요"
        const val FunnelReadyBody = "아래 여섯 글자 또는 QR을 가족에게 알려주세요."
        const val FunnelShare = "공유하기"
        const val FunnelDone = "완료"
        val LabelChips = listOf(
            "엄마", "아빠", "할머니", "할아버지", "이모", "삼촌", "형", "누나",
        )
    }

    object Notif {
        const val Channel = "복약 알림"
        const val DoseTitle = "약 먹을 시간이에요"
        fun doseBody(name: String, time: String) = "$name · $time"
        const val AlarmHeadline = "약 드실 시간이에요!"
        const val AlarmTaken = "먹었어요"
        const val AlarmTakeAll = "모두 먹었어요"
        const val ExactAlarmTitle = "정확한 알림 시간"
        const val ExactAlarmBody =
            "복약 알림이 제시간에 울리려면 「알람 및 리마인더」 권한이 필요해요. 알림 허용과는 따로예요."
        const val ExactAlarmOpen = "설정 열기"
        const val ExactAlarmLater = "나중에"
        const val FsiTitle = "화면 켜고 앱 열기"
        const val FsiBody =
            "화면이 꺼져 있거나 앱이 종료돼 있어도 복약 화면을 띄우려면 「전체 화면 알림」을 허용해 주세요."
        const val PermissionTitle = "약 알림"
        const val PermissionBody = "먹을 시간에 알려 드리려면 알림을 허용해 주세요."
        const val BasicSwitch = "기본 알림"
        const val FullPageSwitch = "풀페이지 알림"
    }

    object Push {
        const val CareTakenTitle = "약 챙겼어요"
        fun careTakenBody(who: String) = "${who} 님이 약을 먹었어요"
        const val CareStuckTitle = "안부가 궁금해요"
        fun careStuckBody(who: String) = "${who} 님 복약 체크가 멈춘 것 같아요"
        const val ChannelTaken = "가족 복약 안부"
        const val ChannelStuck = "가족 안부 알림"
        const val ChannelAnnouncement = "공지"
    }

    object Glance {
        const val Channel = "가족 한눈"
        const val Title = "가족 안부"
        const val PermissionHint = "알림을 허용하면 앱 밖에서도 가족 상태를 볼 수 있어요."
    }

    object Settings {
        const val Title = "설정"
        const val Account = "계정"
        const val SignOut = "로그아웃"
        const val Withdraw = "탈퇴하기"
        const val WithdrawTitle = "정말 탈퇴할까요?"
        const val WithdrawLeader =
            "탈퇴하면 가족이 삭제되고 모든 멤버·약·기록이 지워져요. 되돌릴 수 없어요."
        const val WithdrawMember =
            "탈퇴하면 이 가족에서 나가고, 내 약·기록이 삭제돼요. 되돌릴 수 없어요."
        const val NicknameChange = "닉네임 변경"
        const val NoName = "이름 없음"
        const val FamilyConnected = "가족에 연결되어 있어요"
        const val FamilyMissing = "가족이 아직 없어요"
        const val Notifications = "알림"
        const val App = "앱"
        const val StartScreen = "첫 화면"
        const val StartScreenHome = "기록"
        const val StartScreenFamily = "가족"
        const val CareGlance = "가족 알림"
        const val WeeklyDigest = "주간 안부"
        const val Animations = "애니메이션"
        const val AnimationsHint = "저전력일 때는 자동으로 꺼져요"
        const val Version = "앱 버전"
        const val Info = "정보"
        const val Privacy = "개인정보처리방침"
        const val PrivacySoon = "곧 공개할게요"
        const val Wipe = "모든 기록 삭제"
        const val WipeTitle = "기록을 지울까요?"
        const val WipeBody =
            "이 폰에 저장된 약·체크·불편 기록이 모두 사라져요. 되돌릴 수 없어요."
        const val LocalOnlyHint = "기록은 이 폰에만 남아요. 폰을 바꾸면 가져올 수 없어요."
    }

    /** 한글 주격 조사 가/이 */
    fun subjectGa(name: String): String {
        val ch = name.trim().lastOrNull() ?: return "가"
        val code = ch.code
        if (code < 0xAC00 || code > 0xD7A3) return "가"
        return if ((code - 0xAC00) % 28 == 0) "가" else "이"
    }
}

object RoleLabels {
    fun label(role: UserRole): String = when (role) {
        UserRole.FamilyLeader -> "가족장"
        UserRole.Guardian -> "보호자"
        UserRole.CareRecipient -> "피보호자"
    }
}
