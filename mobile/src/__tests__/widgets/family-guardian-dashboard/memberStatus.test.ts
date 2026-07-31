import { memberStatusLabel } from '@/widgets/family-guardian-dashboard';
import { COPY } from '@/shared/copy';

describe('memberStatusLabel', () => {
  it('미확인 알림이면 안부', () => {
    expect(
      memberStatusLabel({
        hasUnackedAlert: true,
        pendingCount: 2,
        totalMeds: 3,
      }),
    ).toBe(COPY.family.statusAnbu);
  });

  it('pending 0 · 약 있으면 다 먹음', () => {
    expect(
      memberStatusLabel({
        hasUnackedAlert: false,
        pendingCount: 0,
        totalMeds: 3,
      }),
    ).toBe(COPY.family.statusAllTaken);
  });

  it('pending > 0이면 진행 중', () => {
    expect(
      memberStatusLabel({
        hasUnackedAlert: false,
        pendingCount: 2,
        totalMeds: 3,
      }),
    ).toBe(COPY.family.statusInProgress);
  });

  it('약 0개면 약 없음', () => {
    expect(
      memberStatusLabel({
        hasUnackedAlert: false,
        pendingCount: 0,
        totalMeds: 0,
      }),
    ).toBe(COPY.family.statusNoMeds);
  });
});
