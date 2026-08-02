import type { Medication } from '@/entities/medication/model/types';
import {
  medsAtScheduledTime,
  pendingMedsAtScheduledTime,
  resolveAlarmSlot,
} from '@/features/medication-notifications/lib/pendingAtTime';

function med(
  partial: Partial<Medication> & Pick<Medication, 'id' | 'scheduledTime'>,
): Medication {
  return {
    userId: 'u',
    name: partial.name ?? `약${partial.id}`,
    daysMask: 'daily',
    createdAt: '',
    deletedAt: null,
    itemSeq: null,
    color: 'teal',
    efficacy: null,
    useMethod: partial.useMethod ?? null,
    storage: null,
    warning: null,
    doseAmount: partial.doseAmount ?? null,
    doseUnit: partial.doseUnit ?? null,
    notificationEnabled: true,
    ...partial,
  };
}

const meds = [
  med({
    id: 1,
    name: 'A',
    scheduledTime: '08:00',
    useMethod: '식후',
    doseAmount: 1,
    doseUnit: 'tablet',
  }),
  med({
    id: 2,
    name: 'B',
    scheduledTime: '08:00',
    doseAmount: 2,
    doseUnit: 'capsule',
  }),
  med({ id: 3, name: 'C', scheduledTime: '20:00' }),
];

describe('medsAtScheduledTime', () => {
  it('같은 시각 전부 · taken 무관', () => {
    expect(
      medsAtScheduledTime(meds, '08:00').map((m) => m.medicationId),
    ).toEqual([1, 2]);
  });
});

describe('resolveAlarmSlot', () => {
  it('scheduledTime 지정 시 그 슬롯', () => {
    const slot = resolveAlarmSlot(meds, { scheduledTime: '08:00' });
    expect(slot?.scheduledTime).toBe('08:00');
    expect(slot?.items.map((i) => i.medicationId)).toEqual([1, 2]);
  });

  it('preferMulti면 약이 가장 많은 시각', () => {
    const slot = resolveAlarmSlot(meds, { preferMulti: true });
    expect(slot?.scheduledTime).toBe('08:00');
    expect(slot?.items).toHaveLength(2);
  });

  it('기본은 가장 이른 시각', () => {
    const slot = resolveAlarmSlot(meds, {});
    expect(slot?.scheduledTime).toBe('08:00');
  });

  it('약 없으면 null', () => {
    expect(resolveAlarmSlot([])).toBeNull();
  });
});

describe('pendingMedsAtScheduledTime', () => {
  it('같은 시각 미복용만 · id 순', () => {
    expect(pendingMedsAtScheduledTime(meds, new Set(), '08:00')).toEqual([
      {
        medicationId: 1,
        name: 'A',
        scheduledTime: '08:00',
        useMethod: '식후',
        doseAmount: 1,
        doseUnit: 'tablet',
      },
      {
        medicationId: 2,
        name: 'B',
        scheduledTime: '08:00',
        useMethod: null,
        doseAmount: 2,
        doseUnit: 'capsule',
      },
    ]);
  });

  it('이미 먹은 sibling은 제외', () => {
    expect(pendingMedsAtScheduledTime(meds, new Set([1]), '08:00')).toEqual([
      {
        medicationId: 2,
        name: 'B',
        scheduledTime: '08:00',
        useMethod: null,
        doseAmount: 2,
        doseUnit: 'capsule',
      },
    ]);
  });

  it('전부 먹었으면 빈 배열', () => {
    expect(pendingMedsAtScheduledTime(meds, new Set([1, 2]), '08:00')).toEqual(
      [],
    );
  });

  it('빈 scheduledTime이면 빈 배열', () => {
    expect(pendingMedsAtScheduledTime(meds, new Set(), '')).toEqual([]);
  });
});
