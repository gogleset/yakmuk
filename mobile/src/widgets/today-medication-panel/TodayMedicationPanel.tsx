import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import type {
  ConditionValue,
  Medication,
} from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/entities/medication/lib/display';
import { groupMedsByScheduledTime } from '@/entities/medication/lib/timeSlots';
import { TimeSlotMedAccordion } from '@/entities/medication/ui/TimeSlotMedAccordion';
import { cn } from '@/shared/lib/cn';
import { COPY } from '@/shared/copy';
import {
  Button,
  Icons,
  Input,
  KokiIllustration,
  RichEmptyState,
} from '@/shared/ui';

const CONDITIONS = (
  Object.entries(CONDITION_LABEL) as [ConditionValue, string][]
).map(([value, label]) => ({ value, label }));

type Props = {
  meds: Medication[];
  takenMedIds: Set<number>;
  condition: ConditionValue;
  message: string;
  onConditionChange: (value: ConditionValue) => void;
  onMessageChange: (value: string) => void;
  onToggle: (medId: number) => void;
  onDelete: (medId: number, name: string) => void;
  onSubmitCondition: () => void;
  onMarkAllTaken?: () => void;
  isError?: boolean;
  emptyMessage?: string;
  emptyHint?: string;
  onAddPress?: () => void;
  /** F6 — 오늘 전부 완료 */
  allDone?: boolean;
  markAllPending?: boolean;
};

/** 오늘 약 체크(시간대 그룹) + 컨디션(스크롤 아래) */
export function TodayMedicationPanel({
  meds,
  takenMedIds,
  condition,
  message,
  onConditionChange,
  onMessageChange,
  onToggle,
  onDelete,
  onSubmitCondition,
  onMarkAllTaken,
  isError = false,
  emptyMessage,
  emptyHint,
  onAddPress,
  allDone = false,
  markAllPending = false,
}: Props) {
  const hasNoMedsRegistered = !emptyMessage && meds.length === 0 && !isError;

  const accordionGroups = useMemo(() => {
    return groupMedsByScheduledTime(meds).map((group) => ({
      scheduledTime: group.scheduledTime,
      slot: group.slot,
      entries: group.meds.map((med) => ({
        key: String(med.id),
        name: med.name,
        scheduledTime: med.scheduledTime,
        taken: takenMedIds.has(med.id),
      })),
    }));
  }, [meds, takenMedIds]);

  if (isError) {
    return (
      <RichEmptyState
        title={COPY.med.loadFailed}
        message={COPY.common.retryLater}
        illustration={<KokiIllustration variant="thinking" size={96} />}
      />
    );
  }

  if (hasNoMedsRegistered) {
    return (
      <RichEmptyState
        layout="card"
        title={COPY.med.emptyRegistered}
        message={COPY.med.emptyRegisteredHint}
        illustration={<KokiIllustration variant="thinking" size={88} />}
        ctaLabel={COPY.med.emptyRegisteredCta}
        onCtaPress={onAddPress}
      />
    );
  }

  if (meds.length === 0) {
    return (
      <View className="gap-3">
        <View className="flex-row items-center gap-3 rounded-2xl bg-surface-soft px-4 py-4">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-lg font-bold leading-6 text-brand">
              {COPY.med.checkPromptTitle}
            </Text>
            <Text className="text-sm text-brand-muted">
              {emptyMessage ?? COPY.med.emptyToday}
            </Text>
          </View>
          <KokiIllustration variant="thinking" size={88} />
        </View>

        {emptyHint ? (
          <Text className="px-1 text-sm text-brand-muted">{emptyHint}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-3">
      {/* 인사 배너 — F6는 done 컷 */}
      <View className="flex-row items-center gap-3 rounded-2xl bg-surface-soft px-4 py-4">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-lg font-bold leading-6 text-brand">
            {COPY.med.checkPromptTitle}
          </Text>
          {allDone ? (
            <Text className="text-sm text-brand-muted">
              {COPY.med.checkPromptDone}
            </Text>
          ) : null}
        </View>
        <KokiIllustration variant={allDone ? 'done' : 'cheer'} size={88} />
      </View>

      <TimeSlotMedAccordion
        groups={accordionGroups}
        onToggleKey={(key) => {
          const id = Number(key);
          if (!Number.isFinite(id)) return;
          onToggle(id);
        }}
        onLongPressKey={(key, name) => {
          const id = Number(key);
          if (!Number.isFinite(id)) return;
          onDelete(id, name);
        }}
      />

      {onMarkAllTaken && !allDone ? (
        <Button
          label={COPY.med.markAllTaken}
          onPress={onMarkAllTaken}
          disabled={markAllPending}
          className="rounded-full"
        />
      ) : null}

      {/* 컨디션 — 목업 1st viewport 밖 secondary */}
      <View className="mt-2 gap-2">
        <Text className="text-sm font-semibold text-brand">
          {COPY.condition.prompt}
        </Text>
        <View className="flex-row gap-2">
          {CONDITIONS.map((c) => {
            const selected = condition === c.value;
            return (
              <Pressable
                key={c.value}
                accessibilityRole="button"
                onPress={() => onConditionChange(c.value)}
                className={cn(
                  'flex-1 items-center rounded-xl py-3',
                  selected ? 'bg-brand' : 'bg-surface-soft',
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    selected ? 'text-ink' : 'text-brand',
                  )}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Input
          value={message}
          onChangeText={onMessageChange}
          placeholder={COPY.condition.messagePlaceholder}
        />
        <Button
          label={COPY.condition.submit}
          variant="secondary"
          icon={Icons.Heart}
          onPress={onSubmitCondition}
        />
      </View>
    </View>
  );
}
