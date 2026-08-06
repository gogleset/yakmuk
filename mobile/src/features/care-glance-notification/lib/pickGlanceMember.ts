import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import type { UserRole } from '@/entities/user/model/types';

/** 보호자(리더·guardian)만 glance 대상 */
export function isGlanceViewerRole(role: UserRole | null | undefined): boolean {
  return role === 'family_leader' || role === 'guardian';
}

/**
 * 알림 1개용 멤버 선택 — 안부(unacked) 우선, 없으면 첫 피보호자.
 * 피보호자 없으면 본인 제외 첫 멤버.
 */
export function pickGlanceMember(
  members: CareRecipientTodayStatus[],
  excludeUserId?: string | null,
): CareRecipientTodayStatus | null {
  const others = members.filter((m) => m.userId !== excludeUserId);
  if (others.length === 0) return null;

  const careRecipients = others.filter((m) => m.role === 'care_recipient');
  const pool = careRecipients.length > 0 ? careRecipients : others;

  const withAlert = pool.find((m) => m.hasUnackedAlert);
  return withAlert ?? pool[0] ?? null;
}
