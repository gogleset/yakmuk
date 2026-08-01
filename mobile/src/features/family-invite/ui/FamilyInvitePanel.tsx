import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { router } from 'expo-router';
import type { FamilyInvite } from '@/entities/user/model/types';
import { useFamilyInvitesQuery } from '@/entities/user/model/queries';
import { ROLE_LABEL } from '@/entities/user';
import { useFamilyInviteMutations } from '@/features/family-invite/model/useFamilyInviteMutations';
import { joinDeepLink, ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS, COPY, ERRORS } from '@/shared/copy';
import { Card, Icons, Muted } from '@/shared/ui';

const QR_SIZE = 88;

type Props = {
  isLeader: boolean;
};

/** 가족장: 초대 슬롯 — dots로 재발급/삭제 */
export function FamilyInvitePanel({ isLeader }: Props) {
  const invitesQuery = useFamilyInvitesQuery({ enabled: isLeader });
  const { deleteInvite, reissueInvite } = useFamilyInviteMutations();

  if (!isLeader) return null;

  const invites = invitesQuery.data ?? [];
  const ordered = [...invites].reverse().slice(0, LIMITS.maxFamilyInvites);
  const emptyCount = Math.max(0, LIMITS.maxFamilyInvites - ordered.length);
  const slots: (FamilyInvite | null)[] = [
    ...ordered,
    ...Array.from({ length: emptyCount }, () => null),
  ];

  const rows: (FamilyInvite | null)[][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push(slots.slice(i, i + 2));
  }

  const onOpenCreate = () => {
    if (invites.length >= LIMITS.maxFamilyInvites) {
      Alert.alert(COPY.invite.limitTitle, ERRORS.invite.limitReached);
      return;
    }
    router.push(ROUTES.inviteCreate);
  };

  const onDelete = (invite: FamilyInvite) => {
    if (invite.claimedBy || invite.reentryUserId) {
      Alert.alert(
        COPY.invite.claimedCannotDeleteTitle,
        COPY.invite.claimedCannotDeleteBody,
      );
      return;
    }
    Alert.alert(
      COPY.invite.deleteTitle,
      `${invite.invitedAs} · ${invite.inviteCode}`,
      [
        { text: ACTIONS.cancel, style: 'cancel' },
        {
          text: ACTIONS.delete,
          style: 'destructive',
          onPress: () => deleteInvite.mutate(invite.id),
        },
      ],
    );
  };

  const onReissue = (invite: FamilyInvite) => {
    const connected = !!invite.claimedBy || !!invite.reentryUserId;
    Alert.alert(
      COPY.invite.reissueTitle,
      connected
        ? COPY.invite.reissueConnectedBody
        : COPY.invite.reissueBody,
      [
        { text: ACTIONS.cancel, style: 'cancel' },
        {
          text: ACTIONS.reissue,
          onPress: () => reissueInvite.mutate(invite.id),
        },
      ],
    );
  };

  const onSlotMenu = (invite: FamilyInvite) => {
    const canDelete = !invite.claimedBy && !invite.reentryUserId;
    Alert.alert(invite.invitedAs, undefined, [
      {
        text: COPY.invite.reissueAction,
        onPress: () => onReissue(invite),
      },
      ...(canDelete
        ? [
            {
              text: ACTIONS.delete,
              style: 'destructive' as const,
              onPress: () => onDelete(invite),
            },
          ]
        : []),
      { text: ACTIONS.cancel, style: 'cancel' },
    ]);
  };

  return (
    <Card className="gap-3 p-4">
      <View className="flex-row items-center gap-2">
        <Icons.QrCode size={LAYOUT.icon.md} color={COLORS.brand} />
        <Text className="text-base font-bold text-brand">가족 초대</Text>
        <Muted className="text-xs">
          {invites.length}/{LIMITS.maxFamilyInvites}
        </Muted>
      </View>

      {invitesQuery.isLoading ? (
        <ActivityIndicator color={COLORS.brand} className="my-6" />
      ) : (
        <View className="gap-2.5">
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2.5">
              {row.map((slot, colIndex) => (
                <View key={colIndex} className="flex-1">
                  {slot ? (
                    <InviteSlot
                      invite={slot}
                      onMenu={() => onSlotMenu(slot)}
                      menuDisabled={
                        deleteInvite.isPending || reissueInvite.isPending
                      }
                    />
                  ) : (
                    <EmptySlot onPress={onOpenCreate} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

type InviteSlotProps = {
  invite: FamilyInvite;
  onMenu: () => void;
  menuDisabled: boolean;
};

function InviteSlot({ invite, onMenu, menuDisabled }: InviteSlotProps) {
  const claimed = !!invite.claimedBy;
  const reentry = !!invite.reentryUserId;

  let statusLabel: string = COPY.invite.statusWaiting;
  if (claimed) statusLabel = COPY.invite.statusConnected;
  else if (reentry) statusLabel = COPY.invite.statusReentry;

  return (
    <View className="items-center gap-1.5 rounded-xl bg-brand-soft p-2.5">
      <View className="w-full flex-row items-start justify-between gap-1">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-brand" numberOfLines={1}>
            {invite.invitedAs}
          </Text>
          <Muted className="text-xs">{ROLE_LABEL[invite.targetRole]}</Muted>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="초대 메뉴"
          hitSlop={LAYOUT.hitSlop.sm}
          disabled={menuDisabled}
          onPress={onMenu}
          className="pt-0.5"
        >
          <Icons.EllipsisVertical size={LAYOUT.icon.sm} color={COLORS.muted} />
        </Pressable>
      </View>

      <Text className="text-base font-bold tracking-widest text-brand">
        {invite.inviteCode}
      </Text>
      <QRCode value={joinDeepLink(invite.inviteCode)} size={QR_SIZE} />
      <Muted className="text-xs">{statusLabel}</Muted>
    </View>
  );
}

function EmptySlot({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="초대 추가"
      onPress={onPress}
      className="min-h-[168px] items-center justify-center gap-2 rounded-xl bg-brand-soft p-2.5"
    >
      <Icons.Plus size={LAYOUT.icon.xl} color={COLORS.muted} />
      <Muted className="text-xs">초대 추가</Muted>
    </Pressable>
  );
}
