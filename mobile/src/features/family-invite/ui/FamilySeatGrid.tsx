import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import type { FamilyMember } from '@/entities/family/model/types';
import type { FamilyInvite } from '@/entities/user/model/types';
import { ROLE_LABEL } from '@/entities/user';
import { useFamilyInvitesQuery } from '@/entities/user/model/queries';
import { buildFamilySeats } from '@/features/family-invite/lib/buildFamilySeats';
import type { FamilySeat } from '@/features/family-invite/lib/buildFamilySeats';
import { useFamilyInviteMutations } from '@/features/family-invite/model/useFamilyInviteMutations';
import { seatColorFromLabel } from '@/features/family-invite/lib/seatColorFromLabel';
import { FacePlaceholder } from '@/features/family-invite/ui/FacePlaceholder';
import { InviteListSkeleton } from '@/features/family-invite/ui/InviteListSkeleton';
import {
  ROUTES,
  familyMemberRoute,
  inviteDetailRoute,
} from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS, COPY, ERRORS } from '@/shared/copy';
import {
  Body,
  FadeInView,
  Icons,
  LabelMd,
  PressableScale,
  TitleLg,
} from '@/shared/ui';

/** 상단 이름 카드·헤더·패딩 대략 여유 — 나머지 세로를 3행에 분배 */
const SEAT_VERTICAL_RESERVE = 220;
const SEAT_ROW_GAP = 10;
const SEAT_MIN_H = 132;
/** 가족 탭 가로 슬라이드 */
const SEAT_CAROUSEL_H = 148;
const SEAT_CAROUSEL_GAP = 10;

type Props = {
  isLeader: boolean;
  members: FamilyMember[];
  onKick: (userId: string, nickname: string) => void;
  /** fill=2열 그리드 · carousel=가로 슬라이드(가족 탭) */
  layout?: 'fill' | 'carousel';
};

type MenuTarget =
  | { kind: 'member'; seat: Extract<FamilySeat, { kind: 'member' }> }
  | { kind: 'pending'; invite: FamilyInvite };

type MenuAction = {
  key: string;
  label: string;
  tone?: 'destructive';
  onPress: () => void;
};

