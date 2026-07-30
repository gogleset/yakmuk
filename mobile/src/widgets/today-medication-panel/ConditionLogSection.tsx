import { Pressable, Text, View } from 'react-native';
import type { ConditionValue } from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/entities/medication/lib/display';
import { cn } from '@/shared/lib/cn';
import { COPY } from '@/shared/copy';
import { Button, Input } from '@/shared/ui';

const CONDITIONS = (
  Object.entries(CONDITION_LABEL) as [ConditionValue, string][]
).map(([value, label]) => ({ value, label }));

type Props = {
  condition: ConditionValue;
  message: string;
  onConditionChange: (value: ConditionValue) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
};

/** 오늘 컨디션 — chips + 한마디 + 저장 (B/B'/C 공유) */
export function ConditionLogSection({
  condition,
  message,
  onConditionChange,
  onMessageChange,
  onSubmit,
}: Props) {
  return (
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
                selected ? 'bg-brand-soft' : 'bg-surface-soft',
              )}
            >
              <Text
                className={cn(
                  'text-sm font-semibold',
                  selected ? 'text-brand' : 'text-brand-muted',
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
        onPress={onSubmit}
      />
    </View>
  );
}
