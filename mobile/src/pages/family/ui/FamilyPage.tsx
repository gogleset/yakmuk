import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useFamilyFeedSubscription,
  useFamilyScreenQueries,
} from '@/entities/family/model/queries';
import { useAckFamilyAlertMutation } from '@/features/ack-family-alert';
import { FamilyInviteSheet } from '@/features/family-invite';
import { formatDayLabel } from '@/shared/lib/format';
import { todayKstDateString } from '@/shared/lib/kst';
import { LAYOUT } from '@/shared/config/theme';
import {
  EmptyHint,
  Fab,
  FadeEdges,
  Muted,
  Screen,
  SectionHeader,
} from '@/shared/ui';
import { FamilyActivityFeedItem } from '@/widgets/family-activity-feed/FamilyActivityFeed';
import { FamilyGuardianDashboard } from '@/widgets/family-guardian-dashboard/FamilyGuardianDashboard';

/** 가족 — 보호자 대시보드 + 활동 피드 */
export function FamilyPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const familyId = profile?.familyId;
  const today = todayKstDateString();
  const isGuardian = profile?.role === 'guardian';
  const [inviteOpen, setInviteOpen] = useState(false);

  const {
    status: statusQuery,
    alerts: alertsQuery,
    feed: feedQuery,
  } = useFamilyScreenQueries({
    familyId,
    todayKst: today,
    isGuardian,
  });

  useFamilyFeedSubscription(familyId, qc);

  const ackMut = useAckFamilyAlertMutation();

  const members = statusQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];
  // 가족 탭에서는 본인 활동 제외 — 다른 가족 소식만
  const myUserId = profile?.id;
  const feed = (feedQuery.data ?? []).filter((item) => item.userId !== myUserId);

  return (
    <Screen>
      <FlatList
        data={feed}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="gap-2.5 px-5 pb-24 pt-4"
        ListHeaderComponent={
          <View className="gap-3 pb-2">
            <Muted>{formatDayLabel(today)} · 가족 안부</Muted>

            {isGuardian ? (
              <FamilyGuardianDashboard
                alerts={alerts}
                members={members}
                onAckAlert={(id) => ackMut.mutate(id)}
              />
            ) : null}

            <SectionHeader title="최근 소식" />
          </View>
        }
        ListEmptyComponent={
          <EmptyHint message="아직 소식이 없어요. 약을 체크하면 여기에 보여요." />
        }
        renderItem={({ item }) => <FamilyActivityFeedItem item={item} />}
      />

      {isGuardian ? (
        <>
          <FadeEdges
            top={LAYOUT.fade.top}
            bottom={LAYOUT.fade.bottomWithFab}
          />
          <Fab label="가족 초대" onPress={() => setInviteOpen(true)} />
          <FamilyInviteSheet
            visible={inviteOpen}
            onClose={() => setInviteOpen(false)}
          />
        </>
      ) : (
        <FadeEdges top={LAYOUT.fade.top} bottom={LAYOUT.fade.bottomPlain} />
      )}
    </Screen>
  );
}
