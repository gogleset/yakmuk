import { Pressable } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Icons } from '@/shared/ui/primitives/Icon';

type Props = {
  onPress: () => void;
  label: string;
  bottom?: number;
};

/** 우하단 플로팅 + */
export function Fab({
  onPress,
  label,
  bottom = LAYOUT.fab.bottom,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="absolute right-5 z-20 h-14 w-14 items-center justify-center rounded-full bg-brand active:opacity-80"
      style={{ bottom, zIndex: LAYOUT.z.fab }}
    >
      <Icons.Plus size={LAYOUT.fab.iconSize} color={COLORS.ink} />
    </Pressable>
  );
}
