import {
  createDefaultScheduleDraft,
  expandScheduleDraft,
  medsToScheduleDraft,
} from '@/entities/medication/lib/scheduleDraft';
import { parseTimeToMinutes } from '@/entities/medication/lib/timeSlots';
import type { Medication } from '@/entities/medication/model/types';

function med(
  id: number,
  scheduledTime: string,
  daysMask: string,
  name = '약',
): Medication {
  return {
    id,
    name,
    scheduledTime,
    daysMask,
    userId: 'u',
    createdAt: '',
    deletedAt: null,
  };
}

describe('scheduleDraft', () => {
  it('medsToScheduleDraft — 같은 일정 여러 시간', () => {
    const draft = medsToScheduleDraft([
      med(1, '08:00', 'daily'),
      med(2, '12:30', 'daily'),
    ]);
    expect(draft.scheduleMode).toBe('same');
    expect(draft.slotTimes).toEqual(['08:00', '12:30']);
    expect(draft.daysMode).toBe('daily');
  });

  it('medsToScheduleDraft — 요일마다 다르게', () => {
    const draft = medsToScheduleDraft([
      med(1, '08:00', '0'),
      med(2, '19:00', '2'),
    ]);
    expect(draft.scheduleMode).toBe('perWeekday');
    expect(draft.weekdays).toEqual([0, 2]);
    expect(draft.timesByDay[0]).toEqual(['08:00']);
    expect(draft.timesByDay[2]).toEqual(['19:00']);
  });

  it('expandScheduleDraft — same 모드', () => {
    const draft = createDefaultScheduleDraft();
    draft.slotTimes = ['08:00', '20:00'];
    const slots = expandScheduleDraft(draft);
    expect(slots).toHaveLength(2);
    expect(slots.map((s) => s.scheduledTime).sort((a, b) =>
      parseTimeToMinutes(a) - parseTimeToMinutes(b),
    )).toEqual(['08:00', '20:00']);
  });
});
