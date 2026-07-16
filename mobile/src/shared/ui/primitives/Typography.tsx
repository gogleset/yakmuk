import type { ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { cn } from '@/shared/lib/cn';

type Props = TextProps & {
  className?: string;
  children: ReactNode;
};

export function PageTitle({ className, children, ...rest }: Props) {
  return (
    <Text className={cn('text-2xl font-bold text-brand', className)} {...rest}>
      {children}
    </Text>
  );
}

export function SectionTitle({ className, children, ...rest }: Props) {
  return (
    <Text
      className={cn('text-base font-bold text-brand', className)}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function Body({ className, children, ...rest }: Props) {
  return (
    <Text className={cn('leading-5 text-brand-muted', className)} {...rest}>
      {children}
    </Text>
  );
}

export function Muted({ className, children, ...rest }: Props) {
  return (
    <Text className={cn('text-brand-faint', className)} {...rest}>
      {children}
    </Text>
  );
}

export function Caption({ className, children, ...rest }: Props) {
  return (
    <Text className={cn('text-xs text-brand-faint', className)} {...rest}>
      {children}
    </Text>
  );
}
