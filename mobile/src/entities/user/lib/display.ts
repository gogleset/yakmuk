import type { UserRole } from '@/entities/user/model/types';

export const ROLE_LABEL: Record<UserRole, string> = {
  family_leader: '가족장',
  guardian: '보호자',
  care_recipient: '피보호자',
};

/** 표시 닉네임 (본인 닉 없으면 초대 호칭) */
export function displayNickname(user: {
  nickname: string;
  invitedAs?: string | null;
}): string {
  const nick = user.nickname?.trim();
  if (nick) return nick;
  return user.invitedAs?.trim() || '이름 없음';
}

/** `{가족장닉}의 {초대호칭}` — invitedAs 없으면 null */
export function relationSubtitle(
  invitedAs: string | null | undefined,
  leaderNickname: string | null | undefined,
): string | null {
  const as = invitedAs?.trim();
  if (!as) return null;
  const leader = leaderNickname?.trim() || '가족장';
  return `${leader}의 ${as}`;
}

/** 가족장·보호자 → 피보호자 약 관리 가능 여부 */
export function canManageMemberMeds(
  actorRole: UserRole | undefined | null,
  targetRole: string | null | undefined,
): boolean {
  if (!actorRole || !targetRole) return false;
  return (
    (actorRole === 'family_leader' || actorRole === 'guardian') &&
    targetRole === 'care_recipient'
  );
}
