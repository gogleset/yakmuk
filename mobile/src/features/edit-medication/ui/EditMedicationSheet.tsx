import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import {
  expandScheduleDraft,
  isSameScheduleDraft,
  medsToScheduleDraft,
} from '@/entities/medication/lib/scheduleDraft';
import {
  scheduleValidationMessage,
  validatePerWeekdaySchedule,
  validateSameSchedule,
} from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';
import { useReplaceMedicationScheduleMutation } from '@/features/edit-medication/model/useReplaceMedicationScheduleMutation';
import {
  MedicationScheduleFields,
  useMedicationScheduleDraftState,
} from '@/features/medication-schedule-form';
import { COPY, ERRORS } from '@/shared/copy';
import {
  BottomSheet,
  Button,
  Input,
  KokiIllustration,
} from '@/shared/ui';

type Props = {
  userId: string;
  medications: Medication[];
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

/** 약 수정 — BottomSheet, 진입 시 전체 섹션 펼침 + prefill */
export function EditMedicationSheet({
  userId,
  medications,
  onClose,
  onUpdated,
}: Props) {
  const initialDraft = useMemo(
    () => medsToScheduleDraft(medications),
    [medications],
  );
  const initialName = medications[0]?.name ?? '';

  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [name, setName] = useState(initialName);

  const {
    draft,
    setDraft,
    handleScheduleModeChange,
    handleWeekdaysChange,
    handleDaysModeChange,
  } = useMedicationScheduleDraftState(initialDraft);

  const medName = name.trim();
  const dirty =
    medName !== initialName || !isSameScheduleDraft(draft, initialDraft);

  const scheduleValid = (() => {
    if (!medName) return false;
    if (draft.scheduleMode === 'same') {
      return !validateSameSchedule(
        draft.slotTimes,
        draft.daysMode,
        draft.weekdays,
      );
    }
    return !validatePerWeekdaySchedule(draft.weekdays, draft.timesByDay);
  })();

  const replaceMut = useReplaceMedicationScheduleMutation({
    onSuccess: async () => {
      setDone(true);
      await onUpdated();
    },
  });

  const requestClose = () => {
    if (done || !dirty) {
      setVisible(false);
      return;
    }
    Alert.alert('작성을 그만둘까요?', '입력한 내용이 사라져요.', [
      { text: '계속 작성', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => setVisible(false),
      },
    ]);
  };

  const submit = () => {
    if (!medName) {
      Alert.alert(COPY.med.nameAlertTitle, ERRORS.med.nameRequired);
      return;
    }

    if (draft.scheduleMode === 'same') {
      const err = validateSameSchedule(
        draft.slotTimes,
        draft.daysMode,
        draft.weekdays,
      );
      if (err) {
        Alert.alert(COPY.med.scheduleAlertTitle, scheduleValidationMessage(err));
        return;
      }
    } else {
      const err = validatePerWeekdaySchedule(draft.weekdays, draft.timesByDay);
      if (err) {
        Alert.alert(COPY.med.scheduleAlertTitle, scheduleValidationMessage(err));
        return;
      }
    }

    const slots = expandScheduleDraft(draft);
    if (slots.length === 0) {
      Alert.alert(COPY.med.scheduleAlertTitle, COPY.med.noScheduleToSave);
      return;
    }

    replaceMut.mutate({
      userId,
      replaceMedicationIds: medications.map((med) => med.id),
      name: medName,
      slots,
    });
  };

  if (done) {
    return (
      <BottomSheet
        visible={visible}
        title="저장했어요"
        presentation="overlay"
        onClose={requestClose}
        onClosed={onClose}
        footer={<Button label="확인" onPress={requestClose} />}
      >
        <View className="items-center gap-3 py-2">
          <KokiIllustration variant="done" />
          <Text className="text-base text-brand-muted">{medName}</Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      title="약 수정"
      presentation="overlay"
      onClose={requestClose}
      onClosed={onClose}
      footer={
        <Button
          label={replaceMut.isPending ? '저장 중…' : '저장'}
          disabled={!scheduleValid || replaceMut.isPending}
          onPress={submit}
        />
      }
    >
      <View className="gap-4">
        <Input
          tone="soft"
          placeholder="예: 혈압약"
          value={name}
          onChangeText={setName}
        />

        <MedicationScheduleFields
          mode="edit"
          nameConfirmed
          draft={draft}
          onDraftChange={setDraft}
          onScheduleModeChange={handleScheduleModeChange}
          onWeekdaysChange={handleWeekdaysChange}
          onDaysModeChange={handleDaysModeChange}
        />
      </View>
    </BottomSheet>
  );
}
