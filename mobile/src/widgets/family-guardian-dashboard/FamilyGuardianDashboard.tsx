import { Pressable, Text, View } from 'react-native';
import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  Icons,
  InitialAvatar,
  KokiIllustration,
  RichEmptyState,
} from '@/shared/ui';
import { memberStatusLabel } from './lib/memberStatus';

type Props = {
  members: CareRecipientTodayStatus[];
  showInviteCta?: boolean;
  onPressMember: (userId: string, nickname: string) => void;
  onInviteCtaPress?: () => void;
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
        className="relative items-center gap-1.5 rounded-xl bg-surface px-2.5 py-3"
        style={
          showWarn
            ? { backgroundColor: COLORS.warningBg }
            : undefined
        }
      >
        {showWarn ? (
          <View className="absolute right-2 top-2">
            <Icons.TriangleAlert
              size={LAYOUT.icon.sm}
              color={COLORS.warning}
            />
          </View>
        ) : null}
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

/** 가족 2×2 그리드 (+ empty). 케어 알림은 FamilyCareAlertCarousel */
export function FamilyGuardianDashboard({
  members,
  showInviteCta = false,
  onPressMember,
  onInviteCtaPress,
}: Props) {
  if (members.length === 0) {
    return (
      <RichEmptyState
        title={COPY.family.emptyMembers}
        message={COPY.family.emptyMembersMessage}
        illustration={<KokiIllustration variant="family" size={120} />}
        ctaLabel={showInviteCta ? COPY.family.inviteCta : undefined}
        onCtaPress={showInviteCta ? onInviteCtaPress : undefined}
        className="bg-transparent"
      />
    );
  }

  return (
    <View className="gap-2.5">
      <Text className="text-sm font-bold text-text">
        {COPY.family.todayStatus}
      </Text>
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
