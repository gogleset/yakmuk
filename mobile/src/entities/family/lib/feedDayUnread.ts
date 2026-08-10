import type { FamilyFeedDayRead } from '@/entities/family/model/types';

/**
 * 일자 unread — 읽음 없거나, 그날 최신 로그가 read_at 이후면 미읽.
 */
export function isFeedDayUnread(params: {
  readAt: string | null | undefined;
  latestCreatedAt: string | null | undefined;
}): boolean {
  const { readAt, latestCreatedAt } = params;
  if (!latestCreatedAt) return false;
  if (!readAt) return true;
  return latestCreatedAt > readAt;
}

/** 일자별 max createdAt */
export function latestCreatedAtByDate(
  items: { logDate: string; createdAt: string }[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of items) {
    const prev = map.get(item.logDate);
    if (!prev || item.createdAt > prev) {
      map.set(item.logDate, item.createdAt);
    }
  }
  return map;
}

/** logDate → readAt */
export function feedDayReadsByDate(
  reads: FamilyFeedDayRead[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const read of reads) {
    map.set(read.logDate, read.readAt);
  }
  return map;
}

/**
 * 섹션(일자 그룹) 중 미읽이 하나라도 있으면 true (벨 뱃지).
 */
export function hasUnreadFeedDays(
  sections: { dateYmd: string; data: { createdAt: string }[] }[],
  readsByDate: Map<string, string>,
): boolean {
  for (const section of sections) {
    if (section.data.length === 0) continue;
    let latest = section.data[0]!.createdAt;
    for (const item of section.data) {
      if (item.createdAt > latest) latest = item.createdAt;
    }
    if (
      isFeedDayUnread({
        readAt: readsByDate.get(section.dateYmd),
        latestCreatedAt: latest,
      })
    ) {
      return true;
    }
  }
  return false;
}
