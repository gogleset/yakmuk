import type { FamilyAlert } from '@/entities/family/model/types';
import { COPY } from '@/shared/copy';
import type { CareAlertSlide } from './model/types';

/** 실 family_alerts → 캐러셀 슬라이드 (일수 산출은 다음 단계) */
export function mapFamilyAlertsToSlides(
  alerts: FamilyAlert[],
): CareAlertSlide[] {
  return alerts.map((alert) => {
    const who = alert.nickname?.trim() || '가족';
    if (alert.kind === 'stuck_escalate') {
      return {
        id: alert.id,
        tone: 'stuck' as const,
        title: COPY.family.careStuckTitle(who),
        body: alert.message || COPY.family.careStuckDays(1),
        alertId: alert.id,
      };
    }
    return {
      id: alert.id,
      tone: 'bad' as const,
      title: COPY.family.careBadTitle(who),
      body: alert.message || COPY.family.careBadBody('오늘', '아픔'),
      alertId: alert.id,
    };
  });
}
