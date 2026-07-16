import { LinearGradient } from 'expo-linear-gradient';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

export type FadeEdgeSide = 'top' | 'bottom';

type Props = {
  edge?: FadeEdgeSide;
  height?: number;
  color?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/** 스크롤 가장자리 fade */
export function FadeEdge({
  edge = 'bottom',
  height = LAYOUT.fade.defaultHeight,
  color = COLORS.canvas,
  className,
  style,
}: Props) {
  const clear =
    color === COLORS.canvas
      ? COLORS.canvasTransparent
      : withAlpha(color, 0);

  const colors =
    edge === 'top' ? ([color, clear] as const) : ([clear, color] as const);

  return (
    <View
      pointerEvents="none"
      className={cn(
        'absolute left-0 right-0',
        edge === 'top' ? 'top-0' : 'bottom-0',
        className,
      )}
      style={[{ height, zIndex: LAYOUT.z.fade }, style]}
    >
      <LinearGradient
        colors={[...colors]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

type BothProps = {
  top?: boolean | number;
  bottom?: boolean | number;
  color?: string;
};

export function FadeEdges({ top = true, bottom = true, color }: BothProps) {
  return (
    <>
      {top ? (
        <FadeEdge
          edge="top"
          height={typeof top === 'number' ? top : LAYOUT.fade.defaultTop}
          color={color}
        />
      ) : null}
      {bottom ? (
        <FadeEdge
          edge="bottom"
          height={
            typeof bottom === 'number' ? bottom : LAYOUT.fade.defaultBottom
          }
          color={color}
        />
      ) : null}
    </>
  );
}

function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
