import { LIMITS } from '@/shared/constants';

export type Period = 'am' | 'pm';

export type Time12h = {
  hour12: number;
  minute: number;
  period: Period;
};

const HHMM_RE = /^(\d{2}):(\d{2})$/;

/** HH:MM — hour 0–23 · minute 0–59 */
export function isValidHhmm(s: string): boolean {
  const match = HHMM_RE.exec(s.trim());
  if (!match) return false;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  );
}

export function isValidHour12(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 12;
}

export function isValidMinute(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 59;
}

/** HH:MM → 12h. 무효면 null */
export function hhmmToTime12h(hhmm: string): Time12h | null {
  if (!isValidHhmm(hhmm)) return null;
  const [hStr, mStr] = hhmm.trim().split(':');
  const hour24 = Number(hStr);
  const minute = Number(mStr);
  const period: Period = hour24 < 12 ? 'am' : 'pm';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, minute, period };
}

/** 12h → HH:MM. 입력 가드 실패 시 defaultDoseTime */
export function time12hToHhmm(t: Time12h): string {
  if (!isValidHour12(t.hour12) || !isValidMinute(t.minute)) {
    return LIMITS.defaultDoseTime;
  }
  let hour24: number;
  if (t.period === 'am') {
    hour24 = t.hour12 === 12 ? 0 : t.hour12;
  } else {
    hour24 = t.hour12 === 12 ? 12 : t.hour12 + 12;
  }
  const hh = String(hour24).padStart(2, '0');
  const mm = String(t.minute).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** 숫자만 남기고 최대 2자리 */
export function parseDigitDraft(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 2);
}

/**
 * 시 필드 자동 이동: 2자리이거나 첫 자리 2–9 (1x만 대기 — 10–12)
 */
export function shouldAdvanceHourField(digits: string): boolean {
  if (digits.length >= 2) return true;
  if (digits.length === 1) {
    const d = Number(digits);
    return Number.isInteger(d) && d >= 2 && d <= 9;
  }
  return false;
}

type NormalizeDraftInput = {
  hourDigits: string;
  minuteDigits: string;
  period: Period;
  fallbackHhmm?: string;
};

/**
 * 시 초과(>12)면 12로 클램프. 미완성은 그대로.
 */
export function coerceHour12Digits(digits: string): {
  digits: string;
  overflow: boolean;
} {
  const raw = parseDigitDraft(digits);
  if (!raw) return { digits: '', overflow: false };
  const n = Number(raw);
  if (!Number.isInteger(n)) return { digits: raw, overflow: false };
  // 2자리이거나 단일 자리로 확정된 값만 초과 판정 (13–99)
  if (raw.length >= 2 && n > 12) {
    return { digits: '12', overflow: true };
  }
  return { digits: raw, overflow: false };
}

/**
 * 분 초과(>59)면 59로 클램프. 미완성은 그대로.
 */
export function coerceMinuteDigits(digits: string): {
  digits: string;
  overflow: boolean;
} {
  const raw = parseDigitDraft(digits);
  if (!raw) return { digits: '', overflow: false };
  const n = Number(raw);
  if (!Number.isInteger(n)) return { digits: raw, overflow: false };
  if (raw.length >= 2 && n > 59) {
    return { digits: '59', overflow: true };
  }
  return { digits: raw, overflow: false };
}

/**
 * draft → 유효 HH:MM.
 * 시 >12 → 12, 분 >59 → 59. 분은 입력값 그대로(스냅 없음). 빈값이면 fallback.
 */
export function normalizeDraft({
  hourDigits,
  minuteDigits,
  period,
  fallbackHhmm,
}: NormalizeDraftInput): string {
  const fallback =
    fallbackHhmm && isValidHhmm(fallbackHhmm)
      ? fallbackHhmm
      : LIMITS.defaultDoseTime;

  const hourCoerced = coerceHour12Digits(hourDigits);
  const minuteCoerced = coerceMinuteDigits(minuteDigits);
  if (!hourCoerced.digits || !minuteCoerced.digits) return fallback;

  let hour12 = Number(hourCoerced.digits);
  let minute = Number(minuteCoerced.digits);

  // 0시 등 미달 → 12로 보정 (표시 상한과 대칭)
  if (!Number.isInteger(hour12) || hour12 < 1) hour12 = 12;
  if (hour12 > 12) hour12 = 12;
  if (!Number.isInteger(minute) || minute < 0) minute = 0;
  if (minute > 59) minute = 59;

  return time12hToHhmm({ hour12, minute, period });
}

/** 표시용 pad (편집 중엔 draft 문자열 그대로) */
export function padHour12(hour12: number): string {
  return String(isValidHour12(hour12) ? hour12 : 12).padStart(2, '0');
}

export function padMinute(minute: number): string {
  const m = isValidMinute(minute) ? minute : 0;
  return String(m).padStart(2, '0');
}
