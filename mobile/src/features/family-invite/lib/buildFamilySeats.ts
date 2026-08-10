import type { FamilyMember } from '@/entities/family/model/types';
import type { FamilyInvite, UserRole } from '@/entities/user/model/types';

export type FamilySeatPendingKind = 'waiting' | 'reentry';

export type FamilySeat =
  | {
      kind: 'member';
      userId: string;
      nickname: string;
      invitedAs: string | null;
      role: UserRole;
      /** claimed invite id — for reissue */
      inviteId: string | null;
    }
  | {
      kind: 'pending';
      invite: FamilyInvite;
      pendingKind: FamilySeatPendingKind;
    }
  | { kind: 'empty' };

type Input = {
  members: FamilyMember[];
  invites: FamilyInvite[];
  maxSeats: number;
};

/**
 * 자리표 합성 — 리더 제외 멤버 → 미클레임 초대 → 빈 칸.
 * claimed 초대는 멤버 칸에 inviteId로만 연결.
 */
export function buildFamilySeats({
  members,
  invites,
  maxSeats,
}: Input): FamilySeat[] {
  const others = members.filter((m) => m.role !== 'family_leader');
  const claimedByUser = new Map<string, FamilyInvite>();
  for (const inv of invites) {
    if (inv.claimedBy) claimedByUser.set(inv.claimedBy, inv);
  }

  const memberSeats: FamilySeat[] = others.map((m) => ({
    kind: 'member' as const,
    userId: m.userId,
    nickname: m.nickname,
    invitedAs: m.invitedAs,
    role: m.role,
    inviteId: claimedByUser.get(m.userId)?.id ?? null,
  }));

  const pendingSeats: FamilySeat[] = invites
    .filter((inv) => !inv.claimedBy)
    .map((inv) => ({
      kind: 'pending' as const,
      invite: inv,
      pendingKind: (inv.reentryUserId
        ? 'reentry'
        : 'waiting') as FamilySeatPendingKind,
    }));

  const occupied = [...memberSeats, ...pendingSeats].slice(0, maxSeats);
  const emptyCount = Math.max(0, maxSeats - occupied.length);
  const empties: FamilySeat[] = Array.from({ length: emptyCount }, () => ({
    kind: 'empty' as const,
  }));

  return [...occupied, ...empties];
}
