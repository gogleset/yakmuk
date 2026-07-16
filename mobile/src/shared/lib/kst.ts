/** KST 날짜/요일 유틸 (서버·클라 공통 개념) */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 오늘 날짜 YYYY-MM-DD (KST) */
export function todayKstDateString(now = new Date()): string {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ISO 타임스탬프 → KST 날짜 YYYY-MM-DD */
export function toKstDateStringFromIso(iso: string): string {
  return todayKstDateString(new Date(iso));
}

/** 월=0 … 일=6 (DECISIONS days_mask) */
export function weekdayMon0FromKstDate(dateKst: string): number {
  const [y, m, d] = dateKst.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`invalid date_kst: ${dateKst}`);
  // UTC noon으로 파싱 후 KST 요일과 동일하게 맞춤
  const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
  const day = new Date(utc).getUTCDay(); // 일=0 … 토=6
  return day === 0 ? 6 : day - 1;
}

/** 당일 KST 종료까지 남은 ms (bound용) */
export function msUntilKstDayEnd(now = new Date()): number {
  const date = todayKstDateString(now);
  const [y, m, d] = date.split('-').map(Number);
  const endUtc = Date.UTC(y, m - 1, d, 14, 59, 59, 999); // KST 23:59:59.999
  return Math.max(0, endUtc - now.getTime());
}
