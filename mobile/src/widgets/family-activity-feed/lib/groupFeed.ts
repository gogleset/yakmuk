import type { DailyLog } from '@/entities/medication/model/types';
import { formatFeedDayHeading } from '@/shared/lib/format';
import { addDaysKst } from '@/shared/lib/kst';

export type FamilyFeedSection = {
  dateYmd: string;
  title: string;
  data: DailyLog[];
};

/** 오늘 포함 windowDays일 이내만 (logDate 기준) */
export function filterFamilyFeedLastDays(
  items: DailyLog[],
  todayYmd: string,
  windowDays: number,
): DailyLog[] {
  const days = Math.max(1, windowDays);
  const sinceYmd = addDaysKst(todayYmd, -(days - 1));
  return items.filter(
    (item) => item.logDate >= sinceYmd && item.logDate <= todayYmd,
  );
}

/** 최신일 먼저 · 날짜별 그룹 */
export function groupFamilyFeedByDate(
  items: DailyLog[],
  todayYmd: string,
): FamilyFeedSection[] {
  const byDate = new Map<string, DailyLog[]>();
  for (const item of items) {
    const list = byDate.get(item.logDate) ?? [];
    list.push(item);
    byDate.set(item.logDate, list);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([dateYmd, data]) => ({
      dateYmd,
      title: formatFeedDayHeading(dateYmd, todayYmd),
      data,
    }));
}

/** 그룹 유지하며 앞에서부터 previewCount개만 */
export function sliceFamilyFeedSections(
  sections: FamilyFeedSection[],
  previewCount: number,
): FamilyFeedSection[] {
  let remaining = Math.max(0, previewCount);
  const out: FamilyFeedSection[] = [];
  for (const section of sections) {
    if (remaining <= 0) break;
    const data = section.data.slice(0, remaining);
    remaining -= data.length;
    if (data.length > 0) {
      out.push({ ...section, data });
    }
  }
  return out;
}
