import { mapFamilyInvite, mapUser } from '@/entities/user/api/mappers';

describe('mapUser / mapFamilyInvite reentry fields', () => {
  it('force_sign_out_at · reentry_user_id 매핑', () => {
    const user = mapUser({
      id: 'u1',
      nickname: '아빠',
      invited_as: '아빠',
      role: 'care_recipient',
      family_id: 'f1',
      push_token: null,
      force_sign_out_at: '2026-08-01T00:00:00Z',
    });
    expect(user.forceSignOutAt).toBe('2026-08-01T00:00:00Z');
    expect(user.pushToken).toBeNull();

    const invite = mapFamilyInvite({
      id: 'i1',
      family_id: 'f1',
      invite_code: 'ABCDEF',
      invited_as: '아빠',
      target_role: 'care_recipient',
      claimed_by: null,
      claimed_at: null,
      reentry_user_id: 'u1',
    });
    expect(invite.reentryUserId).toBe('u1');
    expect(invite.claimedBy).toBeNull();
  });

  it('null 필드', () => {
    const user = mapUser({
      id: 'u1',
      nickname: '리더',
      invited_as: null,
      role: 'family_leader',
      family_id: 'f1',
      push_token: null,
      force_sign_out_at: null,
    });
    expect(user.forceSignOutAt).toBeNull();
    expect(user.pushToken).toBeNull();

    const invite = mapFamilyInvite({
      id: 'i1',
      family_id: 'f1',
      invite_code: 'ABCDEF',
      invited_as: '엄마',
      target_role: 'guardian',
      claimed_by: 'u2',
      claimed_at: '2026-08-01T00:00:00Z',
      reentry_user_id: null,
    });
    expect(invite.reentryUserId).toBeNull();
    expect(invite.claimedBy).toBe('u2');
  });

  it('push_token · legacy expo_push_token', () => {
    expect(
      mapUser({
        id: 'u1',
        nickname: '리더',
        role: 'family_leader',
        push_token: 'fcm-1',
      }).pushToken,
    ).toBe('fcm-1');
    expect(
      mapUser({
        id: 'u1',
        nickname: '리더',
        role: 'family_leader',
        expo_push_token: 'legacy',
      }).pushToken,
    ).toBe('legacy');
  });
});
