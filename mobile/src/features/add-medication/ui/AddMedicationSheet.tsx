import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { searchDrugsByName } from '@/entities/medication/api/search-drugs';
import {
  expandPerWeekdaySchedule,
  expandSameSchedule,
  formatDaysMask,
  scheduleValidationMessage,
  validatePerWeekdaySchedule,
  validateSameSchedule,
  WEEKDAY_LABELS,
  type DaysMode,
} from '@/entities/medication/lib/daysMask';
import type { DrugSearchItem } from '@/entities/medication/model/types';
import {
  DaysModeToggle,
  ScheduleModeToggle,
  TimeSlotList,
  WeekdayPicker,
  type ScheduleMode,
} from '@/entities/medication';
import { useAddMedicationMutation } from '@/features/add-medication/model/useAddMedicationMutation';
import { DrugSearchPreview } from '@/features/add-medication/ui/DrugSearchPreview';
import { COLORS, LIMITS } from '@/shared/config/theme';
import { COPY, ERRORS } from '@/shared/copy';
import {
  Button,
  Caption,
  Card,
  EmptyHint,
  Icons,
  Input,
  PageSheet,
} from '@/shared/ui';

type Step = 'search' | 'schedule';

type Props = {
  visible: boolean;
  userId: string | undefined;
  onClose: () => void;
  onAdded: () => void | Promise<void>;
};

const DEFAULT_TIMES: string[] = [LIMITS.defaultDoseTime];

