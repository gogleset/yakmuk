import { View } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

type Props = {
  /** pending = dashed ring */
  variant?: 'solid' | 'dashed';
  size?: number;
  className?: string;
  /** 호칭 구분색 — 보더만 */
  accentHex?: string;
  /** @deprecated 화이트톤 — 무시, accent 보더만 사용 */
  softFill?: string;
};

/** 이모지/얼굴 컷 자리 — 흰 원 + 살짝 보더 */
export function FacePlaceholder({
  variant = 'solid',
  size = 40,
  className,
  accentHex,
}: Props) {
  const accent = accentHex ?? COLORS.brand;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn(
        'items-center justify-center rounded-full bg-surface',
        variant === 'dashed' ? 'border border-dashed' : 'border',
        className,
      )}
      style={{
        width: size,
        height: size,
        borderColor: accent,
      }}
    />
  );
}
