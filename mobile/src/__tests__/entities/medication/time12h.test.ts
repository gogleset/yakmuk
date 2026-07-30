import { LIMITS } from '@/shared/constants';
import {
  coerceHour12Digits,
  coerceMinuteDigits,
  hhmmToTime12h,
  isValidHhmm,
  isValidHour12,
  isValidMinute,
  normalizeDraft,
  parseDigitDraft,
  shouldAdvanceHourField,
  snapMinute,
  time12hToHhmm,
} from '@/entities/medication/lib/time12h';

describe('time12h — isValidHhmm', () => {
  it('유효 경계', () => {
    expect(isValidHhmm('00:00')).toBe(true);
    expect(isValidHhmm('08:00')).toBe(true);
    expect(isValidHhmm('12:00')).toBe(true);
    expect(isValidHhmm('23:55')).toBe(true);
  });

  it('무효 포맷·범위', () => {
    expect(isValidHhmm('')).toBe(false);
    expect(isValidHhmm('8:0')).toBe(false);
    expect(isValidHhmm('24:00')).toBe(false);
    expect(isValidHhmm('12:60')).toBe(false);
    expect(isValidHhmm('ab:cd')).toBe(false);
    expect(isValidHhmm('7')).toBe(false);
    expect(isValidHhmm('25:99')).toBe(false);
    expect(isValidHhmm('12:5')).toBe(false);
  });
});

describe('time12h — isValidHour12 / isValidMinute', () => {
  it('시 1–12', () => {
    expect(isValidHour12(1)).toBe(true);
    expect(isValidHour12(12)).toBe(true);
    expect(isValidHour12(0)).toBe(false);
    expect(isValidHour12(13)).toBe(false);
    expect(isValidHour12(99)).toBe(false);
    expect(isValidHour12(NaN)).toBe(false);
  });

  it('분 0–59', () => {
    expect(isValidMinute(0)).toBe(true);
    expect(isValidMinute(59)).toBe(true);
    expect(isValidMinute(-1)).toBe(false);
    expect(isValidMinute(60)).toBe(false);
    expect(isValidMinute(99)).toBe(false);
    expect(isValidMinute(NaN)).toBe(false);
  });
});

describe('time12h — snapMinute', () => {
  const interval = LIMITS.doseMinuteInterval;

  it('interval 배수로 내림', () => {
    expect(snapMinute(0, interval)).toBe(0);
    expect(snapMinute(7, interval)).toBe(5);
    expect(snapMinute(59, interval)).toBe(55);
  });

  it('음수·NaN·잘못된 interval 가드', () => {
    expect(snapMinute(-1, interval)).toBe(0);
    expect(snapMinute(NaN, interval)).toBe(0);
    expect(snapMinute(7, 0)).toBe(0);
    expect(snapMinute(7, -5)).toBe(0);
  });
});

describe('time12h — hhmm ↔ 12h 왕복', () => {
  it('자정·정오·오후', () => {
    expect(hhmmToTime12h('00:00')).toEqual({
      hour12: 12,
      minute: 0,
      period: 'am',
    });
    expect(hhmmToTime12h('12:00')).toEqual({
      hour12: 12,
      minute: 0,
      period: 'pm',
    });
    expect(hhmmToTime12h('13:05')).toEqual({
      hour12: 1,
      minute: 5,
      period: 'pm',
    });
    expect(hhmmToTime12h('08:00')).toEqual({
      hour12: 8,
      minute: 0,
      period: 'am',
    });
  });

  it('12h → HH:MM', () => {
    expect(time12hToHhmm({ hour12: 12, minute: 0, period: 'am' })).toBe(
      '00:00',
    );
    expect(time12hToHhmm({ hour12: 12, minute: 0, period: 'pm' })).toBe(
      '12:00',
    );
    expect(time12hToHhmm({ hour12: 1, minute: 5, period: 'pm' })).toBe(
      '13:05',
    );
    expect(time12hToHhmm({ hour12: 8, minute: 0, period: 'am' })).toBe(
      '08:00',
    );
  });

  it('왕복 유지', () => {
    for (const hhmm of ['00:00', '08:00', '12:00', '13:05', '23:55'] as const) {
      const t = hhmmToTime12h(hhmm);
      expect(t).not.toBeNull();
      expect(time12hToHhmm(t!)).toBe(hhmm);
    }
  });

  it('무효 hhmm → null', () => {
    expect(hhmmToTime12h('')).toBeNull();
    expect(hhmmToTime12h('24:00')).toBeNull();
    expect(hhmmToTime12h('bad')).toBeNull();
  });
});

