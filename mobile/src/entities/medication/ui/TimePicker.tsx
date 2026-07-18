import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  dateToHhmm,
  hhmmToDate,
} from '@/entities/medication/lib/daysMask';
import { LAYOUT, LIMITS } from '@/shared/config/theme';
import { Caption } from '@/shared/ui/primitives/Typography';

type Props = {
  value: string; // HH:MM
  onChange: (hhmm: string) => void;
  label?: string;
};

/** 먹는 시간 선택 (iOS 스피너 / Android 다이얼로그) */
export function TimePicker({ value, onChange, label = '먹는 시간' }: Props) {
  const [androidOpen, setAndroidOpen] = useState(false);
  const date = hhmmToDate(value);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setAndroidOpen(false);
      if (event.type !== 'set' || !selected) return;
      onChange(dateToHhmm(selected));
      return;
    }
    if (selected) onChange(dateToHhmm(selected));
  };

  return (
    <View className="gap-2">
      {label ? <Caption>{label}</Caption> : null}

      {Platform.OS === 'android' ? (
        <>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAndroidOpen(true)}
            className="rounded-[10px] bg-surface px-3.5 py-3.5"
          >
            <Text className="text-center text-2xl font-bold tracking-widest text-brand">
              {value}
            </Text>
          </Pressable>
          {androidOpen ? (
            <DateTimePicker
              value={date}
              mode="time"
              is24Hour
              display="default"
              onChange={handleChange}
            />
          ) : null}
        </>
      ) : (
        <View className="items-center overflow-hidden rounded-xl bg-surface">
          <DateTimePicker
            value={date}
            mode="time"
            display="spinner"
            minuteInterval={LIMITS.doseMinuteInterval}
            onChange={handleChange}
            style={{ height: LAYOUT.timePicker.wheelHeight, width: '100%' }}
          />
        </View>
      )}
    </View>
  );
}