/** 가족 자리표 — 칸 탭 이동 · ⋯ 인라인 팝업(Modal 없음) */
export function FamilySeatGrid({
  isLeader,
  members,
  onKick,
  layout = 'fill',
}: Props) {
  const { width: windowW, height: windowH } = useWindowDimensions();
  const isCarousel = layout === 'carousel';
  const seatH = isCarousel
    ? SEAT_CAROUSEL_H
    : Math.max(
        SEAT_MIN_H,
        Math.floor((windowH - SEAT_VERTICAL_RESERVE - SEAT_ROW_GAP * 2) / 3),
      );
  const seatW = isCarousel
    ? Math.min(168, Math.max(140, Math.floor(windowW * 0.4)))
    : undefined;
  const faceSize = isCarousel ? 56 : 80;
  const seatGapClass = isCarousel
    ? 'gap-1.5 px-2 py-3'
    : 'gap-3 px-2.5 py-4';

  const invitesQuery = useFamilyInvitesQuery({ enabled: isLeader });
  const { deleteInvite, reissueInvite } = useFamilyInviteMutations();
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);

  const invites = isLeader ? (invitesQuery.data ?? []) : [];
  const seats = buildFamilySeats({
    members,
    invites,
    maxSeats: LIMITS.maxFamilyInvites,
  });

  const rows: FamilySeat[][] = [];
  if (!isCarousel) {
    for (let i = 0; i < seats.length; i += 2) {
      rows.push(seats.slice(i, i + 2));
    }
  }

  const closeMenu = useCallback(() => setMenuTarget(null), []);

  const onOpenCreate = () => {
    if (!isLeader) return;
    if (invites.length >= LIMITS.maxFamilyInvites) {
      Alert.alert(COPY.invite.limitTitle, ERRORS.invite.limitReached);
      return;
    }
    router.push(ROUTES.inviteCreate);
  };

  const runReissue = (inviteId: string, connected: boolean) => {
    closeMenu();
    Alert.alert(
      COPY.invite.reissueTitle,
      connected
        ? COPY.invite.reissueConnectedBody
        : COPY.invite.reissueBody,
      [
        { text: ACTIONS.cancel, style: 'cancel' },
        {
          text: ACTIONS.reissue,
          onPress: () => reissueInvite.mutate(inviteId),
        },
      ],
    );
  };

  const runDeleteInvite = (invite: FamilyInvite) => {
    if (invite.claimedBy || invite.reentryUserId) {
      closeMenu();
      Alert.alert(
        COPY.invite.claimedCannotDeleteTitle,
        COPY.invite.claimedCannotDeleteBody,
      );
      return;
    }
    closeMenu();
    Alert.alert(COPY.invite.deleteTitle, `${invite.invitedAs}`, [
      { text: ACTIONS.cancel, style: 'cancel' },
      {
        text: ACTIONS.delete,
        style: 'destructive',
        onPress: () => deleteInvite.mutate(invite.id),
      },
    ]);
  };

  const runKick = (userId: string, nickname: string) => {
    closeMenu();
    onKick(userId, nickname);
  };

  const openMember = (seat: Extract<FamilySeat, { kind: 'member' }>) => {
    closeMenu();
    router.push(
      familyMemberRoute(seat.userId, seat.nickname, seat.role),
    );
  };

  const openPendingDetail = (invite: FamilyInvite) => {
    closeMenu();
    router.push(inviteDetailRoute(invite.id));
  };

  const menuActions: MenuAction[] = (() => {
    if (!menuTarget) return [];
    if (menuTarget.kind === 'member') {
      const { seat } = menuTarget;
      const actions: MenuAction[] = [];
      if (seat.inviteId) {
        actions.push({
          key: 'reissue',
          label: COPY.invite.reissueAction,
          onPress: () => runReissue(seat.inviteId!, true),
        });
      }
      actions.push({
        key: 'kick',
        label: ACTIONS.export,
        tone: 'destructive',
        onPress: () => runKick(seat.userId, seat.nickname),
      });
      return actions;
    }
    const { invite } = menuTarget;
    const canDelete = !invite.claimedBy && !invite.reentryUserId;
    const actions: MenuAction[] = [
      {
        key: 'reissue',
        label: COPY.invite.reissueAction,
        onPress: () =>
          runReissue(invite.id, !!invite.claimedBy || !!invite.reentryUserId),
      },
    ];
    if (canDelete) {
      actions.push({
        key: 'delete',
        label: ACTIONS.delete,
        tone: 'destructive',
        onPress: () => runDeleteInvite(invite),
      });
    }
    return actions;
  })();

  const openMenuKey =
    menuTarget?.kind === 'member'
      ? `m:${menuTarget.seat.userId}`
      : menuTarget?.kind === 'pending'
        ? `p:${menuTarget.invite.id}`
        : null;

  if (isLeader && invitesQuery.isLoading && !invitesQuery.data) {
    return <InviteListSkeleton />;
  }

  const renderSeat = (seat: FamilySeat, key: string, step: number) => {
    const wrapClass = seatW != null ? undefined : 'flex-1';
    const wrapStyle = seatW != null ? { width: seatW } : undefined;
    return (
      <FadeInView key={key} step={step} className={wrapClass} style={wrapStyle}>
        {seat.kind === 'empty' ? (
          <EmptySeat
            height={seatH}
            canAdd={isLeader}
            onPress={onOpenCreate}
            disabled={deleteInvite.isPending || reissueInvite.isPending}
          />
        ) : seat.kind === 'member' ? (
          <MemberSeat
            height={seatH}
            faceSize={faceSize}
            contentClassName={seatGapClass}
            seat={seat}
            canMenu={isLeader}
            menuOpen={openMenuKey === `m:${seat.userId}`}
            menuActions={
              openMenuKey === `m:${seat.userId}` ? menuActions : []
            }
            onPress={() => openMember(seat)}
            onOpenMenu={() => setMenuTarget({ kind: 'member', seat })}
            onCloseMenu={closeMenu}
          />
        ) : (
          <PendingSeat
            height={seatH}
            faceSize={faceSize}
            contentClassName={seatGapClass}
            seat={seat}
            canMenu={isLeader}
            menuOpen={openMenuKey === `p:${seat.invite.id}`}
            menuActions={
              openMenuKey === `p:${seat.invite.id}` ? menuActions : []
            }
            menuDisabled={deleteInvite.isPending || reissueInvite.isPending}
            onPress={() => openPendingDetail(seat.invite)}
            onOpenMenu={() =>
              setMenuTarget({ kind: 'pending', invite: seat.invite })
            }
            onCloseMenu={closeMenu}
          />
        )}
      </FadeInView>
    );
  };

  return (
    <View className="relative">
      {menuTarget ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="메뉴 닫기"
          onPress={closeMenu}
          className="absolute inset-0 z-20"
        />
      ) : null}

      {isCarousel ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={seatW! + SEAT_CAROUSEL_GAP}
          snapToAlignment="start"
          contentContainerStyle={{
            gap: SEAT_CAROUSEL_GAP,
            paddingLeft: 20,
            paddingRight: 20,
          }}
          className="z-0 -mx-5"
        >
          {seats.map((seat, index) =>
            renderSeat(seat, `${seat.kind}-${index}`, Math.min(2, index)),
          )}
        </ScrollView>
      ) : (
        <View className="z-0 gap-2.5">
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2.5">
              {row.map((seat, colIndex) =>
                renderSeat(
                  seat,
                  `${seat.kind}-${rowIndex}-${colIndex}`,
                  Math.min(2, rowIndex),
                ),
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function SeatMenuPopup({
  visible,
  actions,
}: {
  visible: boolean;
  actions: MenuAction[];
}) {
  if (!visible || actions.length === 0) return null;
  return (
    <View
      style={LAYOUT.shadow.sameFill}
      className="absolute right-0 top-8 z-30 min-w-[148px] overflow-hidden rounded-xl bg-surface py-1"
    >
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          onPress={action.onPress}
          className="px-3.5 py-2.5"
        >
          <LabelMd
            tone={action.tone === 'destructive' ? 'destructive' : 'text'}
          >
            {action.label}
          </LabelMd>
        </Pressable>
      ))}
    </View>
  );
}

