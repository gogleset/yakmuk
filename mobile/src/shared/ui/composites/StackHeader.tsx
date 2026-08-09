import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Icons } from '@/shared/ui/primitives/Icon';
import { TitleLg } from '@/shared/ui/primitives/Typography';

type Props = {
  title: string;
  onBack?: () => void;
  /** 기본 text (중립). brand는 레거시 톤 */
  tone?: 'text' | 'brand';
  className?: string;
};

/** 스택 서브화면 헤더 — 탭 PageTitle보다 한 단계 작게 */
export function StackHeader({
  title,
  onBack,
  tone = 'text',
  className,
}: Props) {
  const color = tone === 'brand' ? COLORS.brand : COLORS.text;
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 px-5 pb-1 pt-2',
        className,
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로"
        hitSlop={LAYOUT.hitSlop.md}
        onPress={onBack ?? (() => router.back())}
        className="p-0.5"
      >
        <Icons.ChevronLeft size={LAYOUT.icon.lg} color={color} />
      </Pressable>
      <TitleLg
        tone={tone}
        className="flex-1"
        numberOfLines={1}
      >
        {title}
      </TitleLg>
    </View>
  );
}
