import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useMedicationAlarmQueries } from '@/entities/medication';
import {
  type AlarmMedItem,
  type AlarmSlotSource,
  resolveAlarmSlot,
} from '@/features/medication-notifications/lib/pendingAtTime';
import {
  cancelDisplayedMedicationNotifications,
  useMedicationAlarmTakeMutation,
} from '@/features/medication-notifications';
import { useAuth } from '@/providers/AuthProvider';
import { formatMedDose } from '@/shared/constants/medDoseUnits';
import { COLORS } from '@/shared/config/theme';
import { ACTIONS, COPY } from '@/shared/copy';
import { todayKstDateString } from '@/shared/lib/kst';
import {
  Button,
  Display,
  FadeEdges,
  Icons,
  KokiIllustration,
  PageTitle,
  Screen,
  Text,
  TitleLg,
  TitleXl,
  useScrollFadeEdges,
} from '@/shared/ui';
import { AlarmHeroSkeleton } from './AlarmHeroSkeleton';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseDoseAmountParam(raw: string): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

type MetaSize = 'hero' | 'row';

/** 용량 · 복용법 — 미들닷 한 줄 */
function MedDoseMeta({
  item,
  size = 'hero',
  align = 'center',
}: {
  item: AlarmMedItem;
  size?: MetaSize;
  align?: 'center' | 'left';
}) {
  const dose = formatMedDose(item.doseAmount, item.doseUnit);
  const method = item.useMethod?.trim() || null;
  if (!dose && !method) return null;

  const label = [dose, method].filter(Boolean).join(' · ');
  const alignCls = align === 'center' ? 'text-center' : 'text-left';
  const MetaText = size === 'hero' ? PageTitle : TitleLg;

  return (
    <MetaText className={alignCls} numberOfLines={size === 'hero' ? 3 : 2}>
      {label}
    </MetaText>
  );
}

function dismissAlarm() {
  if (router.canGoBack()) router.back();
  else router.replace('/(tabs)/home');
}

/** __DEV__ 다약 미리보기용 더미 — 실제 약 없을 때만 */
const PREVIEW_MULTI_ITEMS: AlarmMedItem[] = [
  {
    medicationId: -1,
    name: '혈압약',
    scheduledTime: '08:00',
    useMethod: '식후 30분',
    doseAmount: 1,
    doseUnit: 'tablet',
  },
  {
    medicationId: -2,
    name: '비타민D',
    scheduledTime: '08:00',
    useMethod: '하루 1회',
    doseAmount: 2,
    doseUnit: 'capsule',
  },
  {
    medicationId: -3,
    name: '오메가3',
    scheduledTime: '08:00',
    useMethod: '식후',
    doseAmount: 1,
    doseUnit: 'capsule',
  },
  {
    medicationId: -4,
    name: '당뇨약',
    scheduledTime: '08:00',
    useMethod: '식전 30분',
    doseAmount: 1,
    doseUnit: 'tablet',
  },
  {
    medicationId: -5,
    name: '위장약',
    scheduledTime: '08:00',
    useMethod: '식후 바로',
    doseAmount: 1,
    doseUnit: 'packet',
  },
  {
    medicationId: -6,
    name: '칼슘',
    scheduledTime: '08:00',
    useMethod: '자기 전',
    doseAmount: 1,
    doseUnit: 'tablet',
  },
];

