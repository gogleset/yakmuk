import { COLORS, LAYOUT } from '@/shared/config/theme';
import type { MotionsOfKind } from '@/shared/lib/motion/styles';
import { PressableScale } from '@/shared/ui/composites/PressableScale';
import { Icons } from '@/shared/ui/primitives/Icon';

type Props = {
  onPress: () => void;
  label: string;
  bottom?: number;
  motion?: false | MotionsOfKind<'press'>;
};

/** 우하단 플로팅 + */
export function Fab({
  onPress,
  label,
  bottom = LAYOUT.fab.bottom,
  motion,
}: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      motion={motion}
      className="absolute right-5 z-20 items-center justify-center rounded-full bg-brand"
      style={{
        bottom,
        zIndex: LAYOUT.z.fab,
        width: LAYOUT.fab.size,
        height: LAYOUT.fab.size,
      }}
    >
      <Icons.Plus size={LAYOUT.fab.iconSize} color={COLORS.ink} />
    </PressableScale>
  );
}
