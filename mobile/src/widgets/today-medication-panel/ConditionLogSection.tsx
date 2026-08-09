import { Pressable, View } from 'react-native';
import type { ConditionValue } from '@/entities/medication/model/types';
import { CONDITION_LABEL } from '@/entities/medication/lib/display';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { COPY } from '@/shared/copy';
import {
  Button,
  Input,
  KokiIllustration,
  LabelSm,
  type KokiVariant,
} from '@/shared/ui';

type ConditionOption = {
  value: ConditionValue;
  label: string;
  koki: KokiVariant;
};

const CONDITIONS: ConditionOption[] = [
  { value: 'GOOD', label: CONDITION_LABEL.GOOD, koki: 'happy' },
  { value: 'NORMAL', label: CONDITION_LABEL.NORMAL, koki: 'thinking' },
  { value: 'BAD', label: CONDITION_LABEL.BAD, koki: 'worried' },
];

type Props = {
  condition: ConditionValue;
  message: string;
  onConditionChange: (value: ConditionValue) => void;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
};

/** 오늘 컨디션 입력 — 남긴 뒤에는 배너 캐러셀로 이동 */
export function ConditionLogSection({
  condition,
  message,
  onConditionChange,
  onMessageChange,
  onSubmit,
}: Props) {
  return (
    <View className="mt-4 gap-5">
      <LabelSm className="mb-1 text-center">{COPY.condition.prompt}</LabelSm>
      <View className="flex-row justify-around gap-2 px-1 pt-1">
        {CONDITIONS.map((c) => {
          const selected = condition === c.value;
          return (
            <Pressable
              key={c.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={c.label}
              onPress={() => onConditionChange(c.value)}
              className="items-center gap-1.5"
            >
              <View
                className={cn(
                  'h-[72px] w-[72px] items-center justify-center rounded-full',
                  selected ? 'bg-brand-soft' : 'bg-surface-soft',
                )}
                style={
                  selected
                    ? { borderWidth: 2, borderColor: COLORS.brand }
                    : undefined
                }
              >
                <KokiIllustration
                  variant={c.koki}
                  size={56}
                  accessibilityLabel={c.label}
                />
              </View>
              <LabelSm tone={selected ? 'brand' : 'muted'}>{c.label}</LabelSm>
            </Pressable>
          );
        })}
      </View>
      <Input
        bordered
        value={message}
        onChangeText={onMessageChange}
        placeholder={COPY.condition.messagePlaceholder}
      />
      <Button
        label={COPY.condition.submit}
        shape="round"
        onPress={onSubmit}
      />
    </View>
  );
}
