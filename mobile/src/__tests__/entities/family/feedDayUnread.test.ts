import {
  feedDayReadsByDate,
  hasUnreadFeedDays,
  isFeedDayUnread,
  latestCreatedAtByDate,
} from '@/entities/family/lib/feedDayUnread';
import type { FamilyFeedDayRead } from '@/entities/family/model/types';

describe('isFeedDayUnread', () => {
  it('no latest → not unread', () => {
    expect(
      isFeedDayUnread({ readAt: null, latestCreatedAt: null }),
    ).toBe(false);
  });

  it('no read → unread', () => {
    expect(
      isFeedDayUnread({
        readAt: null,
        latestCreatedAt: '2026-08-10T10:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('latest after read → unread again', () => {
    expect(
      isFeedDayUnread({
        readAt: '2026-08-10T09:00:00.000Z',
        latestCreatedAt: '2026-08-10T10:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('latest before or equal read → read', () => {
    expect(
      isFeedDayUnread({
        readAt: '2026-08-10T10:00:00.000Z',
        latestCreatedAt: '2026-08-10T09:00:00.000Z',
      }),
    ).toBe(false);
    expect(
      isFeedDayUnread({
        readAt: '2026-08-10T10:00:00.000Z',
        latestCreatedAt: '2026-08-10T10:00:00.000Z',
      }),
    ).toBe(false);
  });
});

describe('latestCreatedAtByDate', () => {
  it('keeps max createdAt per logDate', () => {
    const map = latestCreatedAtByDate([
      { logDate: '2026-08-10', createdAt: '2026-08-10T08:00:00.000Z' },
      { logDate: '2026-08-10', createdAt: '2026-08-10T12:00:00.000Z' },
      { logDate: '2026-08-09', createdAt: '2026-08-09T01:00:00.000Z' },
    ]);
    expect(map.get('2026-08-10')).toBe('2026-08-10T12:00:00.000Z');
    expect(map.get('2026-08-09')).toBe('2026-08-09T01:00:00.000Z');
  });
});

describe('hasUnreadFeedDays', () => {
  const reads: FamilyFeedDayRead[] = [
    {
      userId: 'u1',
      familyId: 'f1',
      logDate: '2026-08-09',
      readAt: '2026-08-09T20:00:00.000Z',
    },
  ];

  it('true when any day unread', () => {
    expect(
      hasUnreadFeedDays(
        [
          {
            dateYmd: '2026-08-10',
            data: [{ createdAt: '2026-08-10T01:00:00.000Z' }],
          },
          {
            dateYmd: '2026-08-09',
            data: [{ createdAt: '2026-08-09T10:00:00.000Z' }],
          },
        ],
        feedDayReadsByDate(reads),
      ),
    ).toBe(true);
  });

  it('false when all days read', () => {
    expect(
      hasUnreadFeedDays(
        [
          {
            dateYmd: '2026-08-09',
            data: [{ createdAt: '2026-08-09T10:00:00.000Z' }],
          },
        ],
        feedDayReadsByDate(reads),
      ),
    ).toBe(false);
  });
});
