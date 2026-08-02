import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { COLORS, LAYOUT } from "@/shared/config/theme";
import { cn } from "@/shared/lib/cn";
import type { IconComponent } from "@/shared/ui/primitives/Icon";

/** 테스트·스토리용 — shape 클래스 계약 */
export const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 active:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand",
        secondary: "bg-brand-soft",
        outline: "bg-surface-soft",
        /** OAuth 표준 — 흰 배경 + line 윤곽 (Google/Apple G는 흰 위) */
        oauth: "border border-line bg-surface",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        default: "px-[18px] py-3.5",
        sm: "px-3.5 py-2.5",
        lg: "px-6 py-4",
        icon: "h-11 w-11 p-0",
      },
      shape: {
        default: "rounded-xl",
        /** pill — 홈 empty「첫 약 등록하기」1차 CTA */
        round: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

const buttonLabelVariants = cva("text-base font-semibold", {
  variants: {
    variant: {
      default: "text-ink",
      secondary: "text-brand",
      outline: "text-brand",
      oauth: "text-text",
      ghost: "text-brand",
      destructive: "text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;

type Props = Omit<PressableProps, "children"> &
  VariantProps<typeof buttonVariants> & {
    label?: string;
    icon?: IconComponent;
    className?: string;
    children?: ReactNode;
  };

function iconColor(variant: ButtonVariant): string {
  if (variant === "default") return COLORS.ink;
  if (variant === "destructive") return COLORS.white;
  if (variant === "oauth") return COLORS.text;
  return COLORS.brand;
}

export function Button({
  label,
  icon: Icon,
  variant = "default",
  size = "default",
  shape = "default",
  disabled,
  className,
  children,
  ...rest
}: Props) {
  const resolvedVariant = (variant ?? "default") as ButtonVariant;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        buttonVariants({
          variant: resolvedVariant,
          size,
          shape: shape ?? "default",
        }),
        className,
      )}
      {...rest}
    >
      {Icon ? (
        <Icon size={LAYOUT.icon.md} color={iconColor(resolvedVariant)} />
      ) : null}
      {label ? (
        <Text className={cn(buttonLabelVariants({ variant: resolvedVariant }))}>
          {label}
        </Text>
      ) : null}
      {children}
    </Pressable>
  );
}
