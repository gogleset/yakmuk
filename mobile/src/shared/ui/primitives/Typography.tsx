import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/shared/lib/cn';

/** design.md §7 — size/weight/leading only */
export const textRoleVariants = cva('', {
  variants: {
    role: {
      hero: 'text-3xl font-bold leading-snug',
      pageTitle: 'text-2xl font-bold',
      sectionTitle: 'text-base font-bold',
      body: 'text-base leading-5',
      caption: 'text-xs',
    },
  },
});

/** design.md §7 — color only */
export const textToneVariants = cva('', {
  variants: {
    tone: {
      text: 'text-text',
      brand: 'text-brand',
      muted: 'text-brand-muted',
      faint: 'text-brand-faint',
      ink: 'text-ink',
    },
  },
});

export type TextRole = NonNullable<
  VariantProps<typeof textRoleVariants>['role']
>;
export type TextTone = NonNullable<
  VariantProps<typeof textToneVariants>['tone']
>;

const DEFAULT_TONE: Record<TextRole, TextTone> = {
  hero: 'text',
  pageTitle: 'brand',
  sectionTitle: 'brand',
  body: 'muted',
  caption: 'muted',
};

type BaseProps = Omit<TextProps, 'role'> & {
  className?: string;
  children: ReactNode;
};

type AliasProps = BaseProps & {
  tone?: TextTone;
};

type TextComponentProps = BaseProps & {
  /** Typography role (design.md §7). a11y는 accessibilityRole 사용. */
  role: TextRole;
  tone?: TextTone;
};

export function Text({
  role,
  tone,
  className,
  children,
  ...rest
}: TextComponentProps) {
  return (
    <RNText
      className={cn(
        textRoleVariants({ role }),
        textToneVariants({ tone: tone ?? DEFAULT_TONE[role] }),
        className,
      )}
      {...rest}
    >
      {children}
    </RNText>
  );
}

export function PageTitle(props: AliasProps) {
  return <Text role="pageTitle" {...props} />;
}

export function SectionTitle(props: AliasProps) {
  return <Text role="sectionTitle" {...props} />;
}

export function Body(props: AliasProps) {
  return <Text role="body" {...props} />;
}

export function Caption(props: AliasProps) {
  return <Text role="caption" {...props} />;
}
