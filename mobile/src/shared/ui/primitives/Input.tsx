import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

export type InputTone = 'default' | 'soft';

type Props = TextInputProps & {
  className?: string;
  /**
   * default = surfaceSoft (흰 배경 위 가시)
   * soft = brandSoft — BottomSheet(surface) 안 더 강한 대비
   */
  tone?: InputTone;
};

export function Input({
  className,
  placeholderTextColor,
  onFocus,
  onBlur,
  style,
  tone = 'default',
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      className={cn(
        'rounded-[10px] px-3.5 py-3 text-base text-text',
        tone === 'soft' ? 'bg-brand-soft' : 'bg-surface-soft',
        className,
      )}
      style={[
        {
          // focus일 때만 보더. NativeWind focus:border는 remount/blur 유발 → style로 처리
          borderWidth: 1,
          borderColor: focused ? COLORS.brand : 'transparent',
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor ?? COLORS.muted}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
