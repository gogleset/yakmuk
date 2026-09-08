package com.jinlabs.yakok.core.family

import com.jinlabs.yakok.core.copy.Copy

object CareAlerts {
    fun toSlides(alerts: List<FamilyAlert>): List<CareAlertSlide> =
        alerts.map { alert ->
            val who = alert.nickname?.trim()?.takeIf { it.isNotEmpty() } ?: Copy.Family.MemberFallback
            if (alert.kind == FamilyAlertKind.StuckEscalate) {
                CareAlertSlide(
                    id = alert.id,
                    tone = CareAlertTone.Stuck,
                    title = Copy.Family.careStuckTitle(who),
                    body = alert.message.ifBlank { Copy.Family.careStuckDays(1) },
                    alertId = alert.id,
                )
            } else {
                CareAlertSlide(
                    id = alert.id,
                    tone = CareAlertTone.Bad,
                    title = Copy.Family.careBadTitle(who),
                    body = alert.message.ifBlank { Copy.Family.careBadBody("오늘", "아픔") },
                    alertId = alert.id,
                )
            }
        }
}
