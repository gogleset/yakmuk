import type { ConditionValue } from '@/entities/medication/model/types';
import { COPY } from '@/shared/copy';
import { formatWeekdayShort } from '@/shared/lib/format';
import { addDaysKst, weekdayMon0FromKstDate } from '@/shared/lib/kst';

export type DayDigestInput = {
  dateYmd: string;
  totalMeds: number;
  takenCount: number;
  condition: ConditionValue | null;
};

export type WeeklyAnomaly = {
  dateYmd: string;
  kind: 'missed' | 'bad';
};

export type WeeklyDigestView = {
  weekStartYmd: string;
  approxLine: string;
  anomalyDays: WeeklyAnomaly[];
};

/** 해당일 포함 주 월요일(KST) */
export function weekStartMondayKst(dateYmd: string): string {
  const mon0 = weekdayMon0FromKstDate(dateYmd);
  return addDaysKst(dateYmd, -mon0);
}

/**
 * 특이일 → 한 줄 묶음.
 * ex) `금, 토, 일 약이 조금 남았어요` · `월 컨디션이 안 좋았어요`
 */
export function formatWeeklyAnomalyLines(
  anomalies: WeeklyAnomaly[],
): string[] {
  const missed = anomalies.filter((a) => a.kind === 'missed');
  const bad = anomalies.filter((a) => a.kind === 'bad');
  const lines: string[] = [];

  if (missed.length > 0) {
    const weekdays = missed
      .map((a) => formatWeekdayShort(a.dateYmd))
      .join(', ');
    lines.push(COPY.family.weeklyMissedDays(weekdays));
  }
  if (bad.length > 0) {
    const weekdays = bad.map((a) => formatWeekdayShort(a.dateYmd)).join(', ');
    lines.push(COPY.family.weeklyBadDays(weekdays));
  }
  return lines;
}

/** 순수 집계 — 차트/분수 UI 모델 금지 */
export function buildWeeklyDigest(
  days: DayDigestInput[],
  weekStartYmd: string,
): WeeklyDigestView {
  const anomalyDays: WeeklyAnomaly[] = [];
  let scheduledDays = 0;
  let completeDays = 0;
  let badCount = 0;

  for (const day of days) {
    if (day.condition === 'BAD') {
      anomalyDays.push({ dateYmd: day.dateYmd, kind: 'bad' });
      badCount += 1;
    }
    if (day.totalMeds > 0) {
      scheduledDays += 1;
      if (day.takenCount >= day.totalMeds) {
        completeDays += 1;
      } else {
        anomalyDays.push({ dateYmd: day.dateYmd, kind: 'missed' });
      }
    }
  }

  let approxLine: string = COPY.family.weeklyOk;
  if (scheduledDays === 0) {
    approxLine = COPY.family.weeklyNoMeds;
  } else if (completeDays === scheduledDays && badCount === 0) {
    approxLine = COPY.family.weeklyOk;
  } else if (completeDays / scheduledDays >= 0.7) {
    approxLine = COPY.family.weeklyMostly;
  } else {
    approxLine = COPY.family.weeklyUneven;
  }

  return { weekStartYmd, approxLine, anomalyDays };
}
