import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useFamilyMembersQuery } from '@/entities/family/model/queries';
import { relationSubtitle, ROLE_LABEL } from '@/entities/user';
import { FamilyInvitePanel } from '@/features/family-invite';
import {
  useActiveRecoveryCodesQuery,
  useDeleteFamilyMutation,
  useFamilyInfoQuery,
  useRemoveFamilyMemberMutation,
  useReissueRecoveryCodeMutation,
  useUpdateFamilyNameMutation,
} from '@/features/family-ops';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS } from '@/shared/copy';
import {
  Body,
  BottomSheet,
  Button,
  Card,
  FadeInView,
  Icons,
  Input,
  Muted,
  PageTitle,
  Screen,
  SectionHeader,
} from '@/shared/ui';

/** 가족 운영 — 초대·멤버·이름·삭제 (설정 서브) */
export function SettingsFamilyPage() {
  const { profile, refreshProfile } = useAuth();
  const isLeader = profile?.role === 'family_leader';
  const familyId = profile?.familyId;

  const familyQuery = useFamilyInfoQuery(familyId);
  const membersQuery = useFamilyMembersQuery(familyId);
  const recoveryQuery = useActiveRecoveryCodesQuery(isLeader);
  const updateFamilyName = useUpdateFamilyNameMutation(familyId);
  const removeMember = useRemoveFamilyMemberMutation(familyId);
  const reissueRecovery = useReissueRecoveryCodeMutation();
  const deleteFamilyMut = useDeleteFamilyMutation(refreshProfile);

  const [familyNameDraft, setFamilyNameDraft] = useState('');
  const [recoverySheet, setRecoverySheet] = useState<{
    nickname: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    if (familyQuery.data?.name) setFamilyNameDraft(familyQuery.data.name);
  }, [familyQuery.data?.name]);

  const leaderNickname =
    (membersQuery.data ?? []).find((m) => m.role === 'family_leader')
      ?.nickname ?? profile?.nickname;

  const otherMembers = (membersQuery.data ?? []).filter(
    (m) => m.userId !== profile?.id,
  );

  const onSaveFamilyName = () => {
    const trimmed = familyNameDraft.trim();
    if (!trimmed || trimmed === familyQuery.data?.name) return;
    updateFamilyName.mutate(trimmed);
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

  const onRecovery = (userId: string, nickname: string) => {
    Alert.alert(
      '복구 코드를 발급할까요?',
      `${nickname} 님이 새 기기에서 이 코드로 다시 들어오면 약·기록이 유지돼요. 기존 기기 세션은 끊겨요.`,
      [
        { text: ACTIONS.cancel, style: 'cancel' },
        {
          text: '발급',
          onPress: () => {
            reissueRecovery.mutate(userId, {
              onSuccess: (rec) => {
                setRecoverySheet({
                  nickname,
                  code: rec.inviteCode,
                });
              },
            });
          },
        },
      ],
    );
  };

  const onShareRecovery = async () => {
    if (!recoverySheet) return;
    try {
      await Share.share({
        message: `${recoverySheet.nickname} 복구 코드: ${recoverySheet.code}\n새 기기에서 초대코드로 참여해 주세요.`,
      });
    } catch {
      /* 사용자가 공유 취소 */
    }
  };

  const onDeleteFamily = () => {
    Alert.alert(
      '가족을 삭제할까요?',
      '모든 멤버·초대·기록이 삭제되고 되돌릴 수 없어요.',
      [
        { text: ACTIONS.cancel, style: 'cancel' },
        {
          text: ACTIONS.delete,
          style: 'destructive',
          onPress: () => {
            void deleteFamilyMut.mutateAsync().then(() => {
              router.replace(ROUTES.welcome);
            });
          },
        },
      ],
    );
  };

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <View className="flex-row items-center gap-2 px-5 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={LAYOUT.hitSlop.md}
          onPress={() => router.back()}
          className="p-1"
        >
          <Icons.ChevronLeft size={LAYOUT.icon.lg} color={COLORS.brand} />
        </Pressable>
        <PageTitle className="flex-1">가족</PageTitle>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3 px-5 pb-10 pt-2"
      >
        <FadeInView className="gap-3">
          {/* 가족 이름 */}
          <SectionHeader title="가족 이름" />
          {isLeader ? (
            <Card className="gap-2 p-4">
              <Input
                value={familyNameDraft}
                onChangeText={setFamilyNameDraft}
                placeholder="가족 이름"
                maxLength={LIMITS.familyNameMaxLength}
              />
              <Button
                label={
                  updateFamilyName.isPending ? '저장 중…' : '가족 이름 저장'
                }
                variant="outline"
                disabled={
                  updateFamilyName.isPending ||
                  !familyNameDraft.trim() ||
                  familyNameDraft.trim() === familyQuery.data?.name
                }
                onPress={onSaveFamilyName}
              />
            </Card>
          ) : (
            <Card className="gap-1.5 p-4">
              <Text className="text-base font-bold text-brand">
                {familyQuery.data?.name ?? '이름 없음'}
              </Text>
            </Card>
          )}

          {isLeader ? (
            <>
              <SectionHeader title="초대" />
              <FamilyInvitePanel isLeader={isLeader} />

              {otherMembers.length > 0 ? (
                <>
                  <SectionHeader title="멤버" />
                  <Card className="gap-2 p-4">
                    {otherMembers.map((member) => {
                      const sub = relationSubtitle(
                        member.invitedAs,
                        leaderNickname,
                      );
                      const activeCode = (recoveryQuery.data ?? []).find(
                        (r) => r.userId === member.userId,
                      );
                      return (
                        <View
                          key={member.userId}
                          className="gap-1 py-2"
                        >
                          <View className="flex-row items-center justify-between gap-2">
                            <View className="flex-1">
                              <Text className="font-bold text-brand">
                                {member.nickname}
                              </Text>
                              <Muted className="text-xs">
                                {ROLE_LABEL[member.role]}
                                {sub ? ` · ${sub}` : ''}
                              </Muted>
                              {activeCode ? (
                                <Muted className="mt-0.5 text-xs">
                                  복구 대기 · {activeCode.inviteCode}
                                </Muted>
                              ) : null}
                            </View>
                            <View className="items-end gap-1">
                              <Pressable
                                accessibilityRole="button"
                                onPress={() =>
                                  onRecovery(member.userId, member.nickname)
                                }
                              >
                                <Muted className="text-xs underline">
                                  복구 코드
                                </Muted>
                              </Pressable>
                              <Pressable
                                accessibilityRole="button"
                                onPress={() =>
                                  onKick(member.userId, member.nickname)
                                }
                              >
                                <Text className="text-xs text-destructive">
                                  내보내기
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </Card>
                </>
              ) : null}

              <SectionHeader title="삭제" />
              <Button
                label="가족 삭제"
                variant="destructive"
                disabled={deleteFamilyMut.isPending}
                onPress={onDeleteFamily}
              />
            </>
          ) : null}
        </FadeInView>
      </ScrollView>

      <BottomSheet
        visible={!!recoverySheet}
        title="복구 코드"
        onClose={() => setRecoverySheet(null)}
      >
        {recoverySheet ? (
          <View className="gap-3">
            <Body className="text-sm">
              {recoverySheet.nickname} 님이 새 기기에서 이 코드로 들어오면
              약·기록이 유지돼요.
            </Body>
            <Text
              className="py-2 text-center text-3xl font-bold text-brand"
              style={{ letterSpacing: LIMITS.inviteCodeLetterSpacing }}
            >
              {recoverySheet.code}
            </Text>
            <Button
              label="공유하기"
              icon={Icons.Share}
              onPress={() => void onShareRecovery()}
            />
            <Button
              label="닫기"
              variant="outline"
              onPress={() => setRecoverySheet(null)}
            />
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}
