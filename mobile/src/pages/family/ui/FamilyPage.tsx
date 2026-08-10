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
import { useFamilyWeeklyDigestCard } from '@/features/care-weekly-digest';
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
  FeedPreviewSkeleton,
  filterFamilyFeedLastDays,
  groupFamilyFeedByDate,
  sliceFamilyFeedSections,
} from '@/widgets/family-activity-feed';
import {
  CareAlertSkeleton,
  FAMILY_ALERT_UI_MOCK,
  FamilyCareAlertCarousel,
  mapFamilyAlertsToSlides,
  MOCK_CARE_ALERTS,
} from '@/widgets/family-care-alert';
import {
  FamilyWeeklyDigestCard,
  WeeklyDigestSkeleton,
} from '@/widgets/family-weekly-digest';
import {
  FamilyFeedSectionHeader,
  FamilyGuardianDashboard,
  FamilyTabHeader,
  MemberGridSkeleton,
} from '@/widgets/family-guardian-dashboard';

/** UI 확인용 — true면 가족 그리드·최근 소식 empty 강제 */
const FAMILY_TAB_EMPTY_UI_PREVIEW = false;

/** UI 확인용 — true면 알림·주간·그리드·피드 스켈레톤 강제 */
const FAMILY_TAB_SKELETON_UI_PREVIEW = false;

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

  const statusLoading =
    FAMILY_TAB_SKELETON_UI_PREVIEW ||
    (statusQuery.isLoading &&
      !FAMILY_TAB_EMPTY_UI_PREVIEW &&
      !statusQuery.data);
  const alertsLoading =
    FAMILY_TAB_SKELETON_UI_PREVIEW ||
    (alertsQuery.isLoading && !FAMILY_ALERT_UI_MOCK && !alertsQuery.data);
  const feedLoading =
    FAMILY_TAB_SKELETON_UI_PREVIEW ||
    (feedQuery.isLoading && !feedQuery.data);

  const statusMembers = FAMILY_TAB_EMPTY_UI_PREVIEW
    ? []
    : statusQuery.isError
      ? []
      : (statusQuery.data ?? []).filter((member) => member.userId !== myUserId);
  const alerts = alertsQuery.isError
    ? []
    : (alertsQuery.data ?? []).filter((alert) => alert.userId !== myUserId);

  const careSlides = useMemo(() => {
    if (FAMILY_ALERT_UI_MOCK) {
      return MOCK_CARE_ALERTS.filter(
        (slide) => !dismissedMockIds.includes(slide.id),
      );
    }
    return mapFamilyAlertsToSlides(alerts);
  }, [alerts, dismissedMockIds]);

  const feedSections = useMemo(() => {
    if (FAMILY_TAB_EMPTY_UI_PREVIEW || feedQuery.isError) return [];
    const others = (feedQuery.data ?? []).filter(
      (item) => item.userId !== myUserId,
    );
    const week = filterFamilyFeedLastDays(
      others,
      today,
      LIMITS.familyFeedWindowDays,
    );
    return groupFamilyFeedByDate(week, today);
  }, [feedQuery.data, feedQuery.isError, myUserId, today]);

  const feedCount = feedSections.reduce((n, s) => n + s.data.length, 0);
  const feedPreviewSections = sliceFamilyFeedSections(
    feedSections,
    LIMITS.familyFeedPreviewCount,
  );
  const hasMembers = statusMembers.length > 0;
  // 로딩 중에도 피드 자리 예약 (empty cheer 깜빡임 방지)
  const showFeedSection =
    statusLoading ||
    hasMembers ||
    FAMILY_TAB_EMPTY_UI_PREVIEW ||
    feedQuery.isError;

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

          {alertsQuery.isError && !FAMILY_ALERT_UI_MOCK ? (
            <Fallback
              image={<KokiIllustration variant="thinking" size={72} />}
              message={COPY.family.loadFailedAlerts}
              ctaLabel={COPY.common.retry}
              onCtaPress={() => void alertsQuery.refetch()}
            />
          ) : alertsLoading ? (
            <CareAlertSkeleton />
          ) : (
            <FamilyCareAlertCarousel
              slides={careSlides}
              onAck={onAckCareAlert}
            />
          )}

          {FAMILY_TAB_SKELETON_UI_PREVIEW || weekly.showSkeleton ? (
            <WeeklyDigestSkeleton />
          ) : weekly.visible && weekly.digest ? (
            <FamilyWeeklyDigestCard
              digest={weekly.digest}
              onAck={weekly.onAck}
            />
          ) : null}

          {statusLoading ? (
            <MemberGridSkeleton />
          ) : (
            <FamilyGuardianDashboard
              members={statusMembers}
              sectionTitle={sectionTitle}
              showInviteCta={isLeader}
              onPressMember={openMember}
              onInviteCtaPress={openFamilyManage}
              onManagePress={isLeader ? openFamilyManage : undefined}
              isError={statusQuery.isError && !FAMILY_TAB_EMPTY_UI_PREVIEW}
              onRetry={() => void statusQuery.refetch()}
            />
          )}

          {showFeedSection ? (
            <View className="gap-2.5">
              {feedLoading || statusLoading ? (
                <FeedPreviewSkeleton />
              ) : (
                <>
                  <FamilyFeedSectionHeader
                    feedCount={feedCount}
                    onPress={openFeed}
                  />
                  {feedQuery.isError ? (
                    <Fallback
                      image={<KokiIllustration variant="thinking" size={96} />}
                      message={COPY.family.loadFailedFeed}
                      ctaLabel={COPY.common.retry}
                      onCtaPress={() => void feedQuery.refetch()}
                    />
                  ) : feedCount === 0 ? (
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
                </>
              )}
            </View>
          ) : null}
        </FadeInView>
      </ScreenScrollView>
    </Screen>
  );
}