describe('time12h — parseDigitDraft / shouldAdvanceHourField', () => {
  it('숫자만·최대 2자리', () => {
    expect(parseDigitDraft('')).toBe('');
    expect(parseDigitDraft('12')).toBe('12');
    expect(parseDigitDraft('1a2b3')).toBe('12');
    expect(parseDigitDraft('99')).toBe('99');
  });

  it('시 필드 자동 이동', () => {
    expect(shouldAdvanceHourField('')).toBe(false);
    expect(shouldAdvanceHourField('1')).toBe(false);
    expect(shouldAdvanceHourField('0')).toBe(false);
    expect(shouldAdvanceHourField('2')).toBe(true);
    expect(shouldAdvanceHourField('9')).toBe(true);
    expect(shouldAdvanceHourField('12')).toBe(true);
    expect(shouldAdvanceHourField('07')).toBe(true);
  });
});

describe('time12h — coerceHour12Digits / coerceMinuteDigits', () => {
  it('시 >12 → 12 + overflow', () => {
    expect(coerceHour12Digits('12')).toEqual({ digits: '12', overflow: false });
    expect(coerceHour12Digits('13')).toEqual({ digits: '12', overflow: true });
    expect(coerceHour12Digits('99')).toEqual({ digits: '12', overflow: true });
    expect(coerceHour12Digits('1')).toEqual({ digits: '1', overflow: false });
  });

  it('분 >59 → 59 + overflow', () => {
    expect(coerceMinuteDigits('59')).toEqual({ digits: '59', overflow: false });
    expect(coerceMinuteDigits('60')).toEqual({ digits: '59', overflow: true });
    expect(coerceMinuteDigits('99')).toEqual({ digits: '59', overflow: true });
    expect(coerceMinuteDigits('5')).toEqual({ digits: '5', overflow: false });
  });
});

describe('time12h — normalizeDraft', () => {
  it('유효 draft → pad·snap HH:MM', () => {
    expect(
      normalizeDraft({
        hourDigits: '7',
        minuteDigits: '07',
        period: 'am',
      }),
    ).toBe('07:05');
    expect(
      normalizeDraft({
        hourDigits: '12',
        minuteDigits: '00',
        period: 'pm',
      }),
    ).toBe('12:00');
  });

  it('시/분 초과 → 상한 클램프 후 emit', () => {
    expect(
      normalizeDraft({
        hourDigits: '99',
        minuteDigits: '00',
        period: 'pm',
      }),
    ).toBe('12:00');

    expect(
      normalizeDraft({
        hourDigits: '12',
        minuteDigits: '99',
        period: 'pm',
      }),
    ).toBe('12:55');
  });

  it('빈값 → fallback', () => {
    expect(
      normalizeDraft({
        hourDigits: '',
        minuteDigits: '',
        period: 'am',
      }),
    ).toBe(LIMITS.defaultDoseTime);
  });

  it('fallback도 무효면 defaultDoseTime', () => {
    expect(
      normalizeDraft({
        hourDigits: '',
        minuteDigits: '',
        period: 'am',
        fallbackHhmm: 'bad',
      }),
    ).toBe(LIMITS.defaultDoseTime);
  });
});
