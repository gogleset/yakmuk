import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  feedDayReadsByDate,
  invalidateFamilyActivity,
  isFeedDayUnread,
  useFamilyFeedSubscription,
  useFamilyScreenQueries,
} from '@/entities/family';
import { useMarkFeedDayReadMutation } from '@/features/mark-feed-day-read';
import { familyMemberRoute } from '@/shared/config/routes';
import { todayKstDateString } from '@/shared/lib/kst';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  Fallback,
  KokiIllustration,
  Screen,
  ScreenSectionList,
  StackHeader,
} from '@/shared/ui';
import {
  FamilyActivityFeedStack,
  FeedListSkeleton,
  filterFamilyFeedLastDays,
  groupFamilyFeedByDate,
  type FamilyFeedSection,
} from '@/widgets/family-activity-feed';

/** 가족 최근 소식 전체 리스트 (최근 7일 · 날짜 그룹 · 일자 읽음) */
export function FamilyFeedPage() {
  const { profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const familyId = profile?.familyId;
  const today = todayKstDateString();
  const myUserId = profile?.id;
  const [refreshing, setRefreshing] = useState(false);
  const markReadMut = useMarkFeedDayReadMutation();

  const {
    feed: feedQuery,
    members: membersQuery,
    feedDayReads: feedDayReadsQuery,
  } = useFamilyScreenQueries({
    familyId,
    todayKst: today,
  });

  useFamilyFeedSubscription(familyId, qc);

  const readsByDate = useMemo(
    () => feedDayReadsByDate(feedDayReadsQuery.data ?? []),
    [feedDayReadsQuery.data],
  );

  /** 한 섹션에 날짜 스택들을 넣어 헤더/아이템 분리 없이 렌더 */
  const listSections = useMemo(() => {
    if (feedQuery.isError) return [{ data: [] as FamilyFeedSection[] }];
    const others = (feedQuery.data ?? []).filter(
      (item) => item.userId !== myUserId,
    );
    const week = filterFamilyFeedLastDays(
      others,
      today,
      LIMITS.familyFeedWindowDays,
    );
    return [{ data: groupFamilyFeedByDate(week, today) }];
  }, [feedQuery.data, feedQuery.isError, myUserId, today]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), invalidateFamilyActivity(qc)]);
    } finally {
      setRefreshing(false);
    }
  };

  const openMember = useCallback(
    (userId: string, nickname: string | null) => {
      if (!userId || userId === myUserId) return;
      const role =
        (membersQuery.data ?? []).find((m) => m.userId === userId)?.role ??
        null;
      router.push(familyMemberRoute(userId, nickname, role));
    },
    [membersQuery.data, myUserId],
  );

  const onDayOpened = useCallback(
    (dateYmd: string) => {
      if (!familyId) return;
      markReadMut.mutate({ familyId, logDate: dateYmd });
    },
    [familyId, markReadMut.mutate],
  );

  const dayUnread = useCallback(
    (section: FamilyFeedSection) => {
      if (section.data.length === 0) return false;
      let latest = section.data[0]!.createdAt;
      for (const item of section.data) {
        if (item.createdAt > latest) latest = item.createdAt;
      }
      return isFeedDayUnread({
        readAt: readsByDate.get(section.dateYmd),
        latestCreatedAt: latest,
      });
    },
    [readsByDate],
  );

  const renderItem = useCallback(
    ({ item }: { item: FamilyFeedSection }) => (
      <FamilyActivityFeedStack
        title={item.title}
        dateYmd={item.dateYmd}
        items={item.data}
        unread={dayUnread(item)}
        onItemPress={openMember}
        onDayOpened={onDayOpened}
      />
    ),
    [dayUnread, onDayOpened, openMember],
  );

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <StackHeader title={COPY.family.recentFeed} />

      <ScreenSectionList
        sections={listSections}
        keyExtractor={(item) => item.dateYmd}
        contentContainerClassName="gap-2.5 px-5 pb-10 pt-2"
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={COLORS.brand}
            colors={[COLORS.brand]}
          />
        }
        ListEmptyComponent={
          feedQuery.isLoading && !feedQuery.data ? (
            <View className="pt-2">
              <FeedListSkeleton />
            </View>
          ) : feedQuery.isError ? (
            <Fallback
              image={<KokiIllustration variant="thinking" size={96} />}
              message={COPY.family.loadFailedFeed}
              ctaLabel={COPY.common.retry}
              onCtaPress={() => void feedQuery.refetch()}
              fill
            />
          ) : (
            <Fallback
              image={<KokiIllustration variant="empty" size={96} />}
              message={COPY.family.emptyFeedMessage}
              fill
            />
          )
        }
        renderItem={renderItem}
      />
    </Screen>
  );
}
