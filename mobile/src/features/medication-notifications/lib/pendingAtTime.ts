import {
  groupMedsByScheduledTime,
  parseTimeToMinutes,
} from '@/entities/medication/lib/timeSlots';
import type { Medication } from '@/entities/medication/model/types';

/** 알람 화면 한 줄 — hydrate / route fallback 공통 */
export type AlarmMedItem = {
  medicationId: number;
  name: string;
  scheduledTime: string;
  useMethod: string | null;
  doseAmount: number | null;
  doseUnit: string | null;
};

export type AlarmSlotSource = 'real' | 'mock' | 'fallback' | 'empty';

function toItem(med: Medication): AlarmMedItem {
  return {
    medicationId: med.id,
    name: med.name,
    scheduledTime: med.scheduledTime,
    useMethod: med.useMethod,
    doseAmount: med.doseAmount,
    doseUnit: med.doseUnit,
  };
}

/** 같은 시각 약 전부 (체크 상태 무관 — 체크리스트용) */
export function medsAtScheduledTime(
  medications: Medication[],
  scheduledTime: string,
): AlarmMedItem[] {
  const time = scheduledTime.trim();
  if (!time) return [];

  return medications
    .filter((med) => med.scheduledTime === time)
    .sort((a, b) => a.id - b.id)
    .map(toItem);
}

/** 같은 시각 · 오늘 미복용만 */
export function pendingMedsAtScheduledTime(
  medications: Medication[],
  takenIds: Set<number>,
  scheduledTime: string,
): AlarmMedItem[] {
  return medsAtScheduledTime(medications, scheduledTime).filter(
    (item) => !takenIds.has(item.medicationId),
  );
}

/**
 * 알람 슬롯 선택 — scheduledTime 있으면 그 시각, 없으면 대표 슬롯.
 * preferMulti면 약이 가장 많은 시각 우선 (동점이면 이른 시각).
 */
export function resolveAlarmSlot(
  medications: Medication[],
  options: {
    scheduledTime?: string;
    preferMulti?: boolean;
  } = {},
): { scheduledTime: string; items: AlarmMedItem[] } | null {
  const wantedTime = options.scheduledTime?.trim();
  if (wantedTime) {
    const items = medsAtScheduledTime(medications, wantedTime);
    if (items.length === 0) return null;
    return { scheduledTime: wantedTime, items };
  }

  const groups = groupMedsByScheduledTime(medications);
  if (groups.length === 0) return null;

  let best = groups[0]!;
  for (const group of groups.slice(1)) {
    if (options.preferMulti) {
      const more = group.meds.length > best.meds.length;
      const tieEarlier =
        group.meds.length === best.meds.length &&
        parseTimeToMinutes(group.scheduledTime) <
          parseTimeToMinutes(best.scheduledTime);
      if (more || tieEarlier) best = group;
    } else if (
      parseTimeToMinutes(group.scheduledTime) <
      parseTimeToMinutes(best.scheduledTime)
    ) {
      best = group;
    }
  }

  return {
    scheduledTime: best.scheduledTime,
    items: best.meds
      .slice()
      .sort((a, b) => a.id - b.id)
      .map(toItem),
  };
}

/** Medication → AlarmMedItem */
export function toAlarmMedItem(med: Medication): AlarmMedItem {
  return toItem(med);
}
