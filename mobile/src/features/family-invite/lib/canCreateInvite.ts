import type { InviteTargetRole } from '@/entities/user/model/types';

/** 부르기 퍼널 — 역할 + 호칭 모두 있어야 초대장 생성 */
export function canCreateInvite(input: {
  targetRole: InviteTargetRole | null;
  invitedAs: string;
}): boolean {
  return !!input.targetRole && input.invitedAs.trim().length > 0;
}
