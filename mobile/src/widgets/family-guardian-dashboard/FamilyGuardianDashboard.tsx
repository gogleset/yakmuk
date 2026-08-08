import { Pressable, Text, View } from 'react-native';
import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import { COLORS, LAYOUT, TONE_OUTLINE } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  Fallback,
  Icons,
  InitialAvatar,
  KokiIllustration,
  Muted,
} from '@/shared/ui';
import { memberStatusLabel } from './lib/memberStatus';

type Props = {
  members: CareRecipientTodayStatus[];
  /** 섹션 제목 — 가족장이 설정한 가족명 */
  sectionTitle: string;
  showInviteCta?: boolean;
  onPressMember: (userId: string, nickname: string) => void;
  onInviteCtaPress?: () => void;
  /** leader만 전달 — 멤버 있을 때 「관리」노출 */
  onManagePress?: () => void;
  isError?: boolean;
  onRetry?: () => void;
};

type MemberCardProps = {
  member: CareRecipientTodayStatus;
  onPress: () => void;
};

/** 상태 라벨 색 — 위험(알림·BAD)만 warning. 진행 중은 muted */
function statusLabelColor(member: CareRecipientTodayStatus): string {
  if (member.hasUnackedAlert || member.condition === 'BAD') {
    return COLORS.warning;
  }
  return COLORS.muted;
}

/** 가족 그리드 카드 — 중앙 아바타 · 이름 · 상태 한 줄 */
function FamilyMemberStatusCard({ member, onPress }: MemberCardProps) {
  const status = memberStatusLabel(member);
  // pending(오늘 진행)은 위험 아님 — stuck/BAD 알림만 경고
  const showWarn = member.hasUnackedAlert || member.condition === 'BAD';
  // 호칭이 닉과 같으면 한 번만
  const invitedAs = member.invitedAs?.trim() || null;
  const nameLabel =
    invitedAs && invitedAs !== member.nickname
      ? COPY.family.memberTitle(member.nickname, invitedAs)
      : member.nickname;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="w-[48%]"
    >
      <View
        className="items-center gap-1.5 rounded-xl bg-surface px-2.5 py-3"
        style={showWarn ? TONE_OUTLINE.warning : undefined}
      >
        <InitialAvatar nickname={member.nickname} size="md" />
        <Text
          className="text-center text-sm font-bold text-text"
          numberOfLines={1}
        >
          {nameLabel}
        </Text>
        <Text
          className="text-center text-xs"
          numberOfLines={1}
          style={{ color: statusLabelColor(member) }}
        >
          {status}
        </Text>
      </View>
    </Pressable>
  );
}

/** 가족 2×2 그리드 (+ empty/로드실패). 케어 알림은 FamilyCareAlertCarousel */
export function FamilyGuardianDashboard({
  members,
  sectionTitle,
  showInviteCta = false,
  onPressMember,
  onInviteCtaPress,
  onManagePress,
  isError = false,
  onRetry,
}: Props) {
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

  // empty: 헤더 없이 CTA만 (관리는 멤버 있을 때만)
  if (members.length === 0) {
    return (
      <Fallback
        image={<KokiIllustration variant="family" size={120} />}
        message={COPY.family.emptyMembers}
        ctaLabel={showInviteCta ? COPY.family.inviteCta : undefined}
        onCtaPress={showInviteCta ? onInviteCtaPress : undefined}
      />
    );
  }

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text
          className="min-w-0 flex-1 text-sm font-bold text-text"
          numberOfLines={1}
        >
          {sectionTitle}
        </Text>
        {onManagePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.family.manage}
            hitSlop={LAYOUT.hitSlop.md}
            onPress={onManagePress}
            className="flex-row items-center gap-0.5"
          >
            <Muted className="text-xs">{COPY.family.manage}</Muted>
            <Icons.ChevronRight size={LAYOUT.icon.sm} color={COLORS.muted} />
          </Pressable>
        ) : null}
      </View>
      <View className="flex-row flex-wrap justify-between gap-y-2 rounded-2xl bg-surface-soft p-2.5">
        {members.map((member) => (
          <FamilyMemberStatusCard
            key={member.userId}
            member={member}
            onPress={() => onPressMember(member.userId, member.nickname)}
          />
        ))}
      </View>
    </View>
  );
}
