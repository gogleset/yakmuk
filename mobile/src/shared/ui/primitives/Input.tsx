import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

type Props = TextInputProps & {
  className?: string;
};

export function Input({
  className,
  placeholderTextColor,
  onFocus,
  onBlur,
  style,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      className={cn(
        'rounded-[10px] bg-surface px-3.5 py-3 text-base text-text',
        className,
      )}
      style={[
        {
          // focus일 때만 보더. NativeWind focus:border는 remount/blur 유발 → style로 처리
          // unfocused 투명 보더는 레이아웃 점프 방지
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
