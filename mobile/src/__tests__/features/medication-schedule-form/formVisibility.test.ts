import { createDefaultScheduleDraft } from '@/entities/medication/lib/scheduleDraft';
import type { MedicationScheduleDraft } from '@/entities/medication/lib/scheduleDraft';
import {
  collapseOnNameCleared,
  resolveFormVisibility,
} from '@/features/medication-schedule-form/lib/formVisibility';

const baseDraft = createDefaultScheduleDraft();

describe('resolveFormVisibility', () => {
  it('create + 이름 미확정이면 스케줄·CTA 숨김', () => {
    expect(
      resolveFormVisibility({
        mode: 'create',
        nameConfirmed: false,
        draft: baseDraft,
      }),
    ).toEqual({
      showScheduleMode: false,
      showSameTimes: false,
      showDaysMode: false,
      showWeekdayPicker: false,
      showPerWeekdayTimes: false,
      showSubmit: false,
    });
  });

  it('create + 이름 확정 + same(기본)이면 모드·시간·DaysMode·CTA 즉시', () => {
    expect(
      resolveFormVisibility({
        mode: 'create',
        nameConfirmed: true,
        draft: baseDraft,
      }),
    ).toEqual({
      showScheduleMode: true,
      showSameTimes: true,
      showDaysMode: true,
      showWeekdayPicker: false,
      showPerWeekdayTimes: false,
      showSubmit: true,
    });
  });

  it('create + same + weekday면 WeekdayPicker 추가', () => {
    const draft: MedicationScheduleDraft = {
      ...baseDraft,
      daysMode: 'weekday',
      weekdays: [0, 2],
    };
    expect(
      resolveFormVisibility({
        mode: 'create',
        nameConfirmed: true,
        draft,
      }).showWeekdayPicker,
    ).toBe(true);
  });

  it('create + perWeekday면 요일 피커, 선택 시 요일별 시간', () => {
    const emptyDays: MedicationScheduleDraft = {
      ...baseDraft,
      scheduleMode: 'perWeekday',
      weekdays: [],
    };
    expect(
      resolveFormVisibility({
        mode: 'create',
        nameConfirmed: true,
        draft: emptyDays,
      }),
    ).toMatchObject({
      showScheduleMode: true,
      showSameTimes: false,
      showDaysMode: false,
      showWeekdayPicker: true,
      showPerWeekdayTimes: false,
      showSubmit: true,
    });

    const withDays: MedicationScheduleDraft = {
      ...emptyDays,
      weekdays: [1],
      timesByDay: { 1: ['08:00'] },
    };
    expect(
      resolveFormVisibility({
        mode: 'create',
        nameConfirmed: true,
        draft: withDays,
      }).showPerWeekdayTimes,
    ).toBe(true);
  });

  it('edit이면 이름 없이도 draft 분기에 맞게 전부 공개', () => {
    const vis = resolveFormVisibility({
      mode: 'edit',
      nameConfirmed: false,
      draft: baseDraft,
    });
    expect(vis).toEqual({
      showScheduleMode: true,
      showSameTimes: true,
      showDaysMode: true,
      showWeekdayPicker: false,
      showPerWeekdayTimes: false,
      showSubmit: true,
    });
  });
});

describe('collapseOnNameCleared', () => {
  it('이름 클리어 시 draft 기본값 + nameConfirmed false', () => {
    const dirty: MedicationScheduleDraft = {
      ...createDefaultScheduleDraft(),
      scheduleMode: 'perWeekday',
      slotTimes: ['09:00', '21:00'],
      daysMode: 'weekday',
      weekdays: [0, 1],
      timesByDay: { 0: ['09:00'] },
    };
    expect(collapseOnNameCleared(dirty)).toEqual({
      nameConfirmed: false,
      draft: createDefaultScheduleDraft(),
    });
  });
});
