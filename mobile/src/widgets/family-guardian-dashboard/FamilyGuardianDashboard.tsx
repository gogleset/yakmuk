import { COPY } from '@/shared/copy';
import {
  Fallback,
  KokiIllustration,
  LabelSm,
} from '@/shared/ui';

type HeaderProps = {
  sectionTitle: string;
};

/** 가족 탭 자리표 섹션 헤더 — 가족명만 */
export function FamilyRosterSectionHeader({ sectionTitle }: HeaderProps) {
  return (
    <LabelSm tone="text" className="font-bold" numberOfLines={1}>
      {sectionTitle}
    </LabelSm>
  );
}

type EmptyProps = {
  showInviteCta?: boolean;
  onInviteCtaPress?: () => void;
  isError?: boolean;
  onRetry?: () => void;
};

/** 가족 탭 empty / 로드실패 */
export function FamilyRosterEmpty({
  showInviteCta = false,
  onInviteCtaPress,
  isError = false,
  onRetry,
}: EmptyProps) {
  if (isError) {
    return (
      <Fallback
        image={<KokiIllustration variant="thinking" size={96} />}
        message={COPY.family.loadFailed}
        ctaLabel={onRetry ? COPY.common.retry : undefined}
        onCtaPress={onRetry}
      />
    );
  }

  return (
    <Fallback
      fill
      image={<KokiIllustration variant="family" size={120} />}
      message={COPY.family.emptyMembers}
      ctaLabel={showInviteCta ? COPY.family.inviteCta : undefined}
      onCtaPress={showInviteCta ? onInviteCtaPress : undefined}
    />
  );
}
