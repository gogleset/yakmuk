import { ERRORS } from '@/shared/copy';
import { showExceptionToast, showMutationError } from '@/shared/lib/mutation';
import * as feedback from '@/shared/lib/exceptionFeedback';

jest.mock('@/shared/lib/exceptionFeedback', () => ({
  presentExceptionModal: jest.fn(),
  presentExceptionToast: jest.fn(),
}));

describe('mutation exception helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('showMutationError → presentExceptionModal + formatUserFacingError', () => {
    showMutationError(ERRORS.med.checkFailed, new Error('network request failed'));
    expect(feedback.presentExceptionModal).toHaveBeenCalledWith(
      ERRORS.med.checkFailed,
      ERRORS.network,
      undefined,
    );
  });

  it('showExceptionToast(string) → presentExceptionToast 그대로', () => {
    showExceptionToast('잠깐 실패', '제목');
    expect(feedback.presentExceptionToast).toHaveBeenCalledWith(
      '잠깐 실패',
      '제목',
    );
  });

  it('showExceptionToast(Error) → formatUserFacingError', () => {
    showExceptionToast(new Error('fetch failed'));
    expect(feedback.presentExceptionToast).toHaveBeenCalledWith(
      ERRORS.network,
      undefined,
    );
  });
});
