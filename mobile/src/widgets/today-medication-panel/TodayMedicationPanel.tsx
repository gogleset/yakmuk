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
  isError?: boolean;
  emptyMessage?: string;
  onAddPress?: () => void;
  progressLabel?: string;
  /** F6 — 오늘 전부 완료 */
  allDone?: boolean;
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
  allDone = false,
}: Props) {
  const hasNoMedsRegistered = !emptyMessage && meds.length === 0 && !isError;

  return (
    <View className="gap-2.5">
      {allDone && meds.length > 0 ? (
        <View className="items-center gap-1 py-2">
          <KokiIllustration variant="done" size={100} />
          {progressLabel ? (
            <Text className="text-sm font-semibold text-brand">
              {progressLabel}
            </Text>
          ) : null}
        </View>
      ) : progressLabel ? (
        <Text className="text-sm font-semibold text-brand">{progressLabel}</Text>
      ) : null}

      {isError ? (
        <RichEmptyState
          title={COPY.med.loadFailed}
          message={COPY.common.retryLater}
          illustration={<KokiIllustration variant="thinking" size={96} />}
        />
      ) : hasNoMedsRegistered ? (
        <RichEmptyState
          title={COPY.med.emptyRegistered}
          message={COPY.med.emptyRegisteredHint}
          illustration={<KokiIllustration variant="thinking" size={96} />}
          ctaLabel={COPY.med.emptyRegisteredCta}
          onCtaPress={onAddPress}
        />
      ) : meds.length === 0 ? (
        <RichEmptyState
          title={emptyMessage ?? COPY.med.emptyToday}
          illustration={<KokiIllustration variant="thinking" size={96} />}
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
