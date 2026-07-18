import { todayKstDateString } from '@/shared/lib/kst';

/** YYYY-MM-DD → "7월 16일 (목)" */
export function formatFriendlyDate(dateYmd: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  if (!y || !m || !d) return dateYmd;
  const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][
    new Date(utc).getUTCDay()
  ];
  return `${m}월 ${d}일 (${weekday})`;
}

/** 오늘이면 "오늘 · 7월 16일", 아니면 "7월 16일 (목)" */
export function formatDayLabel(
  dateYmd: string,
  todayYmd = todayKstDateString(),
): string {
  const friendly = formatFriendlyDate(dateYmd);
  if (dateYmd === todayYmd) return `오늘 · ${friendly}`;
  return friendly;
}

/** ISO timestamp → "오후 3:05" */
export function formatFriendlyTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatFeedTime(logDate: string, createdAt: string): string {
  return `${formatFriendlyDate(logDate)} · ${formatFriendlyTime(createdAt)}`;
}
