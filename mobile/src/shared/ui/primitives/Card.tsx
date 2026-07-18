import type { ReactNode } from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { cn } from '@/shared/lib/cn';

type Props = ViewProps & {
  className?: string;
};

export function Card({ className, style, ...rest }: Props) {
  return (
    <View
      className={cn('rounded-xl bg-surface-soft p-3.5', className)}
      style={style}
      {...rest}
    />
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Text className={cn('text-base font-bold text-brand', className)}>
      {children}
    </Text>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Text className={cn('mt-1 text-brand-muted', className)}>{children}</Text>
  );
}
