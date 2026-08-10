import { cva, type VariantProps } from 'class-variance-authority';

/** 테스트·스토리용 — shape 클래스 계약 (Button과 분리 — Jest가 Reanimated를 안 끌어옴) */
export const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand',
        secondary: 'bg-brand-soft',
        outline: 'bg-surface-soft',
        /** OAuth 표준 — 흰 배경 + line 윤곽 (Google/Apple G는 흰 위) */
        oauth: 'border border-line bg-surface',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive',
      },
      size: {
        default: 'px-[18px] py-3.5',
        sm: 'px-3.5 py-2.5',
        lg: 'px-6 py-4',
        icon: 'h-11 w-11 p-0',
      },
      shape: {
        default: 'rounded-xl',
        /** pill — 홈 empty「첫 약 등록하기」1차 CTA */
        round: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonVariantProps['variant']>;
