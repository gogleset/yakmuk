import { LIMITS } from '@/shared/constants';
import { ERRORS } from '@/shared/copy';

describe('LIMITS.maxFamilyInvites', () => {
  it('is 6 (synced with create_family_invite)', () => {
    expect(LIMITS.maxFamilyInvites).toBe(6);
  });

  it('ERRORS.invite.limitReached reflects the limit', () => {
    expect(ERRORS.invite.limitReached).toContain('6');
  });
});
