import type { WeeklyDigestView } from '@/entities/family';
import { COPY } from '@/shared/copy';
import type { KokiVariant } from '@/shared/ui';

/** 주간 안부 톤 → 콕이 */
export function kokiForWeeklyDigest(digest: WeeklyDigestView): KokiVariant {
  if (digest.approxLine === COPY.family.weeklyNoMeds) return 'empty';
  if (digest.anomalyDays.some((a) => a.kind === 'bad')) return 'worried';
  if (digest.anomalyDays.some((a) => a.kind === 'missed')) return 'thinking';
  if (digest.approxLine === COPY.family.weeklyMostly) return 'cheer';
  return 'happy';
}
