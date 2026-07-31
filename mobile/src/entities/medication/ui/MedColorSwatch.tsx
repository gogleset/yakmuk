import { View } from 'react-native';
import {
  MED_COLORS,
  type MedColorId,
} from '@/shared/constants/medColors';
import { PressableScale } from '@/shared/ui/composites/PressableScale';
import { cn } from '@/shared/lib/cn';

type Props = {
  value: string;
  onChange: (colorId: MedColorId) => void;
  /** true면 탭 무시 (상세 보기) */
  readOnly?: boolean;
};

/** 약 구분 색 스와치 */
export function MedColorSwatch({ value, onChange, readOnly = false }: Props) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {MED_COLORS.map((color) => {
        const selected = value === color.id;
        return (
          <PressableScale
            key={color.id}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: readOnly }}
            accessibilityLabel={color.id}
            disabled={readOnly}
            onPress={() => {
              if (readOnly) return;
              onChange(color.id);
            }}
            className={cn(
              'h-9 w-9 items-center justify-center rounded-full',
              selected && 'bg-brand-soft',
            )}
          >
            <View
              className="h-7 w-7 rounded-full"
              style={{ backgroundColor: color.hex }}
            />
          </PressableScale>
        );
      })}
    </View>
  );
}
