import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import {
  formatDaysMask,
  isValidDaysMask,
  parseDaysMask,
  type DaysMode,
} from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';
import {
  DaysModeToggle,
  TimePicker,
  WeekdayPicker,
} from '@/entities/medication';
import { useUpdateMedicationMutation } from '@/features/edit-medication/model/useUpdateMedicationMutation';
import { LIMITS } from '@/shared/constants';
import { COPY, ERRORS } from '@/shared/copy';
import { Button, Input, PageSheet } from '@/shared/ui';

type Props = {
  visible: boolean;
  medication: Medication | null;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

/** 약 수정 — 퍼널 없이 이름·시간·주기 한 화면 */
export function EditMedicationSheet({
  visible,
  medication,
  onClose,
  onUpdated,
}: Props) {
  const [name, setName] = useState('');
  const [medTime, setMedTime] = useState<string>(LIMITS.defaultDoseTime);
  const [daysMode, setDaysMode] = useState<DaysMode>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);

  useEffect(() => {
    if (!visible || !medication) return;
    setName(medication.name);
    setMedTime(medication.scheduledTime);
    const parsed = parseDaysMask(medication.daysMask);
    setDaysMode(parsed.mode);
    setWeekdays(parsed.days);
  }, [visible, medication]);

  const updateMut = useUpdateMedicationMutation({
    onSuccess: async () => {
      await onUpdated();
      onClose();
    },
  });

  const submit = () => {
    if (!medication) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert(COPY.med.nameAlertTitle, ERRORS.med.nameRequired);
      return;
    }
    if (!isValidDaysMask(daysMode, weekdays)) {
      Alert.alert(COPY.med.weekdayAlertTitle, COPY.med.weekdayRequired);
      return;
    }
    updateMut.mutate({
      medicationId: medication.id,
      name: trimmedName,
      scheduledTime: medTime,
      daysMask: formatDaysMask(daysMode, weekdays),
    });
  };

  return (
    <PageSheet visible={visible} title="약 수정" onClose={onClose}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        <Input
          placeholder="약 이름"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <TimePicker value={medTime} onChange={setMedTime} />

        <DaysModeToggle value={daysMode} onChange={setDaysMode} />

        {daysMode === 'weekday' ? (
          <WeekdayPicker value={weekdays} onChange={setWeekdays} />
        ) : null}

        <Button
          label={updateMut.isPending ? '저장 중…' : '저장하기'}
          disabled={updateMut.isPending || !medication}
          onPress={submit}
        />
      </ScrollView>
    </PageSheet>
  );
}
