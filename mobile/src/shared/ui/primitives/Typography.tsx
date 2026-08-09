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
      titleMd: 'text-[15px] font-bold',
      titleLg: 'text-lg font-bold',
      titleXl: 'text-xl font-bold',
      labelXs: 'text-xs font-semibold',
      labelSm: 'text-sm font-semibold',
      labelMd: 'text-base font-semibold',
      labelLg: 'text-lg font-semibold',
      labelTight: 'text-[15px] font-semibold',
      display: 'text-6xl font-bold tracking-tight',
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
  titleMd: 'text',
  titleLg: 'brand',
  titleXl: 'brand',
  labelXs: 'brand',
  labelSm: 'brand',
  labelMd: 'brand',
  labelLg: 'brand',
  labelTight: 'brand',
  display: 'text',
  body: 'muted',
  caption: 'muted',
};

type BaseProps = Omit<TextProps, 'role'> & {
  className?: string;
  children: ReactNode;
};

type AliasProps = BaseProps & {
  /** false면 tone 클래스 생략 (예: Button destructive + text-white) */
  tone?: TextTone | false;
};

type TextComponentProps = BaseProps & {
  /** Typography role (design.md §7). a11y는 accessibilityRole 사용. */
  role: TextRole;
  tone?: TextTone | false;
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
        tone === false
          ? undefined
          : textToneVariants({ tone: tone ?? DEFAULT_TONE[role] }),
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

export function TitleMd(props: AliasProps) {
  return <Text role="titleMd" {...props} />;
}

export function TitleLg(props: AliasProps) {
  return <Text role="titleLg" {...props} />;
}

export function TitleXl(props: AliasProps) {
  return <Text role="titleXl" {...props} />;
}

export function LabelXs(props: AliasProps) {
  return <Text role="labelXs" {...props} />;
}

export function LabelSm(props: AliasProps) {
  return <Text role="labelSm" {...props} />;
}

export function LabelMd(props: AliasProps) {
  return <Text role="labelMd" {...props} />;
}

export function LabelLg(props: AliasProps) {
  return <Text role="labelLg" {...props} />;
}

export function LabelTight(props: AliasProps) {
  return <Text role="labelTight" {...props} />;
}

export function Display(props: AliasProps) {
  return <Text role="display" {...props} />;
}

export function Body(props: AliasProps) {
  return <Text role="body" {...props} />;
}

export function Caption(props: AliasProps) {
  return <Text role="caption" {...props} />;
}
