import type { DailyLog } from '@/entities/medication/model/types';
import { formatFeedDayHeading } from '@/shared/lib/format';
import { addDaysKst } from '@/shared/lib/kst';
import {
  filterFamilyFeedLastDays,
  groupFamilyFeedByDate,
  sliceFamilyFeedSections,
} from '@/widgets/family-activity-feed/lib/groupFeed';

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

describe('formatFeedDayHeading', () => {
  it('오늘 / 어제 / 날짜', () => {
    expect(formatFeedDayHeading('2026-07-31', '2026-07-31')).toBe('오늘');
    expect(formatFeedDayHeading('2026-07-30', '2026-07-31')).toBe('어제');
    expect(formatFeedDayHeading('2026-07-28', '2026-07-31')).toBe(
      '7월 28일 (화)',
    );
  });
});

describe('filterFamilyFeedLastDays', () => {
  const today = '2026-07-31';
  const items = [
    log({ id: 1, logDate: '2026-07-31' }),
    log({ id: 2, logDate: '2026-07-25' }),
    log({ id: 3, logDate: '2026-07-24' }),
  ];

  it('오늘 포함 7일만', () => {
    const filtered = filterFamilyFeedLastDays(items, today, 7);
    expect(filtered.map((i) => i.id)).toEqual([1, 2]);
    expect(addDaysKst(today, -6)).toBe('2026-07-25');
  });
});

describe('groupFamilyFeedByDate + slice', () => {
  const today = '2026-07-31';
  const items = [
    log({ id: 1, logDate: '2026-07-31' }),
    log({ id: 2, logDate: '2026-07-31' }),
    log({ id: 3, logDate: '2026-07-30' }),
    log({ id: 4, logDate: '2026-07-28' }),
  ];

  it('최신일 먼저 그룹', () => {
    const sections = groupFamilyFeedByDate(items, today);
    expect(sections.map((s) => s.title)).toEqual([
      '오늘',
      '어제',
      '7월 28일 (화)',
    ]);
    expect(sections[0]?.data.map((d) => d.id)).toEqual([1, 2]);
  });

  it('프리뷰는 앞에서 N개만 유지', () => {
    const sections = groupFamilyFeedByDate(items, today);
    const preview = sliceFamilyFeedSections(sections, 3);
    expect(preview.map((s) => s.title)).toEqual(['오늘', '어제']);
    expect(preview.flatMap((s) => s.data.map((d) => d.id))).toEqual([1, 2, 3]);
  });
});
