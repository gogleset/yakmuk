import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  invalidateFamilyActivity,
  useFamilyFeedSubscription,
  useFamilyScreenQueries,
} from '@/entities/family';
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
  filterFamilyFeedLastDays,
  groupFamilyFeedByDate,
  type FamilyFeedSection,
} from '@/widgets/family-activity-feed';

/** 가족 최근 소식 전체 리스트 (최근 7일 · 날짜 그룹) */
export function FamilyFeedPage() {
  const { profile, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const familyId = profile?.familyId;
  const today = todayKstDateString();
  const myUserId = profile?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { feed: feedQuery, members: membersQuery } = useFamilyScreenQueries({
    familyId,
    todayKst: today,
  });

  useFamilyFeedSubscription(familyId, qc);

  /** 한 섹션에 날짜 스택들을 넣어 헤더/아이템 분리 없이 렌더 */
  const listSections = useMemo(() => {
    const others = (feedQuery.data ?? []).filter(
      (item) => item.userId !== myUserId,
    );
    const week = filterFamilyFeedLastDays(
      others,
      today,
      LIMITS.familyFeedWindowDays,
    );
    return [{ data: groupFamilyFeedByDate(week, today) }];
  }, [feedQuery.data, myUserId, today]);

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

  const renderItem = useCallback(
    ({ item }: { item: FamilyFeedSection }) => (
      <FamilyActivityFeedStack
        title={item.title}
        items={item.data}
        onItemPress={openMember}
      />
    ),
    [openMember],
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
          <Fallback
            image={<KokiIllustration variant="cheer" size={96} />}
            message={COPY.family.emptyFeedMessage}
            fill
          />
        }
        renderItem={renderItem}
      />
    </Screen>
  );
}
