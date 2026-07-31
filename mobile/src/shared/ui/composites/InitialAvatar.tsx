import { Text, View } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { nicknameInitial } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

type Size = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

const TEXT_CLASS: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

type Props = {
  nickname: string | null | undefined;
  size?: Size;
  className?: string;
  /** 스택 오버랩용 테두리 */
  ring?: boolean;
};

/** 닉네임 이니셜 원형 아바타 (사진 없음 · 중립 soft fill) */
export function InitialAvatar({
  nickname,
  size = 'md',
  className,
  ring = false,
}: Props) {
  const px = SIZE_PX[size];
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full bg-surface-soft',
        className,
      )}
      style={{
        width: px,
        height: px,
        borderWidth: ring ? 2 : 0,
        borderColor: COLORS.surface,
      }}
    >
      <Text
        className={cn('font-bold text-text', TEXT_CLASS[size])}
        accessibilityLabel={nickname ?? undefined}
      >
        {nicknameInitial(nickname)}
      </Text>
    </View>
  );
}
