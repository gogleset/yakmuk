import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { Body, SectionTitle } from '@/shared/ui/primitives/Typography';

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
  return <SectionTitle className={className}>{children}</SectionTitle>;
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <Body className={cn('mt-1', className)}>{children}</Body>;
}
