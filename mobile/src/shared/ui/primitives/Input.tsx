import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

export type InputTone = 'default' | 'soft';

type Props = TextInputProps & {
  className?: string;
  /**
   * default = 흰 surface (canvas 위 line 보더로 가시)
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
        // default=흰 surface · soft=시트 안 brandSoft
        tone === 'soft' ? 'bg-brand-soft' : 'bg-surface',
        className,
      )}
      style={[
        {
          // design §8.1 — focus일 때만 brand 보더
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
