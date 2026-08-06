import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import { COPY } from '@/shared/copy';

/** 멤버 카드·glance 상태 라벨 — 안부 > 다 먹음 > 먹는 중 (숫자 금지) */
export function memberStatusLabel(
  member: Pick<
    CareRecipientTodayStatus,
    'hasUnackedAlert' | 'pendingCount' | 'totalMeds'
  >,
): string {
  if (member.hasUnackedAlert) return COPY.family.statusAnbu;
  if (member.totalMeds <= 0) return COPY.family.statusNoMeds;
  if (member.pendingCount === 0) return COPY.family.statusAllTaken;
  return COPY.family.statusInProgress;
}
