import { COPY } from '@/shared/copy';
import { kokiForWeeklyDigest } from '@/widgets/family-weekly-digest/kokiForWeeklyDigest';
import type { WeeklyDigestView } from '@/entities/family';

function digest(
  partial: Partial<WeeklyDigestView> & Pick<WeeklyDigestView, 'approxLine'>,
): WeeklyDigestView {
  return {
    weekStartYmd: '2026-08-03',
    anomalyDays: [],
    ...partial,
  };
}

describe('kokiForWeeklyDigest', () => {
  it('no meds → empty', () => {
    expect(
      kokiForWeeklyDigest(digest({ approxLine: COPY.family.weeklyNoMeds })),
    ).toBe('empty');
  });

  it('bad day → worried', () => {
    expect(
      kokiForWeeklyDigest(
        digest({
          approxLine: COPY.family.weeklyUneven,
          anomalyDays: [{ dateYmd: '2026-08-05', kind: 'bad' }],
        }),
      ),
    ).toBe('worried');
  });

  it('missed → thinking', () => {
    expect(
      kokiForWeeklyDigest(
        digest({
          approxLine: COPY.family.weeklyUneven,
          anomalyDays: [{ dateYmd: '2026-08-05', kind: 'missed' }],
        }),
      ),
    ).toBe('thinking');
  });

  it('ok → happy · mostly → cheer', () => {
    expect(
      kokiForWeeklyDigest(digest({ approxLine: COPY.family.weeklyOk })),
    ).toBe('happy');
    expect(
      kokiForWeeklyDigest(digest({ approxLine: COPY.family.weeklyMostly })),
    ).toBe('cheer');
  });
});
