import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { COLORS, LAYOUT } from "@/shared/config/theme";
import { cn } from "@/shared/lib/cn";
import type { IconComponent } from "@/shared/ui/primitives/Icon";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-xl active:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand",
        secondary: "bg-brand-soft",
        outline: "bg-surface-soft",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
      },
      size: {
        default: "px-[18px] py-3.5",
        sm: "px-3.5 py-2.5",
        lg: "px-6 py-4",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonLabelVariants = cva("text-base font-semibold", {
  variants: {
    variant: {
      default: "text-ink",
      secondary: "text-brand",
      outline: "text-brand",
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
  return COLORS.brand;
}

export function Button({
  label,
  icon: Icon,
  variant = "default",
  size = "default",
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
        buttonVariants({ variant: resolvedVariant, size }),
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
