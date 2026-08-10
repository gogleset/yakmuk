import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useFamilyMembersQuery,
  useFamilyRosterSubscription,
} from '@/entities/family/model/queries';
import { FamilySeatGrid } from '@/features/family-invite';
import {
  useFamilyInfoQuery,
  useRemoveFamilyMemberMutation,
  useUpdateFamilyNameMutation,
} from '@/features/family-ops';
import { LAYOUT, LIMITS } from '@/shared/config/theme';
import { ACTIONS, COPY } from '@/shared/copy';
import {
  Button,
  Card,
  FadeInView,
  Input,
  Screen,
  ScreenScrollView,
  SectionTitle,
  StackHeader,
} from '@/shared/ui';
import { MemberListRowSkeleton } from '@/widgets/family-manage-skeleton';

/** 가족 운영 — 이름 · 자리표 */
export function FamilyManagePage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const isLeader = profile?.role === 'family_leader';
  const familyId = profile?.familyId;

  const familyQuery = useFamilyInfoQuery(familyId);
  const membersQuery = useFamilyMembersQuery(familyId);
  useFamilyRosterSubscription(familyId, qc);
  const updateFamilyName = useUpdateFamilyNameMutation(familyId);
  const removeMember = useRemoveFamilyMemberMutation(familyId);

  const [familyNameDraft, setFamilyNameDraft] = useState('');

  useEffect(() => {
    if (familyQuery.data?.name) setFamilyNameDraft(familyQuery.data.name);
  }, [familyQuery.data?.name]);

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

  const members = membersQuery.data ?? [];

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <StackHeader title={COPY.family.manageTitle} tone="brand" />

      <ScreenScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-4 px-5 pb-6 pt-2"
      >
        <FadeInView step={0} className="gap-4">
          {isLeader ? (
            <Card className="gap-2 rounded-2xl p-4">
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
            <Card className="gap-1.5 rounded-2xl p-4">
              <SectionTitle>
                {familyQuery.data?.name ?? '이름 없음'}
              </SectionTitle>
            </Card>
          )}

          {membersQuery.isLoading && !membersQuery.data ? (
            <Card className="gap-2 rounded-2xl p-4">
              <MemberListRowSkeleton rows={2} />
            </Card>
          ) : (
            <FamilySeatGrid
              isLeader={isLeader}
              members={members}
              onKick={onKick}
            />
          )}
        </FadeInView>
      </ScreenScrollView>
    </Screen>
  );
}
