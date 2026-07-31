import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

export type InputTone = 'default' | 'soft';

type Props = TextInputProps & {
  className?: string;
  /**
   * default = 흰 surface (canvas 위)
   * soft = brandSoft — BottomSheet(surface) 안 더 강한 대비
   */
  tone?: InputTone;
  /** true면 비포커스에도 line 보더 (컨디션 한마디 등) */
  bordered?: boolean;
};

export function Input({
  className,
  placeholderTextColor,
  onFocus,
  onBlur,
  style,
  tone = 'default',
  bordered = false,
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
          borderWidth: 1,
          borderColor: focused
            ? COLORS.brand
            : bordered
              ? COLORS.line
              : 'transparent',
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
