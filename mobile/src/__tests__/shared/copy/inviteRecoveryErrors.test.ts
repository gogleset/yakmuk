import { BACKEND_ERROR_MESSAGES, ERRORS } from '@/shared/copy/errors';

describe('invite / recovery error mapping', () => {
  it('invite already claimed → 새 초대코드 안내', () => {
    expect(BACKEND_ERROR_MESSAGES['invite already claimed']).toBe(
      ERRORS.invite.alreadyClaimed,
    );
    expect(ERRORS.invite.alreadyClaimed).toContain('새 초대코드');
  });

  it('cannot recover family leader 매핑', () => {
    expect(BACKEND_ERROR_MESSAGES['cannot recover family leader']).toBe(
      ERRORS.recovery.cannotRecoverLeader,
    );
  });
});
