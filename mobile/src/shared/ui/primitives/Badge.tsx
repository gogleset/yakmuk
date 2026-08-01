import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

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
      variant: 'default',
    },
  },
);

const badgeLabelVariants = cva('text-sm font-semibold', {
  variants: {
    variant: {
      default: 'text-ink',
      secondary: 'text-brand',
      soft: 'text-brand',
      outline: 'text-brand-muted',
      warning: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type Props = VariantProps<typeof badgeVariants> & {
  label: string;
  className?: string;
  /** 라벨 텍스트 클래스 (크기 등) */
  labelClassName?: string;
  selected?: boolean;
};

export function Badge({
  label,
  variant = 'secondary',
  selected,
  className,
  labelClassName,
}: Props) {
  const resolved = selected ? 'default' : variant;
  const isWarning = resolved === 'warning';

  return (
    <View
      className={cn(badgeVariants({ variant: resolved }), className)}
      style={isWarning ? { backgroundColor: COLORS.warningBg } : undefined}
    >
      <Text
        className={cn(badgeLabelVariants({ variant: resolved }), labelClassName)}
        style={isWarning ? { color: COLORS.warning } : undefined}
      >
        {label}
      </Text>
    </View>
  );
}
