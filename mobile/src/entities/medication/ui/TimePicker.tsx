import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInput as TextInputRef,
} from 'react-native';
import {
  coerceHour12Digits,
  coerceMinuteDigits,
  hhmmToTime12h,
  normalizeDraft,
  padHour12,
  padMinute,
  shouldAdvanceHourField,
  type Period,
} from '@/entities/medication/lib/time12h';
import type { ControlTone } from '@/entities/medication/ui/ScheduleModeToggle';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import { LabelSm } from '@/shared/ui';

type Props = {
  value: string; // HH:MM
  onChange: (hhmm: string) => void;
  tone?: ControlTone;
};

type Field = 'hour' | 'minute';

const OVERFLOW_BORDER_MS = 700;

function resolveTime12h(hhmm: string) {
  return (
    hhmmToTime12h(hhmm) ??
    hhmmToTime12h(LIMITS.defaultDoseTime) ?? {
      hour12: 8,
      minute: 0,
      period: 'am' as Period,
    }
  );
}

/** 키보드형 12시간제 타임피커 (시·분 + 오전/오후) */
export function TimePicker({ value, onChange, tone = 'default' }: Props) {
  const initial = resolveTime12h(value);
  const [hourDigits, setHourDigits] = useState(padHour12(initial.hour12));
  const [minuteDigits, setMinuteDigits] = useState(padMinute(initial.minute));
  const [period, setPeriod] = useState<Period>(initial.period);
  const [focused, setFocused] = useState<Field | null>(null);
  const [overflowField, setOverflowField] = useState<Field | null>(null);

  const hourRef = useRef<TextInputRef>(null);
  const minuteRef = useRef<TextInputRef>(null);
  const hourDigitsRef = useRef(hourDigits);
  const minuteDigitsRef = useRef(minuteDigits);
  const periodRef = useRef(period);
  const valueRef = useRef(value);
  const lastEmittedRef = useRef(value);
  const overflowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const idleFill = tone === 'soft' ? 'bg-brand-soft' : 'bg-surface-soft';
  const labels = COPY.med.timePicker;

  hourDigitsRef.current = hourDigits;
  minuteDigitsRef.current = minuteDigits;
  periodRef.current = period;
  valueRef.current = value;

  useEffect(() => {
    return () => {
      if (overflowTimerRef.current) clearTimeout(overflowTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const next = resolveTime12h(value);
    setHourDigits(padHour12(next.hour12));
    setMinuteDigits(padMinute(next.minute));
    setPeriod(next.period);
    lastEmittedRef.current = value;
  }, [value]);

  const flashOverflow = (field: Field) => {
    setOverflowField(field);
    if (overflowTimerRef.current) clearTimeout(overflowTimerRef.current);
    overflowTimerRef.current = setTimeout(() => {
      setOverflowField(null);
      overflowTimerRef.current = null;
    }, OVERFLOW_BORDER_MS);
  };

  const emit = (hhmm: string) => {
    lastEmittedRef.current = hhmm;
    if (hhmm !== valueRef.current) onChange(hhmm);
  };

  const commit = (
    nextHour: string,
    nextMinute: string,
    nextPeriod: Period,
  ) => {
    const hour = coerceHour12Digits(nextHour);
    const minute = coerceMinuteDigits(nextMinute);
    if (hour.overflow) flashOverflow('hour');
    if (minute.overflow) flashOverflow('minute');

    const hhmm = normalizeDraft({
      hourDigits: hour.digits,
      minuteDigits: minute.digits,
      period: nextPeriod,
      fallbackHhmm: valueRef.current,
    });
    const normalized = resolveTime12h(hhmm);
    setHourDigits(padHour12(normalized.hour12));
    setMinuteDigits(padMinute(normalized.minute));
    setPeriod(normalized.period);
    emit(hhmm);
  };

  const onHourChange = (raw: string) => {
    const coerced = coerceHour12Digits(raw);
    hourDigitsRef.current = coerced.digits;
    setHourDigits(coerced.digits);
    if (coerced.overflow) flashOverflow('hour');
    if (shouldAdvanceHourField(coerced.digits)) {
      minuteRef.current?.focus();
    }
  };

  const onMinuteChange = (raw: string) => {
    const coerced = coerceMinuteDigits(raw);
    minuteDigitsRef.current = coerced.digits;
    setMinuteDigits(coerced.digits);
    if (coerced.overflow) flashOverflow('minute');
  };

  const onPeriodPress = (next: Period) => {
    if (next === periodRef.current) return;
    periodRef.current = next;
    setPeriod(next);
    commit(hourDigitsRef.current, minuteDigitsRef.current, next);
  };

  const borderColor = (field: Field) => {
    if (overflowField === field) return COLORS.destructive;
    if (focused === field) return COLORS.brand;
    return 'transparent';
  };

  const boxClass = (field: Field) => {
    const on = focused === field;
    return cn(
      'flex-1 items-center justify-center rounded-[10px]',
      on ? 'bg-brand-soft' : idleFill,
    );
  };

  const digitColor = (field: Field) => {
    if (overflowField === field) return COLORS.destructive;
    return focused === field ? COLORS.brand : COLORS.text;
  };

  return (
    <View className="w-full flex-row items-center gap-2">
      {/* 시 — 부모 가로 균등 분할 */}
      <View
        style={{
          height: LAYOUT.timePicker.boxHeight,
          borderWidth: 1,
          borderColor: borderColor('hour'),
        }}
        className={boxClass('hour')}
      >
        <TextInput
          ref={hourRef}
          value={hourDigits}
          onChangeText={onHourChange}
          onFocus={() => setFocused('hour')}
          onBlur={() => {
            setFocused(null);
            commit(
              hourDigitsRef.current,
              minuteDigitsRef.current,
              periodRef.current,
            );
          }}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
          accessibilityLabel={labels.hour}
          className="w-full text-center text-3xl font-bold"
          style={{ color: digitColor('hour') }}
        />
      </View>

      <Text
        className="text-3xl font-bold text-text"
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        :
      </Text>

      {/* 분 */}
      <View
        style={{
          height: LAYOUT.timePicker.boxHeight,
          borderWidth: 1,
          borderColor: borderColor('minute'),
        }}
        className={boxClass('minute')}
      >
        <TextInput
          ref={minuteRef}
          value={minuteDigits}
          onChangeText={onMinuteChange}
          onFocus={() => setFocused('minute')}
          onBlur={() => {
            setFocused(null);
            commit(
              hourDigitsRef.current,
              minuteDigitsRef.current,
              periodRef.current,
            );
          }}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
          accessibilityLabel={labels.minute}
          className="w-full text-center text-3xl font-bold"
          style={{ color: digitColor('minute') }}
        />
      </View>

      {/* 오전 / 오후 */}
      <View
        style={{
          width: LAYOUT.timePicker.periodWidth,
          height: LAYOUT.timePicker.boxHeight,
        }}
        className="overflow-hidden rounded-[10px]"
      >
        {(
          [
            { key: 'am' as const, label: labels.am },
            { key: 'pm' as const, label: labels.pm },
          ] as const
        ).map((opt, index) => {
          const on = period === opt.key;
          return (
            <Pressable
              key={opt.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={opt.label}
              onPress={() => onPeriodPress(opt.key)}
              style={{ height: LAYOUT.timePicker.boxHeight / 2 }}
              className={cn(
                'items-center justify-center',
                on ? 'bg-brand-soft' : idleFill,
                index === 0 && 'border-b border-line',
              )}
            >
              <LabelSm tone={on ? 'brand' : 'muted'}>{opt.label}</LabelSm>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
