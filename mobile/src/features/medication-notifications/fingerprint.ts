import { parseDaysMask } from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';

/** 로컬 스케줄 기대 항목 — OS 등록분과 비교용 */
export type ExpectedMedAlarm = {
  medicationId: number;
  name: string;
  scheduledTime: string;
  hour: number;
  minute: number;
  /** 'daily' | expo weekday 1(일)…7(토) */
  weekdayKey: 'daily' | number;
};

export const MED_NOTIF_KIND = 'medication' as const;
export const MED_NOTIF_ID_PREFIX = 'yakmuk-med-';

export function medNotifIdentifier(alarm: ExpectedMedAlarm): string {
  return `${MED_NOTIF_ID_PREFIX}${alarm.medicationId}-${alarm.weekdayKey}-${alarm.hour}-${alarm.minute}`;
}

export function alarmFingerprint(alarm: ExpectedMedAlarm): string {
  return `${alarm.medicationId}|${alarm.weekdayKey}|${alarm.hour}:${alarm.minute}`;
}

function parseHourMinute(
  scheduledTime: string,
): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(scheduledTime.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** days_mask mon0 (월=0…일=6) → expo WEEKLY weekday (일=1…토=7) */
export function mon0ToExpoWeekday(mon0: number): number {
  const getDay = (mon0 + 1) % 7;
  return getDay + 1;
}

/**
 * 서버 meds + 오늘 taken → 기대 로컬 알림 목록.
 * notificationEnabled=false 또는 오늘 복용 완료는 제외.
 */
export function buildExpectedSchedule(
  medications: Medication[],
  takenIds: Set<number>,
): ExpectedMedAlarm[] {
  const out: ExpectedMedAlarm[] = [];

  for (const med of medications) {
    if (med.notificationEnabled === false) continue;
    if (takenIds.has(med.id)) continue;

    const hm = parseHourMinute(med.scheduledTime);
    if (!hm) continue;

    const { mode, days } = parseDaysMask(med.daysMask);
    const base = {
      medicationId: med.id,
      name: med.name,
      scheduledTime: med.scheduledTime,
      hour: hm.hour,
      minute: hm.minute,
    };

    if (mode === 'daily' || days.length === 0 || days.length === 7) {
      out.push({ ...base, weekdayKey: 'daily' });
      continue;
    }

    for (const day of days) {
      out.push({ ...base, weekdayKey: mon0ToExpoWeekday(day) });
    }
  }

  return out.sort((a, b) =>
    alarmFingerprint(a).localeCompare(alarmFingerprint(b)),
  );
}

export function fingerprintsOf(alarms: ExpectedMedAlarm[]): string[] {
  return alarms.map(alarmFingerprint);
}

export function diffFingerprints(
  expected: string[],
  scheduled: string[],
): { missing: string[]; extra: string[]; inSync: boolean } {
  const exp = new Set(expected);
  const sch = new Set(scheduled);
  const missing = expected.filter((f) => !sch.has(f));
  const extra = scheduled.filter((f) => !exp.has(f));
  return { missing, extra, inSync: missing.length === 0 && extra.length === 0 };
}
