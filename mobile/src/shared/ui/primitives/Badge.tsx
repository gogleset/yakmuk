import { cva, type VariantProps } from 'class-variance-authority';
import { View } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import {
  LabelSm,
  type TextTone,
} from '@/shared/ui/primitives/Typography';

const badgeVariants = cva(
  'flex-row items-center gap-1 self-start rounded-xl px-3 py-1.5',
  {
    variants: {
      variant: {
        default: 'bg-brand',
        secondary: 'bg-transparent',
        soft: 'bg-brand-soft',
        outline: 'bg-surface-soft',
        warning: '',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
);

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

type Props = VariantProps<typeof badgeVariants> & {
  label: string;
  className?: string;
  /** 라벨 텍스트 클래스 (크기 등) */
  labelClassName?: string;
  selected?: boolean;
};

function badgeLabelTone(variant: BadgeVariant): TextTone | false {
  if (variant === 'default') return 'ink';
  if (variant === 'outline') return 'muted';
  if (variant === 'warning') return 'warning';
  return 'brand';
}

export function Badge({
  label,
  variant = 'secondary',
  selected,
  className,
  labelClassName,
}: Props) {
  const resolved = (selected ? 'default' : variant) as BadgeVariant;
  const isWarning = resolved === 'warning';

  return (
    <View
      className={cn(badgeVariants({ variant: resolved }), className)}
      style={isWarning ? { backgroundColor: COLORS.warningBg } : undefined}
    >
      <LabelSm tone={badgeLabelTone(resolved)} className={labelClassName}>
        {label}
      </LabelSm>
    </View>
  );
}
