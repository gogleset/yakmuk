import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
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
  FunnelShell,
  Icons,
  Input,
} from '@/shared/ui';

type FunnelStep =
  | 'intro'
  | 'search'
  | 'manual'
  | 'mode'
  | 'times'
  | 'timesByDay'
  | 'days'
  | 'confirm'
  | 'done';

type Props = {
  userId: string | undefined;
  onClose: () => void;
  onAdded: () => void | Promise<void>;
};

const DEFAULT_TIMES: string[] = [LIMITS.defaultDoseTime];

const STEP_ORDER_SAME: FunnelStep[] = [
  'intro',
  'search',
  'mode',
  'times',
  'days',
  'confirm',
  'done',
];
const STEP_ORDER_PER: FunnelStep[] = [
  'intro',
  'search',
  'mode',
  'timesByDay',
  'confirm',
  'done',
];

/** P3 약 추가 — FunnelShell full page */
export function AddMedicationFunnel({ userId, onClose, onAdded }: Props) {
  const [step, setStep] = useState<FunnelStep>('intro');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<DrugSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DrugSearchItem | null>(null);
  const [manualName, setManualName] = useState('');

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('same');
  const [slotTimes, setSlotTimes] = useState<string[]>(DEFAULT_TIMES);
  const [daysMode, setDaysMode] = useState<DaysMode>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [timesByDay, setTimesByDay] = useState<Record<number, string[]>>({});

  const order = scheduleMode === 'same' ? STEP_ORDER_SAME : STEP_ORDER_PER;
  const stepIndex = Math.max(0, order.indexOf(step));
  // intro·done 제외한 입력 스텝 수 (progress)
  const progressCount = order.length - 2;
  const progressIndex = Math.max(0, stepIndex - 1);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim()),
      LIMITS.drugSearchDebounceMs,
    );
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (step !== 'search') return;
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
  }, [debouncedQuery, step]);

  const medName = (selected?.itemName ?? manualName).trim();

  const addMut = useAddMedicationMutation({
    onSuccess: async () => {
      setStep('done');
      await onAdded();
    },
  });

  const handleScheduleModeChange = (mode: ScheduleMode) => {
    if (mode === scheduleMode) return;
    setScheduleMode(mode);
    if (mode === 'perWeekday') {
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

  const submitAdd = () => {
    if (!userId) {
      Alert.alert(ERRORS.med.addFailed, ERRORS.auth.required);
      return;
    }
    if (!medName) {
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

    addMut.mutate({ userId, name: medName, slots });
  };

  const goBack = () => {
    if (step === 'manual') {
      setStep('search');
      return;
    }
    if (step === 'mode' && !selected && manualName) {
      setStep('manual');
      return;
    }
    const idx = order.indexOf(step);
    if (idx <= 0) {
      onClose();
      return;
    }
    setStep(order[idx - 1]!);
  };

  const dirty =
    !!query ||
    !!manualName ||
    !!selected ||
    slotTimes.length > 1 ||
    weekdays.length > 0;

  const scheduleSummary = useMemo(() => {
    if (scheduleMode === 'same') {
      const days =
        daysMode === 'daily'
          ? '매일'
          : weekdays.map((d) => `${WEEKDAY_LABELS[d]}`).join(', ');
      return `${slotTimes.join(', ')} · ${days}`;
    }
    return weekdays
      .map((d) => `${WEEKDAY_LABELS[d]} ${(timesByDay[d] ?? []).join(', ')}`)
      .join('\n');
  }, [scheduleMode, slotTimes, daysMode, weekdays, timesByDay]);

  // —— 스텝별 렌더 ——

  if (step === 'intro') {
    return (
      <FunnelShell
        stepIndex={0}
        stepCount={progressCount}
        title="약을 등록할까요?"
        kokiVariant="thinking"
        ctaLabel="시작하기"
        dirty={false}
        hideProgress
        onClose={onClose}
        onCtaPress={() => setStep('search')}
      >
        <Caption>이름과 일정을 한 단계씩 알려 주세요</Caption>
      </FunnelShell>
    );
  }

  if (step === 'done') {
    return (
      <FunnelShell
        stepIndex={progressCount - 1}
        stepCount={progressCount}
        title="등록했어요"
        kokiVariant="done"
        ctaLabel="확인"
        hideProgress
        onCtaPress={onClose}
      >
        <Text className="text-base text-brand-muted">{medName}</Text>
      </FunnelShell>
    );
  }

  if (step === 'search') {
    return (
      <FunnelShell
        stepIndex={progressIndex}
        stepCount={progressCount}
        title="어떤 약인가요?"
        ctaLabel="직접 입력"
        dirty={dirty}
        onBack={goBack}
        onClose={onClose}
        onCtaPress={() => {
          setManualName(query.trim());
          setStep('manual');
        }}
      >
        <Input
          placeholder="약 이름 검색 (예: 타이레놀)"
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {searching ? (
          <View className="mt-4 items-center">
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : null}
        {searchError ? <EmptyHint message={searchError} /> : null}
        {!searching &&
        debouncedQuery.length >= LIMITS.drugSearchMinQueryLength &&
        results.length === 0 ? (
          <EmptyHint message="검색 결과가 없어요. 직접 입력해 보세요." />
        ) : null}
        <FlatList
          className="mt-2 max-h-80"
          data={results}
          keyExtractor={(item) => item.itemSeq}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelected(item);
                setManualName('');
                setStep('mode');
              }}
              className="mb-2 active:opacity-70"
            >
              <Card>
                <DrugSearchPreview item={item} variant="compact" />
              </Card>
            </Pressable>
          )}
        />
      </FunnelShell>
    );
  }

  if (step === 'manual') {
    return (
      <FunnelShell
        stepIndex={progressIndex}
        stepCount={progressCount}
        title="약 이름을 알려 주세요"
        ctaLabel="다음"
        ctaDisabled={!manualName.trim()}
        dirty={dirty}
        onBack={goBack}
        onClose={onClose}
        onCtaPress={() => {
          setSelected(null);
          setStep('mode');
        }}
      >
        <Input
          placeholder="예: 혈압약"
          value={manualName}
          onChangeText={setManualName}
          autoFocus
        />
      </FunnelShell>
    );
  }

  if (step === 'mode') {
    return (
      <FunnelShell
        stepIndex={progressIndex}
        stepCount={progressCount}
        title="일정이 매일 같나요?"
        ctaLabel="다음"
        dirty={dirty}
        onBack={goBack}
        onClose={onClose}
        onCtaPress={() =>
          setStep(scheduleMode === 'same' ? 'times' : 'timesByDay')
        }
      >
        <ScheduleModeToggle
          value={scheduleMode}
          onChange={handleScheduleModeChange}
        />
      </FunnelShell>
    );
  }

  if (step === 'times') {
    const timesErr = validateSameSchedule(slotTimes, 'daily', []);
    // 시간만 검증 — 요일은 다음 스텝
    const timesOk = slotTimes.length > 0 && slotTimes.every((t) => !!t);
    return (
      <FunnelShell
        stepIndex={progressIndex}
        stepCount={progressCount}
        title="몇 시에 먹나요?"
        ctaLabel="다음"
        ctaDisabled={!timesOk}
        dirty={dirty}
        onBack={goBack}
        onClose={onClose}
        onCtaPress={() => setStep('days')}
      >
        <TimeSlotList value={slotTimes} onChange={setSlotTimes} />
        {timesErr && slotTimes.length === 0 ? (
          <Caption>{scheduleValidationMessage(timesErr)}</Caption>
        ) : null}
      </FunnelShell>
    );
  }

  if (step === 'timesByDay') {
    const err = validatePerWeekdaySchedule(weekdays, timesByDay);
    return (
      <FunnelShell
        stepIndex={progressIndex}
        stepCount={progressCount}
        title="요일마다 시간을 알려주세요"
        ctaLabel="다음"
        ctaDisabled={!!err}
        dirty={dirty}
        onBack={goBack}
        onClose={onClose}
        onCtaPress={() => setStep('confirm')}
      >
        <WeekdayPicker value={weekdays} onChange={handleWeekdaysChange} />
        {weekdays.map((day) => (
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
        ))}
        {err ? <Caption>{scheduleValidationMessage(err)}</Caption> : null}
      </FunnelShell>
    );
  }

  if (step === 'days') {
    const err = validateSameSchedule(slotTimes, daysMode, weekdays);
    return (
      <FunnelShell
        stepIndex={progressIndex}
        stepCount={progressCount}
        title="어느 요일에 먹나요?"
        ctaLabel="다음"
        ctaDisabled={!!err}
        dirty={dirty}
        onBack={goBack}
        onClose={onClose}
        onCtaPress={() => setStep('confirm')}
      >
        <DaysModeToggle value={daysMode} onChange={setDaysMode} />
        {daysMode === 'weekday' ? (
          <WeekdayPicker value={weekdays} onChange={setWeekdays} />
        ) : null}
        {err ? <Caption>{scheduleValidationMessage(err)}</Caption> : null}
      </FunnelShell>
    );
  }

  // confirm
  return (
    <FunnelShell
      stepIndex={progressIndex}
      stepCount={progressCount}
      title="이 내용으로 등록할까요?"
      ctaLabel={addMut.isPending ? '추가 중…' : '저장'}
      ctaLoading={addMut.isPending}
      ctaDisabled={addMut.isPending}
      dirty={dirty}
      onBack={goBack}
      onClose={onClose}
      onCtaPress={submitAdd}
    >
      <Card className="gap-2">
        <Text className="text-base font-bold text-brand">{medName}</Text>
        <Text className="text-sm text-brand-muted">{scheduleSummary}</Text>
      </Card>
      <Button
        label="처음부터"
        variant="ghost"
        icon={Icons.Pill}
        onPress={() => {
          setSelected(null);
          setManualName('');
          setQuery('');
          setStep('search');
        }}
      />
    </FunnelShell>
  );
}
