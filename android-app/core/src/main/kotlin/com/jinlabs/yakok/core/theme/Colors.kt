package com.jinlabs.yakok.core.theme

/** RN `theme.ts` COLORS — ARGB Long. Compose에서 Color(value)로 쓴다. light only. */
object Colors {
    const val Brand = 0xFF4D8679L
    const val BrandSoft = 0xFFE4F1EDL
    const val TodaySoft = 0xFFC5E8D9L
    const val Canvas = 0xFFFFFFFFL
    const val Surface = 0xFFFFFFFFL
    const val SurfaceSoft = 0xFFF0F5F3L
    const val Ink = 0xFFF5FFFCL
    const val Text = 0xFF1F2A27L
    const val Muted = 0xFF7A8783L
    const val Line = 0xFFD5DED9L
    const val Disabled = 0xFFB8C4BFL
    const val Warning = 0xFFC49A3CL
    const val WarningBorder = 0xFFE8D48AL
    const val WarningBg = 0xFFFFF8E1L
    const val Destructive = 0xFFC46B5AL
    const val DestructiveSoft = 0xFFF8E8E4L
    const val Sky = 0xFF3B9AD9L
    const val Success = 0xFF4D8679L
    const val White = 0xFFFFFFFFL
}

object ToneOutline {
    const val WidthDp = 1
    const val Warning = Colors.WarningBorder
    const val Destructive = Colors.Destructive
}

object Radius {
    const val Sm = 8
    const val Md = 10
    const val Lg = 12
    const val Sheet = 24
    const val Pill = 999
}

object Nav {
    const val TabBarHeightDp = 56
    const val TabBarPaddingTopDp = 6
}
