import { useMemo } from 'react';
import { Text, View } from 'react-native';
import type {
  ConditionValue,
  Medication,
} from '@/entities/medication/model/types';
import { groupMedsByScheduledTime } from '@/entities/medication/lib/timeSlots';
import { TimeSlotMedAccordion } from '@/entities/medication/ui/TimeSlotMedAccordion';
import { COPY } from '@/shared/copy';
import { KokiIllustration, RichEmptyState } from '@/shared/ui';
import { ConditionLogSection } from './ConditionLogSection';

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
  isError?: boolean;
  emptyMessage?: string;
  emptyHint?: string;
  /** F6 — 오늘 전부 완료 */
  allDone?: boolean;
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
  isError = false,
  emptyMessage,
  emptyHint,
  allDone = false,
}: Props) {
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

  // C — 등록은 있는데 오늘 스케줄 0
  if (meds.length === 0) {
    return (
      <View className="gap-3">
        <RichEmptyState
          layout="card"
          title={emptyMessage ?? COPY.med.emptyToday}
          message={emptyHint ?? COPY.med.emptyTodayHint}
          illustration={<KokiIllustration variant="thinking" size={88} />}
        />
        <ConditionLogSection
          condition={condition}
          message={message}
          onConditionChange={onConditionChange}
          onMessageChange={onMessageChange}
          onSubmit={onSubmitCondition}
        />
      </View>
    );
  }

  return (
    <View className="gap-3">
      {/* 인사 배너 — 진행=cheer / 완료(F6)=done + 제목 스왑 */}
      <View className="flex-row items-center gap-3 rounded-2xl bg-surface-soft px-4 py-4">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-lg font-bold leading-6 text-brand">
            {allDone ? COPY.med.checkPromptDone : COPY.med.checkPromptTitle}
          </Text>
        </View>
        <KokiIllustration variant={allDone ? 'done' : 'cheer'} size={88} />
      </View>

      <TimeSlotMedAccordion
        groups={accordionGroups}
        collapseMode={allDone ? 'all-collapsed' : 'incomplete-open'}
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

      <ConditionLogSection
        condition={condition}
        message={message}
        onConditionChange={onConditionChange}
        onMessageChange={onMessageChange}
        onSubmit={onSubmitCondition}
      />
    </View>
  );
}
