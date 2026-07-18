import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type {
  FamilyInvite,
  InviteTargetRole,
} from '@/entities/user/model/types';
import { useFamilyInvitesQuery } from '@/entities/user/model/queries';
import { ROLE_LABEL } from '@/entities/user';
import { useFamilyInviteMutations } from '@/features/family-invite/model/useFamilyInviteMutations';
import { joinDeepLink } from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS, COPY, ERRORS } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import {
  BottomSheet,
  Button,
  Card,
  Caption,
  Icons,
  Input,
  Muted,
} from '@/shared/ui';

const QR_SIZE = 88;

type Props = {
  /** 가족장만 초대 UI 노출 — page에서 주입 */
  isLeader: boolean;
};

/** 가족장 설정: 초대 슬롯 2x2 */
export function FamilyInvitePanel({ isLeader }: Props) {
  const invitesQuery = useFamilyInvitesQuery({ enabled: isLeader });
  const { createInvite, deleteInvite, reissueInvite } =
    useFamilyInviteMutations();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<InviteTargetRole>('guardian');
  const [invitedAs, setInvitedAs] = useState('');

  if (!isLeader) return null;

  const invites = invitesQuery.data ?? [];
  const ordered = [...invites].reverse().slice(0, LIMITS.maxFamilyInvites);
  const emptyCount = Math.max(
    0,
    LIMITS.maxFamilyInvites - ordered.length,
  );
  const slots: (FamilyInvite | null)[] = [
    ...ordered,
    ...Array.from({ length: emptyCount }, () => null),
  ];

  const rows: (FamilyInvite | null)[][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    rows.push(slots.slice(i, i + 2));
  }

  const closeSheet = () => {
    setSheetOpen(false);
    setTargetRole('guardian');
    setInvitedAs('');
  };

  const onDelete = (invite: FamilyInvite) => {
    if (invite.claimedBy) {
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
    if (invite.claimedBy) return;
    Alert.alert(COPY.invite.reissueTitle, COPY.invite.reissueBody, [
      { text: ACTIONS.cancel, style: 'cancel' },
      {
        text: ACTIONS.reissue,
        onPress: () => reissueInvite.mutate(invite.id),
      },
    ]);
  };

  const onOpenCreate = () => {
    if (invites.length >= LIMITS.maxFamilyInvites) {
      Alert.alert(COPY.invite.limitTitle, ERRORS.invite.limitReached);
      return;
    }
    setSheetOpen(true);
  };

  const onCreate = () => {
    const trimmed = invitedAs.trim();
    if (!trimmed) {
      Alert.alert(COPY.invite.labelAlertTitle, COPY.invite.labelAlertBody);
      return;
    }

    createInvite.mutate(
      { invitedAs: trimmed, targetRole },
      {
        onSuccess: () => closeSheet(),
      },
    );
  };

  return (
    <>
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
                        onDelete={() => onDelete(slot)}
                        onReissue={() => onReissue(slot)}
                        deleting={deleteInvite.isPending}
                        reissuing={reissueInvite.isPending}
                      />
                    ) : (
                      <EmptySlot
                        busy={createInvite.isPending && !sheetOpen}
                        onPress={onOpenCreate}
                      />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </Card>

      <BottomSheet
        visible={sheetOpen}
        title="초대코드 발급"
        onClose={closeSheet}
      >
        <View className="gap-3">
          <View className="gap-2">
            <Caption>역할</Caption>
            <View className="flex-row gap-2">
              {(
                [
                  { role: 'guardian' as const },
                  { role: 'care_recipient' as const },
                ] as const
              ).map((opt) => {
                const selected = targetRole === opt.role;
                return (
                  <Pressable
                    key={opt.role}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setTargetRole(opt.role)}
                    className={cn(
                      'flex-1 items-center rounded-xl py-3.5',
                      selected ? 'bg-brand' : 'bg-surface',
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        selected ? 'text-ink' : 'text-brand',
                      )}
                    >
                      {ROLE_LABEL[opt.role]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-2">
            <Caption>닉네임</Caption>
            <Input
              value={invitedAs}
              onChangeText={setInvitedAs}
              placeholder="예: 아빠, 할머니"
              maxLength={LIMITS.nicknameMaxLength}
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>

          <Button
            label={createInvite.isPending ? '발급 중…' : '초대코드 발급'}
            disabled={createInvite.isPending || !invitedAs.trim()}
            icon={Icons.QrCode}
            onPress={() => void onCreate()}
          />
        </View>
      </BottomSheet>
    </>
  );
}

type InviteSlotProps = {
  invite: FamilyInvite;
  onDelete: () => void;
  onReissue: () => void;
  deleting: boolean;
  reissuing: boolean;
};

function InviteSlot({
  invite,
  onDelete,
  onReissue,
  deleting,
  reissuing,
}: InviteSlotProps) {
  const claimed = !!invite.claimedBy;

  return (
    <View className="items-center gap-1.5 rounded-xl bg-brand-soft p-2.5">
      <View className="w-full flex-row items-center justify-between gap-1">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-brand" numberOfLines={1}>
            {invite.invitedAs}
          </Text>
          <Muted className="text-xs">
            {ROLE_LABEL[invite.targetRole]}
          </Muted>
        </View>
        {!claimed ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="초대 삭제"
            hitSlop={LAYOUT.hitSlop.sm}
            disabled={deleting}
            onPress={onDelete}
          >
            <Icons.X size={LAYOUT.icon.sm} color={COLORS.destructive} />
          </Pressable>
        ) : null}
      </View>

      <Text className="text-base font-bold tracking-widest text-brand">
        {invite.inviteCode}
      </Text>
      <QRCode value={joinDeepLink(invite.inviteCode)} size={QR_SIZE} />
      {claimed ? (
        <Muted className="text-xs">연결됨</Muted>
      ) : (
        <>
          <Muted className="text-xs">대기</Muted>
          <Pressable
            accessibilityRole="button"
            disabled={reissuing}
            onPress={onReissue}
          >
            <Muted className="text-xs underline">코드 재발급</Muted>
          </Pressable>
        </>
      )}
    </View>
  );
}

type EmptySlotProps = {
  busy: boolean;
  onPress: () => void;
};

function EmptySlot({ busy, onPress }: EmptySlotProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="초대 추가"
      disabled={busy}
      onPress={onPress}
      className="min-h-[168px] items-center justify-center gap-2 rounded-xl bg-brand-soft p-2.5"
    >
      {busy ? (
        <ActivityIndicator color={COLORS.brand} />
      ) : (
        <>
          <Icons.Plus size={LAYOUT.icon.xl} color={COLORS.muted} />
          <Muted className="text-xs">초대 추가</Muted>
        </>
      )}
    </Pressable>
  );
}
