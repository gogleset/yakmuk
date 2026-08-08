import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useFamilyMembersQuery } from '@/entities/family/model/queries';
import { relationSubtitle, ROLE_LABEL } from '@/entities/user';
import { FamilyInvitePanel } from '@/features/family-invite';
import {
  useDeleteFamilyMutation,
  useFamilyInfoQuery,
  useRemoveFamilyMemberMutation,
  useUpdateFamilyNameMutation,
} from '@/features/family-ops';
import { ROUTES } from '@/shared/config/routes';
import { LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS } from '@/shared/copy';
import {
  Button,
  Card,
  FadeInView,
  Input,
  Muted,
  Screen,
  ScreenScrollView,
  SectionHeader,
  StackHeader,
} from '@/shared/ui';
import { MemberListRowSkeleton } from '@/widgets/family-manage-skeleton';

/** 가족 운영 — 초대·멤버·이름·삭제 (가족 탭 서브) */
export function FamilyManagePage() {
  const { profile, refreshProfile } = useAuth();
  const isLeader = profile?.role === 'family_leader';
  const familyId = profile?.familyId;

  const familyQuery = useFamilyInfoQuery(familyId);
  const membersQuery = useFamilyMembersQuery(familyId);
  const updateFamilyName = useUpdateFamilyNameMutation(familyId);
  const removeMember = useRemoveFamilyMemberMutation(familyId);
  const deleteFamilyMut = useDeleteFamilyMutation(refreshProfile);

  const [familyNameDraft, setFamilyNameDraft] = useState('');

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
      <StackHeader title="가족" tone="brand" />

      <ScreenScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3 px-5 pb-10 pt-2"
      >
        <FadeInView className="gap-3">
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

              {membersQuery.isLoading && !membersQuery.data ? (
                <>
                  <SectionHeader title="멤버" />
                  <Card className="gap-2 p-4">
                    <MemberListRowSkeleton rows={2} />
                  </Card>
                </>
              ) : otherMembers.length > 0 ? (
                <>
                  <SectionHeader title="멤버" />
                  <Card className="gap-2 p-4">
                    {otherMembers.map((member) => {
                      const sub = relationSubtitle(
                        member.invitedAs,
                        leaderNickname,
                      );
                      return (
                        <View key={member.userId} className="gap-1 py-2">
                          <View className="flex-row items-center justify-between gap-2">
                            <View className="flex-1">
                              <Text className="font-bold text-brand">
                                {member.nickname}
                              </Text>
                              <Muted className="text-xs">
                                {ROLE_LABEL[member.role]}
                                {sub ? ` · ${sub}` : ''}
                              </Muted>
                            </View>
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
      </ScreenScrollView>
    </Screen>
  );
}
