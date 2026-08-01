import {
  buildExpectedSchedule,
  diffFingerprints,
  fingerprintsOf,
  mon0ToExpoWeekday,
} from '@/features/medication-notifications/fingerprint';
import type { Medication } from '@/entities/medication/model/types';

function med(
  partial: Partial<Medication> & Pick<Medication, 'id' | 'scheduledTime' | 'daysMask'>,
): Medication {
  return {
    userId: 'u',
    name: partial.name ?? '약',
    createdAt: '',
    deletedAt: null,
    itemSeq: null,
    color: 'teal',
    efficacy: null,
    useMethod: null,
    storage: null,
    warning: null,
    doseAmount: null,
    doseUnit: null,
    notificationEnabled: true,
    ...partial,
  };
}

describe('buildExpectedSchedule', () => {
  it('DB 행(HH:MM:SS→slice) 기준 expected fingerprint', () => {
    // mapMedication이 scheduled_time을 HH:MM으로 자른 뒤 기대 스케줄
    const alarms = buildExpectedSchedule(
      [
        med({ id: 3, name: '폐렴', scheduledTime: '08:00', daysMask: 'daily' }),
        med({
          id: 4,
          name: 'ㅇㅇ',
          scheduledTime: '15:32',
          daysMask: 'daily',
        }),
      ],
      new Set(),
    );
    expect(fingerprintsOf(alarms)).toEqual([
      '3|daily|8:0',
      '4|daily|15:32',
    ]);
  });

  it('notificationEnabled false면 제외', () => {
    const alarms = buildExpectedSchedule(
      [
        med({
          id: 1,
          scheduledTime: '08:00',
          daysMask: 'daily',
          notificationEnabled: false,
        }),
        med({ id: 2, scheduledTime: '20:00', daysMask: 'daily' }),
      ],
      new Set(),
    );
    expect(alarms).toHaveLength(1);
    expect(alarms[0]?.medicationId).toBe(2);
  });

  it('taken이면 제외', () => {
    const alarms = buildExpectedSchedule(
      [med({ id: 1, scheduledTime: '08:00', daysMask: 'daily' })],
      new Set([1]),
    );
    expect(alarms).toHaveLength(0);
  });

  it('weekday면 expo weekday로 펼침', () => {
    // mon0=0(월) → expo 2
    expect(mon0ToExpoWeekday(0)).toBe(2);
    const alarms = buildExpectedSchedule(
      [med({ id: 1, scheduledTime: '09:30', daysMask: '0,2' })],
      new Set(),
    );
    expect(fingerprintsOf(alarms)).toEqual([
      '1|2|9:30',
      '1|4|9:30',
    ]);
  });
});

describe('diffFingerprints', () => {
  it('in-sync', () => {
    expect(diffFingerprints(['a', 'b'], ['a', 'b']).inSync).toBe(true);
  });

  it('missing / extra', () => {
    const d = diffFingerprints(['a', 'b'], ['b', 'c']);
    expect(d.missing).toEqual(['a']);
    expect(d.extra).toEqual(['c']);
    expect(d.inSync).toBe(false);
  });
});
