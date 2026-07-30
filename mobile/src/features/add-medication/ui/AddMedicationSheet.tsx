import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { searchDrugsByName } from '@/entities/medication/api/search-drugs';
import { expandScheduleDraft } from '@/entities/medication/lib/scheduleDraft';
import {
  scheduleValidationMessage,
  validatePerWeekdaySchedule,
  validateSameSchedule,
} from '@/entities/medication/lib/daysMask';
import type { DrugSearchItem } from '@/entities/medication/model/types';
import { useAddMedicationMutation } from '@/features/add-medication/model/useAddMedicationMutation';
import { DrugSearchPreview } from '@/features/add-medication/ui/DrugSearchPreview';
import {
  collapseOnNameCleared,
  MedicationScheduleFields,
  resolveFormVisibility,
  useMedicationScheduleDraftState,
} from '@/features/medication-schedule-form';
import { COLORS, LIMITS } from '@/shared/config/theme';
import { COPY, ERRORS } from '@/shared/copy';
import {
  BottomSheet,
  Button,
  Card,
  EmptyHint,
  Input,
  KokiIllustration,
} from '@/shared/ui';

type Props = {
  userId: string | undefined;
  onClose: () => void;
  onAdded: () => void | Promise<void>;
};

/** 약 추가 — BottomSheet progressive disclosure */
export function AddMedicationSheet({ userId, onClose, onAdded }: Props) {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [nameConfirmed, setNameConfirmed] = useState(false);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<DrugSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DrugSearchItem | null>(null);
  const [typedName, setTypedName] = useState('');

  const {
    draft,
    setDraft,
    handleScheduleModeChange,
    handleWeekdaysChange,
    handleDaysModeChange,
  } = useMedicationScheduleDraftState();

  const medName = (selected?.itemName ?? typedName).trim();
  const vis = resolveFormVisibility({
    mode: 'create',
    nameConfirmed,
    draft,
  });

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim()),
      LIMITS.drugSearchDebounceMs,
    );
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (nameConfirmed) return;
    if (debouncedQuery.length < LIMITS.drugSearchMinQueryLength) {
      setResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    setSearchError(null);

    void searchDrugsByName(debouncedQuery)
      .then((res) => {
        if (cancelled) return;
        setResults(res.items);
      })
      .catch((e) => {
        if (cancelled) return;
        setResults([]);
        setSearchError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, nameConfirmed]);

  const addMut = useAddMedicationMutation({
    onSuccess: async () => {
      setDone(true);
      await onAdded();
    },
  });

  const dirty =
    !!query ||
    !!typedName ||
    !!selected ||
    draft.slotTimes.length > 1 ||
    draft.weekdays.length > 0;

  const scheduleValid = (() => {
    if (!nameConfirmed || !medName) return false;
    if (draft.scheduleMode === 'same') {
      return !validateSameSchedule(
        draft.slotTimes,
        draft.daysMode,
        draft.weekdays,
      );
    }
    return !validatePerWeekdaySchedule(draft.weekdays, draft.timesByDay);
  })();

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

  const confirmNameFromSearch = (item: DrugSearchItem) => {
    setSelected(item);
    setTypedName('');
    setNameConfirmed(true);
  };

  /** 검색 결과 없이 입력한 이름으로 확정 */
  const confirmNameFromQuery = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSelected(null);
    setTypedName(trimmed);
    setNameConfirmed(true);
  };

  const clearName = () => {
    const collapsed = collapseOnNameCleared(draft);
    setNameConfirmed(collapsed.nameConfirmed);
    setDraft(collapsed.draft);
    setSelected(null);
    setTypedName('');
    setQuery('');
    setResults([]);
  };

  const submitAdd = () => {
    if (!userId) {
      Alert.alert(ERRORS.med.addFailed, ERRORS.auth.required);
      return;
    }
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

    addMut.mutate({ userId, name: medName, slots });
  };

  if (done) {
    return (
      <BottomSheet
        visible={visible}
        title="등록했어요"
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

  const searchingName = !nameConfirmed;

  return (
    <BottomSheet
      visible={visible}
      title="약 등록"
      presentation="overlay"
      onClose={requestClose}
      onClosed={onClose}
      header={
        searchingName ? (
          <Input
            tone="soft"
            placeholder="어떤 약인가요?"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={confirmNameFromQuery}
          />
        ) : undefined
      }
      footer={
        vis.showSubmit ? (
          <Button
            label={addMut.isPending ? '추가 중…' : '등록하기'}
            disabled={!scheduleValid || addMut.isPending}
            onPress={submitAdd}
          />
        ) : searchingName ? (
          <Button
            label="확인"
            disabled={!query.trim()}
            onPress={confirmNameFromQuery}
          />
        ) : null
      }
    >
      {searchingName ? (
        <View className="gap-2">
          {searching ? (
            <View className="items-center py-2">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null}
          {searchError ? <EmptyHint message={searchError} /> : null}
          {!searching &&
          debouncedQuery.length >= LIMITS.drugSearchMinQueryLength &&
          results.length === 0 ? (
            <EmptyHint message="검색 결과가 없어요." />
          ) : null}
          {results.map((item) => (
            <Pressable
              key={item.itemSeq}
              onPress={() => confirmNameFromSearch(item)}
              className="active:opacity-70"
            >
              <Card>
                <DrugSearchPreview item={item} variant="compact" />
              </Card>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="gap-4">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              className="flex-1 text-base font-semibold text-brand"
              numberOfLines={2}
            >
              {medName}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="약 이름 다시 선택"
              onPress={clearName}
              className="rounded-xl bg-surface-soft px-3 py-2 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-brand">변경</Text>
            </Pressable>
          </View>

          <MedicationScheduleFields
            mode="create"
            nameConfirmed={nameConfirmed}
            draft={draft}
            onDraftChange={setDraft}
            onScheduleModeChange={handleScheduleModeChange}
            onWeekdaysChange={handleWeekdaysChange}
            onDaysModeChange={handleDaysModeChange}
          />
        </View>
      )}
    </BottomSheet>
  );
}
