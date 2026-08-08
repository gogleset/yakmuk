import { COPY, ERRORS } from '@/shared/copy';
import {
  familyAckErrorTitle,
  familySectionFallbackMessage,
} from '@/entities/family/lib/familyExceptionCopy';

describe('familyExceptionCopy', () => {
  it('isError면 로드실패 카피', () => {
    expect(
      familySectionFallbackMessage({
        isError: true,
        loadFailed: COPY.family.loadFailedFeed,
        emptyMessage: COPY.family.emptyFeedMessage,
      }),
    ).toBe(COPY.family.loadFailedFeed);
  });

  it('성공·empty면 empty 카피', () => {
    expect(
      familySectionFallbackMessage({
        isError: false,
        loadFailed: COPY.family.loadFailedFeed,
        emptyMessage: COPY.family.emptyFeedMessage,
      }),
    ).toBe(COPY.family.emptyFeedMessage);
  });

  it('ack 실패 타이틀', () => {
    expect(familyAckErrorTitle()).toBe(ERRORS.family.ackFailed);
  });
});
