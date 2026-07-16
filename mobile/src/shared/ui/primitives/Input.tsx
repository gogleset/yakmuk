import { TextInput, type TextInputProps } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

type Props = TextInputProps & {
  className?: string;
};

export function Input({ className, placeholderTextColor, ...rest }: Props) {
  return (
    <TextInput
      className={cn(
        'rounded-[10px] bg-white px-3.5 py-3 text-base text-brand focus:border focus:border-line',
        className,
      )}
      placeholderTextColor={placeholderTextColor ?? COLORS.muted}
      {...rest}
    />
  );
}
