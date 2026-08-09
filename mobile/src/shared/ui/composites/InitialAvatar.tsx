import { View } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { nicknameInitial } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import {
  LabelMd,
  LabelSm,
  LabelXs,
} from '@/shared/ui/primitives/Typography';

type Size = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

const LabelBySize = {
  sm: LabelXs,
  md: LabelSm,
  lg: LabelMd,
} as const;

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
  const Label = LabelBySize[size];
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
      <Label
        tone="text"
        className="font-bold"
        accessibilityLabel={nickname ?? undefined}
      >
        {nicknameInitial(nickname)}
      </Label>
    </View>
  );
}
