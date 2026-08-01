import {
  groupMedsByScheduledTime,
  groupTimedEntriesByScheduledTime,
  parseTimeToMinutes,
  timeOfDaySlot,
} from '@/entities/medication/lib/timeSlots';
import type { Medication } from '@/entities/medication/model/types';

function med(
  id: number,
  scheduledTime: string,
  name = `약${id}`,
): Medication {
  return {
    id,
    name,
    scheduledTime,
    daysMask: 'daily',
    userId: 'u',
    createdAt: '',
    deletedAt: null,
  };
}

describe('timeSlots', () => {
  it('parseTimeToMinutes — 정상·실패', () => {
    expect(parseTimeToMinutes('08:00')).toBe(480);
    expect(parseTimeToMinutes('12:30')).toBe(750);
    expect(parseTimeToMinutes('bad')).toBe(0);
  });

  it('timeOfDaySlot — 버킷 경계', () => {
    expect(timeOfDaySlot('00:00')).toBe('dawn');
    expect(timeOfDaySlot('06:59')).toBe('dawn');
    expect(timeOfDaySlot('07:00')).toBe('morning');
    expect(timeOfDaySlot('11:59')).toBe('morning');
    expect(timeOfDaySlot('12:00')).toBe('lunch');
    expect(timeOfDaySlot('14:59')).toBe('lunch');
    expect(timeOfDaySlot('15:00')).toBe('afternoon');
    expect(timeOfDaySlot('15:30')).toBe('afternoon');
    expect(timeOfDaySlot('17:59')).toBe('afternoon');
    expect(timeOfDaySlot('18:00')).toBe('bedtime');
    expect(timeOfDaySlot('23:00')).toBe('bedtime');
    expect(timeOfDaySlot('23:59')).toBe('bedtime');
  });

  it('groupMedsByScheduledTime — 시간순·동일 시각 묶음', () => {
    const groups = groupMedsByScheduledTime([
      med(3, '19:00'),
      med(1, '08:00', 'A'),
      med(2, '08:00', 'B'),
      med(4, '12:30'),
    ]);
    expect(groups.map((g) => g.scheduledTime)).toEqual([
      '08:00',
      '12:30',
      '19:00',
    ]);
    expect(groups[0]?.meds.map((m) => m.name)).toEqual(['A', 'B']);
    expect(groups[0]?.slot).toBe('morning');
    expect(groups[1]?.slot).toBe('lunch');
    expect(groups[2]?.slot).toBe('bedtime');
  });

  it('groupTimedEntriesByScheduledTime — null 시간은 끝', () => {
    const groups = groupTimedEntriesByScheduledTime([
      { key: '1', name: 'A', scheduledTime: '19:00', taken: false },
      { key: '2', name: 'B', scheduledTime: null, taken: true },
      { key: '3', name: 'C', scheduledTime: '08:00', taken: true },
    ]);
    expect(groups.map((g) => g.scheduledTime)).toEqual([
      '08:00',
      '19:00',
      '--:--',
    ]);
    expect(groups[0]?.slot).toBe('morning');
  });
});
