import { canCreateInvite } from '@/features/family-invite/lib/canCreateInvite';

describe('canCreateInvite', () => {
  it('requires role and non-empty label', () => {
    expect(
      canCreateInvite({ targetRole: 'guardian', invitedAs: '' }),
    ).toBe(false);
    expect(
      canCreateInvite({ targetRole: 'guardian', invitedAs: '   ' }),
    ).toBe(false);
    expect(
      canCreateInvite({ targetRole: 'care_recipient', invitedAs: '엄마' }),
    ).toBe(true);
  });
});
