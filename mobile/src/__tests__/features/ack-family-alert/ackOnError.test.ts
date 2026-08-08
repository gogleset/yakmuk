import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ERRORS } from '@/shared/copy';

describe('ack family alert onError', () => {
  it('ERRORS.family.ackFailed 안부 톤', () => {
    expect(ERRORS.family.ackFailed).toContain('확인');
  });

  it('mutation에 showExceptionToast onError 연결', () => {
    const src = readFileSync(
      join(
        __dirname,
        '../../../features/ack-family-alert/model/useAckFamilyAlertMutation.ts',
      ),
      'utf8',
    );
    expect(src).toContain('showExceptionToast');
    expect(src).toContain('ERRORS.family.ackFailed');
    expect(src).toContain('onError');
  });
});
