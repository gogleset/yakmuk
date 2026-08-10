import { familyMutationKeys } from '@/entities/family/model/queryKeys';

describe('markFeedDayRead mutation key', () => {
  it('is under family-mutation', () => {
    expect(familyMutationKeys.markFeedDayRead()).toEqual([
      'family-mutation',
      'mark-feed-day-read',
    ]);
  });
});