/** 약 추가: 검색/직접입력 → 같은일정 | 요일마다 → 배치 저장 */
export function AddMedicationSheet({
  visible,
  userId,
  onClose,
  onAdded,
}: Props) {
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<DrugSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DrugSearchItem | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('same');
  const [slotTimes, setSlotTimes] = useState<string[]>(DEFAULT_TIMES);
  const [daysMode, setDaysMode] = useState<DaysMode>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [timesByDay, setTimesByDay] = useState<Record<number, string[]>>({});

  const resetSchedule = () => {
    setScheduleMode('same');
    setSlotTimes(DEFAULT_TIMES);
    setDaysMode('daily');
    setWeekdays([]);
    setTimesByDay({});
  };

  useEffect(() => {
    if (visible) return;
    setStep('search');
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setSearching(false);
    setSearchError(null);
    setSelected(null);
    setManualMode(false);
    setManualName('');
    resetSchedule();
  }, [visible]);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim()),
      LIMITS.drugSearchDebounceMs,
    );
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!visible || manualMode || step !== 'search') return;
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
  }, [debouncedQuery, visible, manualMode, step]);

  const pickDrug = (item: DrugSearchItem) => {
    setSelected(item);
    setManualMode(false);
    setStep('schedule');
  };

  const goManualSchedule = () => {
    if (!manualName.trim()) {
      Alert.alert(COPY.med.nameAlertTitle, ERRORS.med.nameRequired);
      return;
    }
    setSelected(null);
    setStep('schedule');
  };

  const handleScheduleModeChange = (mode: ScheduleMode) => {
    if (mode === scheduleMode) return;
    setScheduleMode(mode);
    if (mode === 'perWeekday') {
      // same → perWeekday: 선택된 요일에 동일 타임 복제 (없으면 빈 상태)
      const seed = slotTimes.length > 0 ? slotTimes : DEFAULT_TIMES;
      setTimesByDay((prev) => {
        const next: Record<number, string[]> = { ...prev };
        for (const day of weekdays) {
          if (!next[day]?.length) next[day] = [...seed];
        }
        return next;
      });
    }
  };

  const handleWeekdaysChange = (days: number[]) => {
    setWeekdays(days);
    if (scheduleMode !== 'perWeekday') return;
    const seed = slotTimes.length > 0 ? slotTimes : DEFAULT_TIMES;
    setTimesByDay((prev) => {
      const next: Record<number, string[]> = {};
      for (const day of days) {
        next[day] = prev[day]?.length ? prev[day]! : [...seed];
      }
      return next;
    });
  };

  const addMut = useAddMedicationMutation({
    onSuccess: async () => {
      await onAdded();
      onClose();
    },
  });

  const submitAdd = () => {
    if (!userId) {
      Alert.alert(ERRORS.med.addFailed, ERRORS.auth.required);
      return;
    }
    const name = (selected?.itemName ?? manualName).trim();
    if (!name) {
      Alert.alert(COPY.med.nameAlertTitle, ERRORS.med.nameRequired);
      return;
    }

    let slots;
    if (scheduleMode === 'same') {
      const err = validateSameSchedule(slotTimes, daysMode, weekdays);
      if (err) {
        Alert.alert(COPY.med.scheduleAlertTitle, scheduleValidationMessage(err));
        return;
      }
      slots = expandSameSchedule(
        slotTimes,
        formatDaysMask(daysMode, weekdays),
      );
    } else {
      const err = validatePerWeekdaySchedule(weekdays, timesByDay);
      if (err) {
        Alert.alert(COPY.med.scheduleAlertTitle, scheduleValidationMessage(err));
        return;
      }
      slots = expandPerWeekdaySchedule(timesByDay);
    }

    if (slots.length === 0) {
      Alert.alert(COPY.med.scheduleAlertTitle, COPY.med.noScheduleToSave);
      return;
    }

    addMut.mutate({ userId, name, slots });
  };

  const title =
    step === 'search'
      ? manualMode
        ? '직접 입력'
        : '약 검색'
      : '복용 일정';

  return (
    <PageSheet visible={visible} title={title} onClose={onClose}>
      {step === 'search' && !manualMode ? (
        <View className="flex-1 px-5">
          <Input
            placeholder="약 이름 검색 (예: 타이레놀)"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />

          {searching ? (
            <View className="mt-6 items-center">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null}

          {searchError ? (
            <EmptyHint message={searchError} />
          ) : debouncedQuery.length >= LIMITS.drugSearchMinQueryLength &&
            !searching &&
            results.length === 0 ? (
            <EmptyHint message="검색 결과가 없어요. 직접 입력해 보세요." />
          ) : null}

          <FlatList
            className="mt-3 flex-1"
            data={results}
            keyExtractor={(item) => item.itemSeq}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={null}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => pickDrug(item)}
                className="mb-2 active:opacity-70"
              >
                <Card>
                  <DrugSearchPreview item={item} variant="compact" />
                </Card>
              </Pressable>
            )}
          />

          <View className="gap-2 pb-2 pt-3">
            <Button
              label="직접 입력"
              variant="outline"
              icon={Icons.Pill}
              onPress={() => {
                setManualMode(true);
                setManualName(query.trim());
              }}
            />
          </View>
        </View>
      ) : null}

      {step === 'search' && manualMode ? (
        <View className="gap-3 px-5">
          <Input
            placeholder="예: 혈압약"
            value={manualName}
            onChangeText={setManualName}
            autoFocus
          />
          <Button label="다음" onPress={goManualSchedule} />
          <Button
            label="검색으로 돌아가기"
            variant="ghost"
            onPress={() => setManualMode(false)}
          />
        </View>
      ) : null}

      {step === 'schedule' ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pb-6"
          keyboardShouldPersistTaps="handled"
        >
          {selected ? (
            <Card>
              <DrugSearchPreview item={selected} variant="detail" />
            </Card>
          ) : (
            <Card className="gap-1">
              <Text className="font-semibold text-brand">
                {manualName.trim()}
              </Text>
            </Card>
          )}

          <ScheduleModeToggle
            value={scheduleMode}
            onChange={handleScheduleModeChange}
          />

          {scheduleMode === 'same' ? (
            <>
              <TimeSlotList value={slotTimes} onChange={setSlotTimes} />
              <DaysModeToggle value={daysMode} onChange={setDaysMode} />
              {daysMode === 'weekday' ? (
                <WeekdayPicker value={weekdays} onChange={setWeekdays} />
              ) : null}
            </>
          ) : (
            <>
              <WeekdayPicker value={weekdays} onChange={handleWeekdaysChange} />
              {weekdays.length === 0 ? null : (
                weekdays.map((day) => (
                  <View key={day} className="gap-2">
                    <Caption>{WEEKDAY_LABELS[day]}요일</Caption>
                    <TimeSlotList
                      value={timesByDay[day] ?? DEFAULT_TIMES}
                      onChange={(times) =>
                        setTimesByDay((prev) => ({ ...prev, [day]: times }))
                      }
                      label=""
                    />
                  </View>
                ))
              )}
            </>
          )}

          <Button
            label={addMut.isPending ? '추가 중…' : '추가하기'}
            icon={Icons.Pill}
            disabled={addMut.isPending}
            onPress={submitAdd}
          />
          <Button
            label="다시 고르기"
            variant="ghost"
            onPress={() => setStep('search')}
          />
        </ScrollView>
      ) : null}
    </PageSheet>
  );
}
