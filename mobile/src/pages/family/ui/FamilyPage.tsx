import { useQueryClient } from '@tanstack/react-query';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import {
  useFamilyFeedSubscription,
  useFamilyScreenQueries,
} from '@/entities/family/model/queries';
import { useAckFamilyAlertMutation } from '@/features/ack-family-alert';
import { familyMemberRoute, ROUTES } from '@/shared/config/routes';
import { formatDayLabel } from '@/shared/lib/format';
import { todayKstDateString } from '@/shared/lib/kst';
import { LAYOUT } from '@/shared/config/theme';
import {
  FadeInView,
  Icons,
  Muted,
  RichEmptyState,
  Screen,
  SectionHeader,
} from '@/shared/ui';
import { FamilyActivityFeedItem } from '@/widgets/family-activity-feed';
import { FamilyGuardianDashboard } from '@/widgets/family-guardian-dashboard';

/** 가족 — 전원 복약 상태·활동 피드 (대칭) */
export function FamilyPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const familyId = profile?.familyId;
  const today = todayKstDateString();
  const myUserId = profile?.id;
  const isLeader = profile?.role === 'family_leader';

  const {
    status: statusQuery,
    alerts: alertsQuery,
    feed: feedQuery,
    members: membersQuery,
  } = useFamilyScreenQueries({
    familyId,
    todayKst: today,
  });

  useFamilyFeedSubscription(familyId, qc);

  const ackMut = useAckFamilyAlertMutation();

  const statusMembers = statusQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  const feed = (feedQuery.data ?? []).filter((item) => item.userId !== myUserId);

  const leaderNickname =
    (membersQuery.data ?? []).find((m) => m.role === 'family_leader')
      ?.nickname ??
    (profile?.role === 'family_leader' ? profile.nickname : null);

  const openMember = (userId: string, nickname: string | null) => {
    if (!userId || userId === myUserId) return;
    const role =
      (membersQuery.data ?? []).find((m) => m.userId === userId)?.role ?? null;
    router.push(familyMemberRoute(userId, nickname, role));
  };

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <FlatList
        data={feed}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="gap-2.5 px-5 pb-10 pt-4"
        ListHeaderComponent={
          <FadeInView className="gap-3 pb-2">
            <Muted>{formatDayLabel(today)} · 가족 안부</Muted>

            <FamilyGuardianDashboard
              alerts={alerts}
              members={statusMembers}
              leaderNickname={leaderNickname}
              myUserId={myUserId}
              showInviteCta={isLeader}
              onAckAlert={(id) => ackMut.mutate(id)}
              onPressMember={openMember}
              onInviteCtaPress={() => router.push(ROUTES.settingsFamily)}
            />

            <SectionHeader title="최근 소식" />
          </FadeInView>
        }
        ListEmptyComponent={
          <RichEmptyState
            title="아직 소식이 없어요"
            message="가족이 약을 체크하면 여기에 보여요."
            icon={Icons.Users}
          />
        }
        renderItem={({ item }) => (
          <FamilyActivityFeedItem item={item} onPress={openMember} />
        )}
      />
    </Screen>
  );
}
