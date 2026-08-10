import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  feedDayReadsByDate,
  hasUnreadFeedDays,
  invalidateFamilyActivity,
  isFeedDayUnread,
  useFamilyFeedSubscription,
  useFamilyRosterSubscription,
  useFamilyScreenQueries,
} from '@/entities/family';
import { useAckFamilyAlertMutation } from '@/features/ack-family-alert';
import { useFamilyWeeklyDigestCard } from '@/features/care-weekly-digest';
import {
  useFamilyInfoQuery,
  useRemoveFamilyMemberMutation,
} from '@/features/family-ops';
import { useMarkFeedDayReadMutation } from '@/features/mark-feed-day-read';
import { familyMemberRoute, ROUTES } from '@/shared/config/routes';
import { formatFriendlyDate } from '@/shared/lib/format';
import { todayKstDateString } from '@/shared/lib/kst';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS, COPY } from '@/shared/copy';
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
import { FamilySeatGrid } from '@/features/family-invite';
import {
  FamilyFeedSectionHeader,
  FamilyRosterEmpty,
  FamilyRosterSectionHeader,
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
    alerts: alertsQuery,
    feed: feedQuery,
    members: membersQuery,
    feedDayReads: feedDayReadsQuery,
  } = useFamilyScreenQueries({
    familyId,
    todayKst: today,
  });

  const familyInfoQuery = useFamilyInfoQuery(familyId);
  const removeMember = useRemoveFamilyMemberMutation(familyId);

  useFamilyFeedSubscription(familyId, qc);
  useFamilyRosterSubscription(familyId, qc);

  const ackMut = useAckFamilyAlertMutation();
  const markReadMut = useMarkFeedDayReadMutation();

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

  const membersLoading =
    FAMILY_TAB_SKELETON_UI_PREVIEW ||
    (membersQuery.isLoading &&
      !FAMILY_TAB_EMPTY_UI_PREVIEW &&
      !membersQuery.data);
  const alertsLoading =
    FAMILY_TAB_SKELETON_UI_PREVIEW ||
    (alertsQuery.isLoading && !FAMILY_ALERT_UI_MOCK && !alertsQuery.data);
  const feedLoading =
    FAMILY_TAB_SKELETON_UI_PREVIEW ||
    (feedQuery.isLoading && !feedQuery.data);

  const rosterMembers = FAMILY_TAB_EMPTY_UI_PREVIEW
    ? []
    : membersQuery.isError
      ? []
      : (membersQuery.data ?? []);
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

  /** 벨 뱃지용 — 최근 N일 */
  const weekFeedSections = useMemo(() => {
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

  /** 탭 프리뷰 — 오늘만 */
  const feedSections = useMemo(() => {
    if (FAMILY_TAB_EMPTY_UI_PREVIEW || feedQuery.isError) return [];
    const others = (feedQuery.data ?? []).filter(
      (item) => item.userId !== myUserId,
    );
    const todayOnly = filterFamilyFeedLastDays(others, today, 1);
    return groupFamilyFeedByDate(todayOnly, today);
  }, [feedQuery.data, feedQuery.isError, myUserId, today]);

  const hasUnreadFeed = useMemo(() => {
    if (feedDayReadsQuery.isError) return false;
    return hasUnreadFeedDays(
      weekFeedSections,
      feedDayReadsByDate(feedDayReadsQuery.data ?? []),
    );
  }, [
    feedDayReadsQuery.data,
    feedDayReadsQuery.isError,
    weekFeedSections,
  ]);

  const readsByDate = useMemo(
    () => feedDayReadsByDate(feedDayReadsQuery.data ?? []),
    [feedDayReadsQuery.data],
  );

  const isSectionUnread = useCallback(
    (dateYmd: string, data: { createdAt: string }[]) => {
      if (data.length === 0) return false;
      let latest = data[0]!.createdAt;
      for (const item of data) {
        if (item.createdAt > latest) latest = item.createdAt;
      }
      return isFeedDayUnread({
        readAt: readsByDate.get(dateYmd),
        latestCreatedAt: latest,
      });
    },
    [readsByDate],
  );

  const feedCount = feedSections.reduce((n, s) => n + s.data.length, 0);
  const feedPreviewSections = sliceFamilyFeedSections(
    feedSections,
    LIMITS.familyFeedPreviewCount,
  );
  const hasMembers = rosterMembers.some((m) => m.role !== 'family_leader');
  const familyEmpty =
    !membersLoading &&
    !FAMILY_TAB_EMPTY_UI_PREVIEW &&
    !membersQuery.isError &&
    !hasMembers &&
    !isLeader;
  // 로딩 중에도 피드 자리 예약 (empty cheer 깜빡임 방지)
  const showFeedSection =
    !familyEmpty &&
    (membersLoading ||
      hasMembers ||
      FAMILY_TAB_EMPTY_UI_PREVIEW ||
      feedQuery.isError);

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

  const onKick = (userId: string, nickname: string) => {
    Alert.alert(
      '멤버를 내보낼까요?',
      `${nickname} 님은 가족에서 빠지고, 약·기록도 함께 삭제돼요.`,
      [
        { text: ACTIONS.cancel, style: 'cancel' },
        {
          text: ACTIONS.export,
          style: 'destructive',
          onPress: () => removeMember.mutate(userId),
        },
      ],
    );
  };

  const onDayOpened = useCallback(
    (dateYmd: string) => {
      if (!familyId) return;
      markReadMut.mutate({ familyId, logDate: dateYmd });
    },
    [familyId, markReadMut.mutate],
  );

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
        contentContainerClassName={
          familyEmpty
            ? 'min-h-full flex-grow gap-3 px-5 pb-10 pt-2'
            : 'gap-3 px-5 pb-10 pt-2'
        }
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
        <FadeInView className={familyEmpty ? 'min-h-full flex-1 gap-3' : 'gap-3'}>
          <FamilyTabHeader
            dateLabel={formatFriendlyDate(today)}
            hasUnread={hasUnreadFeed}
            onBellPress={openFeed}
          />

          {!familyEmpty &&
            (alertsQuery.isError && !FAMILY_ALERT_UI_MOCK ? (
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
            ))}

          {!familyEmpty &&
            (FAMILY_TAB_SKELETON_UI_PREVIEW || weekly.showSkeleton ? (
              <WeeklyDigestSkeleton />
            ) : weekly.visible && weekly.digest ? (
              <FamilyWeeklyDigestCard
                digest={weekly.digest}
                onAck={weekly.onAck}
              />
            ) : null)}

          {membersLoading ? (
            <MemberGridSkeleton />
          ) : membersQuery.isError && !FAMILY_TAB_EMPTY_UI_PREVIEW ? (
            <FamilyRosterEmpty
              isError
              onRetry={() => void membersQuery.refetch()}
            />
          ) : !hasMembers && !isLeader ? (
            <FamilyRosterEmpty />
          ) : (
            <View className="gap-2.5">
              <FamilyRosterSectionHeader sectionTitle={sectionTitle} />
              <FamilySeatGrid
                layout="carousel"
                isLeader={isLeader}
                members={rosterMembers}
                onKick={onKick}
              />
            </View>
          )}

          {showFeedSection ? (
            <View className="gap-2.5">
              {feedLoading || membersLoading ? (
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
                      image={<KokiIllustration variant="empty" size={96} />}
                      message={COPY.family.emptyFeedMessage}
                    />
                  ) : (
                    <View className="gap-2.5">
                      {feedPreviewSections.map((section) => (
                        <FamilyActivityFeedStack
                          key={section.dateYmd}
                          title={section.title}
                          dateYmd={section.dateYmd}
                          items={section.data}
                          unread={isSectionUnread(
                            section.dateYmd,
                            section.data,
                          )}
                          onItemPress={openMember}
                          onDayOpened={onDayOpened}
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
