import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  invalidateFamilyActivity,
  useFamilyFeedSubscription,
  useFamilyScreenQueries,
} from '@/entities/family';
import { useAckFamilyAlertMutation } from '@/features/ack-family-alert';
import { useFamilyInfoQuery } from '@/features/family-ops';
import { familyMemberRoute, ROUTES } from '@/shared/config/routes';
import { formatFriendlyDate } from '@/shared/lib/format';
import { todayKstDateString } from '@/shared/lib/kst';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  FadeInView,
  Fallback,
  KokiIllustration,
  Screen,
  ScreenScrollView,
} from '@/shared/ui';
import {
  FamilyActivityFeedStack,
  filterFamilyFeedLastDays,
  groupFamilyFeedByDate,
  sliceFamilyFeedSections,
} from '@/widgets/family-activity-feed';
import {
  FAMILY_ALERT_UI_MOCK,
  FamilyCareAlertCarousel,
  mapFamilyAlertsToSlides,
  MOCK_CARE_ALERTS,
} from '@/widgets/family-care-alert';
import { FamilyWeeklyDigestCard } from '@/widgets/family-weekly-digest';
import { useFamilyWeeklyDigestCard } from '@/features/care-weekly-digest';
import {
  FamilyFeedSectionHeader,
  FamilyGuardianDashboard,
  FamilyTabHeader,
} from '@/widgets/family-guardian-dashboard';

/** UI 확인용 — true면 가족 그리드·최근 소식 empty 강제 */
const FAMILY_TAB_EMPTY_UI_PREVIEW = false;

/** 가족 — 케어 알림 · 가족 그리드 · 최근 소식 프리뷰 */
export function FamilyPage() {
  const { profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const familyId = profile?.familyId;
  const today = todayKstDateString();
  const myUserId = profile?.id;
  const isLeader = profile?.role === 'family_leader';
  const [refreshing, setRefreshing] = useState(false);
  /** mock ack — 슬라이드 id 로컬 제거 */
  const [dismissedMockIds, setDismissedMockIds] = useState<string[]>([]);

  const {
    status: statusQuery,
    alerts: alertsQuery,
    feed: feedQuery,
    members: membersQuery,
  } = useFamilyScreenQueries({
    familyId,
    todayKst: today,
  });

  const familyInfoQuery = useFamilyInfoQuery(familyId);

  useFamilyFeedSubscription(familyId, qc);

  const ackMut = useAckFamilyAlertMutation();

  const weekly = useFamilyWeeklyDigestCard({
    familyId,
    todayKst: today,
    role: profile?.role,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), invalidateFamilyActivity(qc)]);
    } finally {
      setRefreshing(false);
    }
  };

  const statusMembers = FAMILY_TAB_EMPTY_UI_PREVIEW
    ? []
    : (statusQuery.data ?? []).filter((member) => member.userId !== myUserId);
  const alerts = (alertsQuery.data ?? []).filter(
    (alert) => alert.userId !== myUserId,
  );

  const careSlides = useMemo(() => {
    if (FAMILY_ALERT_UI_MOCK) {
      return MOCK_CARE_ALERTS.filter(
        (slide) => !dismissedMockIds.includes(slide.id),
      );
    }
    return mapFamilyAlertsToSlides(alerts);
  }, [alerts, dismissedMockIds]);

  const feedSections = useMemo(() => {
    if (FAMILY_TAB_EMPTY_UI_PREVIEW) return [];
    const others = (feedQuery.data ?? []).filter(
      (item) => item.userId !== myUserId,
    );
    const week = filterFamilyFeedLastDays(
      others,
      today,
      LIMITS.familyFeedWindowDays,
    );
    return groupFamilyFeedByDate(week, today);
  }, [feedQuery.data, myUserId, today]);

  const feedCount = feedSections.reduce((n, s) => n + s.data.length, 0);
  const feedPreviewSections = sliceFamilyFeedSections(
    feedSections,
    LIMITS.familyFeedPreviewCount,
  );
  const hasMembers = statusMembers.length > 0;
  // 프리뷰: 멤버 empty여도 최근 소식 empty 같이 노출
  const showFeedSection = hasMembers || FAMILY_TAB_EMPTY_UI_PREVIEW;

  const sectionTitle =
    familyInfoQuery.data?.name?.trim() || COPY.family.todayStatusFallback;

  const openMember = (userId: string, nickname: string | null) => {
    if (!userId || userId === myUserId) return;
    const role =
      (membersQuery.data ?? []).find((m) => m.userId === userId)?.role ?? null;
    router.push(familyMemberRoute(userId, nickname, role));
  };

  const openFeed = () => {
    router.push(ROUTES.familyFeed);
  };

  const openFamilyManage = () => {
    router.push(ROUTES.familyManage);
  };

  const onAckCareAlert = (slideId: string) => {
    if (FAMILY_ALERT_UI_MOCK) {
      setDismissedMockIds((prev) =>
        prev.includes(slideId) ? prev : [...prev, slideId],
      );
      return;
    }
    ackMut.mutate(slideId);
  };

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <ScreenScrollView
        contentContainerClassName="gap-3 px-5 pb-10 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={COLORS.brand}
            colors={[COLORS.brand]}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        <FadeInView className="gap-3">
          <FamilyTabHeader
            dateLabel={formatFriendlyDate(today)}
            onBellPress={() => router.push(ROUTES.settings)}
          />

          <FamilyCareAlertCarousel
            slides={careSlides}
            onAck={onAckCareAlert}
          />

          {weekly.visible && weekly.digest ? (
            <FamilyWeeklyDigestCard
              digest={weekly.digest}
              onAck={weekly.onAck}
            />
          ) : null}

          <FamilyGuardianDashboard
            members={statusMembers}
            sectionTitle={sectionTitle}
            showInviteCta={isLeader}
            onPressMember={openMember}
            onInviteCtaPress={openFamilyManage}
            onManagePress={isLeader ? openFamilyManage : undefined}
          />

          {showFeedSection ? (
            <View className="gap-2.5">
              <FamilyFeedSectionHeader
                feedCount={feedCount}
                onPress={openFeed}
              />
              {feedCount === 0 ? (
                <Fallback
                  image={<KokiIllustration variant="cheer" size={96} />}
                  message={COPY.family.emptyFeedMessage}
                />
              ) : (
                <View className="gap-2.5">
                  {feedPreviewSections.map((section) => (
                    <FamilyActivityFeedStack
                      key={section.dateYmd}
                      title={section.title}
                      items={section.data}
                      onItemPress={openMember}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </FadeInView>
      </ScreenScrollView>
    </Screen>
  );
}
