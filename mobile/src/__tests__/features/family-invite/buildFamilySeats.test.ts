import type { FamilyMember } from '@/entities/family/model/types';
import type { FamilyInvite } from '@/entities/user/model/types';
import { buildFamilySeats } from '@/features/family-invite/lib/buildFamilySeats';

const member = (
  partial: Partial<FamilyMember> & Pick<FamilyMember, 'userId' | 'nickname'>,
): FamilyMember => ({
  invitedAs: null,
  role: 'guardian',
  ...partial,
});

const invite = (
  partial: Partial<FamilyInvite> & Pick<FamilyInvite, 'id' | 'invitedAs'>,
): FamilyInvite => ({
  familyId: 'f1',
  inviteCode: 'ABC123',
  targetRole: 'guardian',
  claimedBy: null,
  claimedAt: null,
  reentryUserId: null,
  ...partial,
});

describe('buildFamilySeats', () => {
  it('fills to max with empty seats (leader excluded)', () => {
    const seats = buildFamilySeats({
      members: [
        member({ userId: 'L', nickname: '리더', role: 'family_leader' }),
        member({ userId: 'm1', nickname: '엄마', invitedAs: '엄마' }),
      ],
      invites: [],
      maxSeats: 6,
    });
    expect(seats).toHaveLength(6);
    expect(seats[0]).toMatchObject({ kind: 'member', userId: 'm1' });
    expect(seats.filter((s) => s.kind === 'empty')).toHaveLength(5);
  });

  it('orders member then pending then empty', () => {
    const seats = buildFamilySeats({
      members: [member({ userId: 'm1', nickname: '엄마' })],
      invites: [
        invite({ id: 'i1', invitedAs: '할머니' }),
        invite({
          id: 'i2',
          invitedAs: '엄마',
          claimedBy: 'm1',
          claimedAt: '2026-01-01',
        }),
      ],
      maxSeats: 6,
    });
    expect(seats.map((s) => s.kind)).toEqual([
      'member',
      'pending',
      'empty',
      'empty',
      'empty',
      'empty',
    ]);
    expect(seats[0]).toMatchObject({
      kind: 'member',
      inviteId: 'i2',
    });
    expect(seats[1]).toMatchObject({
      kind: 'pending',
      invite: expect.objectContaining({ id: 'i1' }),
    });
  });

  it('clamps when occupied exceeds max', () => {
    const seats = buildFamilySeats({
      members: [
        member({ userId: '1', nickname: 'a' }),
        member({ userId: '2', nickname: 'b' }),
        member({ userId: '3', nickname: 'c' }),
      ],
      invites: [
        invite({ id: 'i1', invitedAs: 'x' }),
        invite({ id: 'i2', invitedAs: 'y' }),
        invite({ id: 'i3', invitedAs: 'z' }),
        invite({ id: 'i4', invitedAs: 'w' }),
      ],
      maxSeats: 6,
    });
    expect(seats).toHaveLength(6);
    expect(seats.every((s) => s.kind !== 'empty')).toBe(true);
    expect(seats.filter((s) => s.kind === 'member')).toHaveLength(3);
    expect(seats.filter((s) => s.kind === 'pending')).toHaveLength(3);
  });

  it('marks reentry pending', () => {
    const seats = buildFamilySeats({
      members: [],
      invites: [
        invite({
          id: 'i1',
          invitedAs: '이모',
          reentryUserId: 'u1',
        }),
      ],
      maxSeats: 2,
    });
    expect(seats[0]).toMatchObject({
      kind: 'pending',
      pendingKind: 'reentry',
    });
  });
});
