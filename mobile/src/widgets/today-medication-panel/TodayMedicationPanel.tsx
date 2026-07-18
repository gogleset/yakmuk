import { Pressable, Text, View } from 'react-native';
import type { ConditionValue, Medication } from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/entities/medication/lib/display';
import { MedRow } from '@/entities/medication/ui/MedRow';
import { cn } from '@/shared/lib/cn';
import { COPY } from '@/shared/copy';
import {
  Button,
  Icons,
  Input,
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
  /** 목록 조회 실패 시 안내 */
  isError?: boolean;
  /** 등록은 있으나 오늘 스케줄 없음 */
  emptyMessage?: string;
  /** 약 0개일 때 CTA */
  onAddPress?: () => void;
  /** 캘린더 아래 진행 한 줄 */
  progressLabel?: string;
};

/** 오늘 약 체크 + 컨디션 입력 */
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
  onAddPress,
  progressLabel,
}: Props) {
  const hasNoMedsRegistered = !emptyMessage && meds.length === 0 && !isError;

  return (
    <View className="gap-2.5">
      {progressLabel ? (
        <Text className="text-sm font-semibold text-brand">{progressLabel}</Text>
      ) : null}

      {isError ? (
        <RichEmptyState
          title={COPY.med.loadFailed}
          message={COPY.common.retryLater}
          icon={Icons.Pill}
        />
      ) : hasNoMedsRegistered ? (
        <RichEmptyState
          title={COPY.med.emptyRegistered}
          message={COPY.med.emptyRegisteredHint}
          icon={Icons.Pill}
          ctaLabel={COPY.med.emptyRegisteredCta}
          onCtaPress={onAddPress}
        />
      ) : meds.length === 0 ? (
        <RichEmptyState
          title={emptyMessage ?? COPY.med.emptyToday}
          icon={Icons.Pill}
        />
      ) : (
        meds.map((med) => (
          <MedRow
            key={med.id}
            name={med.name}
            scheduledTime={med.scheduledTime}
            daysMask={med.daysMask}
            taken={takenMedIds.has(med.id)}
            onPress={() => onToggle(med.id)}
            onLongPress={() => onDelete(med.id, med.name)}
          />
        ))
      )}

      <View className="mt-1 gap-2">
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
                accessibilityState={{ selected }}
                onPress={() => onConditionChange(c.value)}
                className={cn(
                  'flex-1 items-center rounded-xl py-3',
                  selected ? 'bg-brand' : 'bg-surface',
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
          placeholder={COPY.condition.messagePlaceholder}
          value={message}
          onChangeText={onMessageChange}
        />
        <Button
          label={COPY.condition.submit}
          icon={Icons.Heart}
          onPress={onSubmitCondition}
        />
      </View>
    </View>
  );
}
