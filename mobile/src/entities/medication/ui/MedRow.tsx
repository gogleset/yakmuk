import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Icons } from '@/shared/ui/primitives/Icon';

type Props = {
  name: string;
  scheduledTime: string;
  taken: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

/** 복약 체크 행 */
export function MedRow({
  name,
  scheduledTime,
  taken,
  onPress,
  onLongPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ checked: taken }}
      className={cn(
        'flex-row items-center justify-between rounded-xl p-3.5',
        taken ? 'bg-brand-soft' : 'bg-white',
      )}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View className="flex-row items-center gap-2.5">
        {taken ? (
          <Icons.CheckCircle size={LAYOUT.icon.lg} color={COLORS.brand} />
        ) : (
          <Icons.Circle size={LAYOUT.icon.lg} color={COLORS.muted} />
        )}
        <Text className="text-base font-semibold text-brand">{name}</Text>
      </View>
      <Text className="text-brand-faint">{scheduledTime}</Text>
    </Pressable>
  );
}
