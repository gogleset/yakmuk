import { addDaysKst, todayKstDateString } from '@/shared/lib/kst';

/** YYYY-MM-DD → "금" (한 글자 요일) */
export function formatWeekdayShort(dateYmd: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  if (!y || !m || !d) return dateYmd;
  const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
  return ['일', '월', '화', '수', '목', '금', '토'][new Date(utc).getUTCDay()]!;
}

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

/** 피드 날짜 헤딩 — 오늘 / 어제 / 7월 16일 (목) */
export function formatFeedDayHeading(
  dateYmd: string,
  todayYmd = todayKstDateString(),
): string {
  if (dateYmd === todayYmd) return '오늘';
  if (dateYmd === addDaysKst(todayYmd, -1)) return '어제';
  return formatFriendlyDate(dateYmd);
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

/** ISO → "방금" / "N분 전" / "N시간 전" / 절대 시각 */
export function formatRelativeTime(
  iso: string,
  nowMs: number = Date.now(),
): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffSec = Math.max(0, Math.floor((nowMs - then) / 1000));
  if (diffSec < 60) return '방금';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return formatFriendlyTime(iso);
}

/** 닉네임 → 아바타용 첫 글자 (공백·빈 문자열 가드) */
export function nicknameInitial(nickname: string | null | undefined): string {
  const trimmed = (nickname ?? '').trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0);
}
