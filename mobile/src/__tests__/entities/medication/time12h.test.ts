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
    expect(hhmmToTime12h('15:30')).toEqual({
      hour12: 3,
      minute: 30,
      period: 'pm',
    });
    expect(time12hToHhmm({ hour12: 12, minute: 0, period: 'am' })).toBe(
      '00:00',
    );
    expect(time12hToHhmm({ hour12: 12, minute: 0, period: 'pm' })).toBe(
      '12:00',
    );
    expect(time12hToHhmm({ hour12: 3, minute: 30, period: 'pm' })).toBe(
      '15:30',
    );
  });
});

describe('time12h — parseDigitDraft / shouldAdvanceHourField', () => {
  it('숫자만 2자리', () => {
    expect(parseDigitDraft('a1b2c3')).toBe('12');
    expect(parseDigitDraft('7')).toBe('7');
  });

  it('시 필드 자동 이동', () => {
    expect(shouldAdvanceHourField('1')).toBe(false);
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
  it('유효 draft → HH:MM (분 스냅 없음)', () => {
    expect(
      normalizeDraft({
        hourDigits: '7',
        minuteDigits: '07',
        period: 'am',
      }),
    ).toBe('07:07');
    expect(
      normalizeDraft({
        hourDigits: '8',
        minuteDigits: '27',
        period: 'am',
      }),
    ).toBe('08:27');
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
    ).toBe('12:59');
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
        minuteDigits: '00',
        period: 'am',
        fallbackHhmm: 'xx',
      }),
    ).toBe(LIMITS.defaultDoseTime);
  });
});