function MemberSeat({
  seat,
  canMenu,
  menuOpen,
  menuActions,
  onPress,
  onOpenMenu,
  onCloseMenu,
  height,
  faceSize,
  contentClassName,
}: {
  seat: Extract<FamilySeat, { kind: 'member' }>;
  canMenu: boolean;
  menuOpen: boolean;
  menuActions: MenuAction[];
  onPress: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  height: number;
  faceSize: number;
  contentClassName: string;
}) {
  const title = seat.invitedAs?.trim() || seat.nickname;
  const color = seatColorFromLabel(title);
  return (
    <View
      style={{
        height,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: color.border,
      }}
      className="overflow-visible rounded-2xl"
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        className={`h-full items-center justify-center ${contentClassName}`}
      >
        <FacePlaceholder
          variant="solid"
          size={faceSize}
          accentHex={color.border}
        />
        <TitleLg
          numberOfLines={1}
          tone={false}
          className="text-center"
          style={{ color: color.hex }}
        >
          {title}
        </TitleLg>
        <LabelMd
          tone={false}
          className="text-center"
          style={{ color: color.hex }}
        >
          {ROLE_LABEL[seat.role]}
        </LabelMd>
      </PressableScale>
      {canMenu ? (
        <View className="absolute right-2 top-2 z-30">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메뉴"
            hitSlop={LAYOUT.hitSlop.sm}
            onPress={() => {
              if (menuOpen) onCloseMenu();
              else onOpenMenu();
            }}
            className="p-1"
          >
            <Icons.EllipsisVertical size={LAYOUT.icon.md} color={color.hex} />
          </Pressable>
          <SeatMenuPopup visible={menuOpen} actions={menuActions} />
        </View>
      ) : null}
    </View>
  );
}

function PendingSeat({
  seat,
  canMenu,
  menuOpen,
  menuActions,
  onPress,
  onOpenMenu,
  onCloseMenu,
  menuDisabled,
  height,
  faceSize,
  contentClassName,
}: {
  seat: Extract<FamilySeat, { kind: 'pending' }>;
  canMenu: boolean;
  menuOpen: boolean;
  menuActions: MenuAction[];
  onPress: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  menuDisabled: boolean;
  height: number;
  faceSize: number;
  contentClassName: string;
}) {
  const status =
    seat.pendingKind === 'reentry'
      ? COPY.invite.statusReentry
      : COPY.invite.statusWaiting;
  const color = seatColorFromLabel(seat.invite.invitedAs);
  return (
    <View
      style={{
        height,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: color.border,
      }}
      className="overflow-visible rounded-2xl"
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${seat.invite.invitedAs}, ${status}`}
        onPress={onPress}
        className={`h-full items-center justify-center ${contentClassName}`}
      >
        <FacePlaceholder
          variant="dashed"
          size={faceSize}
          accentHex={color.border}
        />
        <TitleLg
          numberOfLines={1}
          tone={false}
          className="text-center"
          style={{ color: color.hex }}
        >
          {seat.invite.invitedAs}
        </TitleLg>
        <Body
          tone={false}
          className="text-center text-sm"
          style={{ color: color.hex }}
        >
          {status}
        </Body>
      </PressableScale>
      {canMenu ? (
        <View className="absolute right-2 top-2 z-30">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="메뉴"
            hitSlop={LAYOUT.hitSlop.sm}
            disabled={menuDisabled}
            onPress={() => {
              if (menuOpen) onCloseMenu();
              else onOpenMenu();
            }}
            className="p-1"
          >
            <Icons.EllipsisVertical size={LAYOUT.icon.md} color={color.hex} />
          </Pressable>
          <SeatMenuPopup visible={menuOpen} actions={menuActions} />
        </View>
      ) : null}
    </View>
  );
}

function EmptySeat({
  canAdd,
  onPress,
  disabled,
  height,
}: {
  canAdd: boolean;
  onPress: () => void;
  disabled: boolean;
  height: number;
}) {
  if (!canAdd) {
    return (
      <View
        style={{ height }}
        className="items-center justify-center rounded-2xl border border-dashed border-brand/25 bg-surface px-2.5 py-4 opacity-40"
      />
    );
  }
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={COPY.family.seatAddA11y}
      disabled={disabled}
      onPress={onPress}
      style={{ height }}
      className="items-center justify-center rounded-2xl border border-dashed border-brand/30 bg-surface px-2.5 py-4"
    >
      <Icons.Plus size={40} color={COLORS.brand} />
    </PressableScale>
  );
}
