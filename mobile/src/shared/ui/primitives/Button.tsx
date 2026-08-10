import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import type { MotionsOfKind } from '@/shared/lib/motion/styles';
import { PressableScale } from '@/shared/ui/composites/PressableScale';
import type { IconComponent } from '@/shared/ui/primitives/Icon';
import {
  buttonVariants,
  type ButtonVariant,
  type ButtonVariantProps,
} from '@/shared/ui/primitives/buttonVariants';
import {
  LabelMd,
  type TextTone,
} from '@/shared/ui/primitives/Typography';

export { buttonVariants } from '@/shared/ui/primitives/buttonVariants';

type Props = Omit<PressableProps, 'children' | 'style'> &
  ButtonVariantProps & {
    label?: string;
    icon?: IconComponent;
    className?: string;
    children?: ReactNode;
    motion?: false | MotionsOfKind<'press'>;
  };

function iconColor(variant: ButtonVariant): string {
  if (variant === 'default') return COLORS.ink;
  if (variant === 'destructive') return COLORS.white;
  if (variant === 'oauth') return COLORS.text;
  return COLORS.brand;
}

function buttonLabelTone(variant: ButtonVariant): TextTone | false {
  if (variant === 'default') return 'ink';
  if (variant === 'oauth') return 'text';
  if (variant === 'destructive') return false;
  return 'brand';
}

export function Button({
  label,
  icon: Icon,
  variant = 'default',
  size = 'default',
  shape = 'default',
  disabled,
  className,
  children,
  motion,
  ...rest
}: Props) {
  const resolvedVariant = (variant ?? 'default') as ButtonVariant;

  return (
    <PressableScale
      accessibilityRole="button"
      disabled={disabled}
      motion={motion}
      className={cn(
        buttonVariants({
          variant: resolvedVariant,
          size,
          shape: shape ?? 'default',
        }),
        className,
      )}
      {...rest}
    >
      {Icon ? (
        <Icon size={LAYOUT.icon.md} color={iconColor(resolvedVariant)} />
      ) : null}
      {label ? (
        <LabelMd
          tone={buttonLabelTone(resolvedVariant)}
          className={
            resolvedVariant === 'destructive' ? 'text-white' : undefined
          }
        >
          {label}
        </LabelMd>
      ) : null}
      {children}
    </PressableScale>
  );
}
