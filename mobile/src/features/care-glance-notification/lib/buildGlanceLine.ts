import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import { memberStatusLabel } from '@/entities/family/lib/memberStatus';
import { COPY } from '@/shared/copy';

/** `이름 · 상태` 한 줄 — 분수·점수 금지 */
export function buildGlanceLine(
  member: Pick<
    CareRecipientTodayStatus,
    'nickname' | 'hasUnackedAlert' | 'pendingCount' | 'totalMeds'
  >,
): string {
  const who = member.nickname.trim() || COPY.family.memberFallback;
  const status = memberStatusLabel(member);
  return COPY.family.glanceLine(who, status);
}
