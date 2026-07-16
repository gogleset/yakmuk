import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'flex-row items-center gap-1 self-start rounded-full px-3 py-1.5',
  {
    variants: {
      variant: {
        default: 'bg-brand',
        secondary: 'bg-transparent',
        soft: 'bg-brand-soft',
        outline: 'bg-white',
        warning: 'bg-[#FFF8E1]',
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
      warning: 'text-[#A67C00]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type Props = VariantProps<typeof badgeVariants> & {
  label: string;
  className?: string;
  selected?: boolean;
};

export function Badge({
  label,
  variant = 'secondary',
  selected,
  className,
}: Props) {
  const resolved = selected ? 'default' : variant;
  return (
    <View className={cn(badgeVariants({ variant: resolved }), className)}>
      <Text className={cn(badgeLabelVariants({ variant: resolved }))}>
        {label}
      </Text>
    </View>
  );
}
