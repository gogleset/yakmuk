import { useMemo } from 'react';
import { View } from 'react-native';
import type {
  ConditionValue,
  Medication,
} from '@/entities/medication/model/types';
import { groupMedsByScheduledTime } from '@/entities/medication/lib/timeSlots';
import { TimeSlotMedAccordion } from '@/entities/medication';
import { COPY } from '@/shared/copy';
import { KokiIllustration, RichEmptyState } from '@/shared/ui';
import { ConditionLogSection } from './ConditionLogSection';
import { TodayGreetingBanner } from './TodayGreetingBanner';

type Props = {
  meds: Medication[];
  takenMedIds: Set<number>;
  condition: ConditionValue;
  message: string;
  onConditionChange: (value: ConditionValue) => void;
  onMessageChange: (value: string) => void;
  onToggle: (medId: number) => void;
  onOpenDetail: (medId: number) => void;
  onDelete: (medId: number, name: string) => void;
  onSubmitCondition: () => void;
  isError?: boolean;
  emptyMessage?: string;
  emptyHint?: string;
  /** F6 — 오늘 전부 완료 */
  allDone?: boolean;
  /** 오늘 이미 남긴 컨디션 — 배너 슬라이드 2페이지 */
  savedCondition?: ConditionValue | null;
  savedMessage?: string | null;
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
  onOpenDetail,
  onDelete,
  onSubmitCondition,
  isError = false,
  emptyMessage,
  emptyHint,
  allDone = false,
  savedCondition = null,
  savedMessage = null,
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
        color: med.color,
        doseAmount: med.doseAmount,
        doseUnit: med.doseUnit,
      })),
    }));
  }, [meds, takenMedIds]);

  const conditionForm = !savedCondition ? (
    <ConditionLogSection
      condition={condition}
      message={message}
      onConditionChange={onConditionChange}
      onMessageChange={onMessageChange}
      onSubmit={onSubmitCondition}
    />
  ) : null;

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
        {savedCondition ? (
          <TodayGreetingBanner
            allDone={false}
            savedCondition={savedCondition}
            savedMessage={savedMessage}
          />
        ) : null}
        <RichEmptyState
          layout="card"
          title={emptyMessage ?? COPY.med.emptyToday}
          message={emptyHint ?? COPY.med.emptyTodayHint}
          illustration={<KokiIllustration variant="thinking" size={88} />}
        />
        {conditionForm}
      </View>
    );
  }

  return (
    <View className="gap-3">
      <TodayGreetingBanner
        allDone={allDone}
        savedCondition={savedCondition}
        savedMessage={savedMessage}
      />

      <TimeSlotMedAccordion
        groups={accordionGroups}
        collapseMode="incomplete-open"
        onToggleKey={(key) => {
          const id = Number(key);
          if (!Number.isFinite(id)) return;
          onToggle(id);
        }}
        onPressKey={(key) => {
          const id = Number(key);
          if (!Number.isFinite(id)) return;
          onOpenDetail(id);
        }}
        onLongPressKey={(key, name) => {
          const id = Number(key);
          if (!Number.isFinite(id)) return;
          onDelete(id, name);
        }}
      />

      {conditionForm}
    </View>
  );
}
