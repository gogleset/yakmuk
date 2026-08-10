import { filterFamilyFeedLastDays } from '@/widgets/family-activity-feed/lib/groupFeed';
import type { DailyLog } from '@/entities/medication/model/types';

function log(partial: Partial<DailyLog> & { id: number; logDate: string }): DailyLog {
  return {
    medicationId: null,
    userId: 'u1',
    status: 'TAKEN',
    condition: null,
    message: null,
    familyId: 'f1',
    createdAt: `${partial.logDate}T00:00:00.000Z`,
    nickname: '엄마',
    medicationName: null,
    ...partial,
  };
}

describe('family tab today-only preview', () => {
  it('windowDays=1 keeps only today', () => {
    const today = '2026-08-10';
    const items = [
      log({ id: 1, logDate: '2026-08-10' }),
      log({ id: 2, logDate: '2026-08-09' }),
      log({ id: 3, logDate: '2026-08-08' }),
    ];
    expect(filterFamilyFeedLastDays(items, today, 1).map((i) => i.id)).toEqual([
      1,
    ]);
  });
});