/** 약 알림 탭/FSI → 풀페이지 복약 확인 */
export function MedicationAlarmPage() {
  const { profile } = useAuth();
  const params = useLocalSearchParams<{
    medicationId?: string | string[];
    name?: string | string[];
    scheduledTime?: string | string[];
    useMethod?: string | string[];
    doseAmount?: string | string[];
    doseUnit?: string | string[];
    previewMulti?: string | string[];
  }>();

  const paramMedicationId = Number(firstParam(params.medicationId));
  const paramName = firstParam(params.name);
  const paramScheduledTime = firstParam(params.scheduledTime);
  const paramUseMethod = firstParam(params.useMethod) || null;
  const paramDoseAmount = parseDoseAmountParam(firstParam(params.doseAmount));
  const paramDoseUnit = firstParam(params.doseUnit) || null;
  const previewMulti = firstParam(params.previewMulti) === '1';
  // mock 전용 로컬 체크 상태
  const [mockTakenIds, setMockTakenIds] = useState<Set<number>>(
    () => new Set(),
  );

  const userId = profile?.id;
  const today = todayKstDateString();

  // 실제 약 있으면 항상 hydrate (preview여도)
  const { meds: medsQuery, taken: takenQuery } = useMedicationAlarmQueries({
    userId,
    todayKst: today,
  });

  const queriesReady =
    !userId || (medsQuery.isSuccess && takenQuery.isSuccess);

  const fallbackItem = useMemo((): AlarmMedItem | null => {
    if (!Number.isFinite(paramMedicationId) || paramMedicationId <= 0) {
      return null;
    }
    return {
      medicationId: paramMedicationId,
      name: paramName || COPY.notif.doseTitle,
      scheduledTime: paramScheduledTime || '',
      useMethod: paramUseMethod,
      doseAmount: paramDoseAmount,
      doseUnit: paramDoseUnit,
    };
  }, [
    paramMedicationId,
    paramName,
    paramScheduledTime,
    paramUseMethod,
    paramDoseAmount,
    paramDoseUnit,
  ]);

  const resolved = useMemo((): {
    scheduledTime: string;
    items: AlarmMedItem[];
    source: AlarmSlotSource;
  } => {
    // 1) 서버 약 우선
    if (medsQuery.data && medsQuery.data.length > 0) {
      const slot = resolveAlarmSlot(medsQuery.data, {
        scheduledTime: paramScheduledTime || undefined,
        preferMulti: previewMulti,
      });
      if (slot && slot.items.length > 0) {
        return { ...slot, source: 'real' };
      }
    }

    // 2) DEV 다약 미리보기 — 실제 약 없을 때만 mock
    if (previewMulti) {
      return {
        scheduledTime: PREVIEW_MULTI_ITEMS[0]?.scheduledTime ?? '08:00',
        items: PREVIEW_MULTI_ITEMS,
        source: 'mock',
      };
    }

    // 3) 알림 payload 폴백 (orphan DEV 단약 등)
    if (fallbackItem) {
      return {
        scheduledTime: fallbackItem.scheduledTime,
        items: [fallbackItem],
        source: 'fallback',
      };
    }

    return { scheduledTime: '', items: [], source: 'empty' };
  }, [medsQuery.data, paramScheduledTime, previewMulti, fallbackItem]);

  const slotItems = resolved.items;
  const displayTime =
    resolved.scheduledTime ||
    paramScheduledTime ||
    slotItems[0]?.scheduledTime ||
    '';
  const isLocalOnly =
    resolved.source === 'mock' ||
    (resolved.source === 'fallback' &&
      !!fallbackItem &&
      !medsQuery.data?.some((m) => m.id === fallbackItem.medicationId));

  const take = useMedicationAlarmTakeMutation();
  const dismissedRef = useRef(false);
  // 다약 슬롯이면 체크리스트 유지 (1개만 남아도)
  const [keepChecklist, setKeepChecklist] = useState(false);

  useEffect(() => {
    if (slotItems.length > 1) setKeepChecklist(true);
  }, [slotItems.length]);

  // 풀페이지 진입 시 알림음/진동 끊기
  useEffect(() => {
    void cancelDisplayedMedicationNotifications();
  }, []);

  const isItemTaken = (medicationId: number): boolean => {
    if (isLocalOnly) return mockTakenIds.has(medicationId);
    return takenQuery.data?.has(medicationId) ?? false;
  };

  const uncheckedItems = useMemo(
    () => slotItems.filter((item) => !isItemTaken(item.medicationId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slotItems, mockTakenIds, takenQuery.data, isLocalOnly],
  );

  // 실데이터: 슬롯 비거나 전부 이미 복용이면 닫기.
  // (이전에 med 3 TAKEN인데 08:00 슬롯으로 열려 홈처럼 보임)
  useEffect(() => {
    if (!queriesReady || dismissedRef.current) return;
    if (isLocalOnly) return;
    if (slotItems.length === 0 || uncheckedItems.length === 0) {
      dismissedRef.current = true;
      dismissAlarm();
    }
  }, [queriesReady, isLocalOnly, slotItems.length, uncheckedItems.length]);

  const canInteract =
    !take.isPending &&
    (isLocalOnly || (!!profile?.id && !!profile.familyId));

  const onToggleOne = (medicationId: number) => {
    // 체크 완료분은 번복 불가
    if (isItemTaken(medicationId)) return;

    if (isLocalOnly) {
      setMockTakenIds((prev) => new Set(prev).add(medicationId));
      return;
    }

    if (!profile?.id || !profile.familyId) return;

    take.mutate(
      {
        userId: profile.id,
        familyId: profile.familyId,
        medicationIds: [medicationId],
        nickname: profile.nickname,
        currentlyTaken: false,
      },
      {
        onSuccess: () => {
          if (!keepChecklist) {
            dismissedRef.current = true;
            dismissAlarm();
          }
        },
      },
    );
  };

  const onTakeRemaining = () => {
    const ids = uncheckedItems.map((item) => item.medicationId);
    if (ids.length === 0) {
      dismissAlarm();
      return;
    }

    if (isLocalOnly) {
      setMockTakenIds(new Set(slotItems.map((item) => item.medicationId)));
      dismissedRef.current = true;
      dismissAlarm();
      return;
    }

    if (!profile?.id || !profile.familyId) return;

    take.mutate(
      {
        userId: profile.id,
        familyId: profile.familyId,
        medicationIds: ids,
        nickname: profile.nickname,
        currentlyTaken: false,
      },
      {
        onSuccess: () => {
          dismissedRef.current = true;
          dismissAlarm();
        },
      },
    );
  };

  const showChecklist = keepChecklist && slotItems.length >= 1;
  const primaryLabel = showChecklist
    ? COPY.notif.alarmTakeAll
    : COPY.notif.alarmTaken;

  const {
    showTopFade: listTopFade,
    showBottomFade: listBottomFade,
    onScroll: onListScroll,
    onScrollEnd: onListScrollEnd,
    onLayout: onListLayout,
    onContentSizeChange: onListContentSizeChange,
    scrollEventThrottle,
  } = useScrollFadeEdges();

  return (
    <Screen className="bg-canvas">
      {!queriesReady && !!userId ? (
        <AlarmHeroSkeleton showList />
      ) : (
      <View className="flex-1 justify-between px-6 py-8">
        <View className="items-center gap-3 pt-4">
          <TitleXl>{COPY.notif.alarmHeadline}</TitleXl>
          {displayTime ? <Display>{displayTime}</Display> : null}
          <KokiIllustration variant="pill" size={showChecklist ? 168 : 220} />
        </View>

        {showChecklist ? (
          <View className="relative mt-2 flex-1">
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-3 py-3"
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={scrollEventThrottle}
              onScroll={onListScroll}
              onScrollEndDrag={onListScrollEnd}
              onMomentumScrollEnd={onListScrollEnd}
              onLayout={onListLayout}
              onContentSizeChange={onListContentSizeChange}
            >
              {slotItems.map((item) => {
                const taken = isItemTaken(item.medicationId);
                return (
                  <Pressable
                    key={item.medicationId}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: taken, disabled: taken }}
                    accessibilityLabel={item.name}
                    disabled={!canInteract || taken}
                    onPress={() => onToggleOne(item.medicationId)}
                    className={`flex-row items-center gap-3 rounded-2xl px-4 py-4 ${
                      taken
                        ? 'bg-brand-soft'
                        : 'bg-surfaceSoft active:opacity-80'
                    }`}
                  >
                    <View className="flex-1 gap-1.5">
                      <TitleXl tone="text">{item.name}</TitleXl>
                      <MedDoseMeta item={item} size="row" align="left" />
                    </View>
                    {taken ? (
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-brand">
                        <Icons.Check
                          size={20}
                          color={COLORS.ink}
                          strokeWidth={2.5}
                        />
                      </View>
                    ) : (
                      <Icons.Circle
                        size={36}
                        color={COLORS.disabled}
                        strokeWidth={1.5}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
            <FadeEdges top={listTopFade} bottom={listBottomFade} />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center gap-3 px-2">
            {slotItems[0] ? (
              <>
                <Text role="hero" tone="text" className="text-center">
                  {slotItems[0].name}
                </Text>
                <MedDoseMeta item={slotItems[0]} size="hero" align="center" />
              </>
            ) : null}
          </View>
        )}

        <View className="gap-3 pb-4">
          <Button
            label={primaryLabel}
            shape="round"
            onPress={
              showChecklist
                ? onTakeRemaining
                : () => {
                    const id = slotItems[0]?.medicationId;
                    if (id != null) onToggleOne(id);
                  }
            }
            disabled={
              !canInteract || (showChecklist && uncheckedItems.length === 0)
            }
          />
          <Button
            label={ACTIONS.close}
            variant="ghost"
            onPress={dismissAlarm}
            disabled={take.isPending}
          />
        </View>
      </View>
      )}
    </Screen>
  );
}
