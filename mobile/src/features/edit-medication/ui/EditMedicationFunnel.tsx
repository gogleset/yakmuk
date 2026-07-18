import { useState } from 'react';
import { Alert, Text } from 'react-native';
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
import { COPY, ERRORS } from '@/shared/copy';
import { Card, FunnelShell, Input } from '@/shared/ui';

type Step = 0 | 1 | 2 | 3;

type Props = {
  medication: Medication;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

/** P4 약 수정 — FunnelShell full page */
export function EditMedicationFunnel({
  medication,
  onClose,
  onUpdated,
}: Props) {
  const parsed0 = parseDaysMask(medication.daysMask);
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState(medication.name);
  const [medTime, setMedTime] = useState(medication.scheduledTime);
  const [daysMode, setDaysMode] = useState<DaysMode>(parsed0.mode);
  const [weekdays, setWeekdays] = useState<number[]>(parsed0.days);

  const updateMut = useUpdateMedicationMutation({
    onSuccess: async () => {
      await onUpdated();
      onClose();
    },
  });

  const dirty =
    name.trim() !== medication.name ||
    medTime !== medication.scheduledTime ||
    formatDaysMask(daysMode, weekdays) !== medication.daysMask;

  const submit = () => {
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

  if (step === 0) {
    return (
      <FunnelShell
        stepIndex={0}
        stepCount={4}
        title="약 이름을 알려 주세요"
        ctaLabel="다음"
        ctaDisabled={!name.trim()}
        dirty={dirty}
        onClose={onClose}
        onCtaPress={() => setStep(1)}
      >
        <Input
          placeholder="약 이름"
          value={name}
          onChangeText={setName}
          autoFocus
        />
      </FunnelShell>
    );
  }

  if (step === 1) {
    return (
      <FunnelShell
        stepIndex={1}
        stepCount={4}
        title="몇 시에 먹나요?"
        ctaLabel="다음"
        dirty={dirty}
        onBack={() => setStep(0)}
        onClose={onClose}
        onCtaPress={() => setStep(2)}
      >
        <TimePicker value={medTime} onChange={setMedTime} />
      </FunnelShell>
    );
  }

  if (step === 2) {
    return (
      <FunnelShell
        stepIndex={2}
        stepCount={4}
        title="어느 요일에 먹나요?"
        ctaLabel="다음"
        ctaDisabled={!isValidDaysMask(daysMode, weekdays)}
        dirty={dirty}
        onBack={() => setStep(1)}
        onClose={onClose}
        onCtaPress={() => setStep(3)}
      >
        <DaysModeToggle value={daysMode} onChange={setDaysMode} />
        {daysMode === 'weekday' ? (
          <WeekdayPicker value={weekdays} onChange={setWeekdays} />
        ) : null}
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      stepIndex={3}
      stepCount={4}
      title="이 내용으로 저장할까요?"
      ctaLabel={updateMut.isPending ? '저장 중…' : '저장'}
      ctaLoading={updateMut.isPending}
      ctaDisabled={updateMut.isPending}
      dirty={dirty}
      onBack={() => setStep(2)}
      onClose={onClose}
      onCtaPress={submit}
    >
      <Card className="gap-1">
        <Text className="text-base font-bold text-brand">{name.trim()}</Text>
        <Text className="text-sm text-brand-muted">
          {medTime} ·{' '}
          {daysMode === 'daily'
            ? '매일'
            : weekdays.map((d) => ['월', '화', '수', '목', '금', '토', '일'][d]).join(', ')}
        </Text>
      </Card>
    </FunnelShell>
  );
}
