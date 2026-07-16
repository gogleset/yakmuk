import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/shared/lib/cn';

type Props = ViewProps & {
  className?: string;
  children: ReactNode;
};

/** 캔버스 배경 스크린 래퍼 */
export function Screen({ className, children, ...rest }: Props) {
  return (
    <View className={cn('flex-1 bg-canvas', className)} {...rest}>
      {children}
    </View>
  );
}
