package com.jinlabs.yakok.core.constants

/** 입력·초대·복약 한도. RN `shared/constants/limits.ts` · DB와 동기. */
object Limits {
    const val InviteCodeLength = 6
    const val InviteCodeLetterSpacing = 6
    const val NicknameMaxLength = 10
    const val FamilyNameMaxLength = 20
    const val MaxFamilyInvites = 6
    const val MaxTimeSlots = 6
    const val DefaultDoseTime = "08:00"
    const val DrugSearchMinQueryLength = 2
    const val MedMetaMaxLength = 2000
    const val MedDoseAmountMax = 9999
    const val TodayBannerAutoAdvanceMs = 5000L
    const val FamilyFeedPreviewCount = 3
    const val FamilyFeedWindowDays = 7
}
