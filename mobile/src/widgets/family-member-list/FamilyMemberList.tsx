import { Pressable, Text } from 'react-native';
import type { FamilyMember } from '@/entities/family/model/types';
import { ROLE_LABEL } from '@/entities/user';
import { COPY } from '@/shared/copy';
import { Card, EmptyHint } from '@/shared/ui';

type Props = {
  members: FamilyMember[];
  onPressMember: (userId: string, nickname: string) => void;
};

/** 피보호자용: 다른 가족 프로필 목록 */
export function FamilyMemberList({ members, onPressMember }: Props) {
  if (members.length === 0) {
    return <EmptyHint message={COPY.family.emptyMembers} />;
  }

  return (
    <>
      {members.map((member) => (
        <Pressable
          key={member.userId}
          accessibilityRole="button"
          onPress={() => onPressMember(member.userId, member.nickname)}
        >
          <Card>
            <Text className="text-lg font-bold text-brand">
              {member.nickname}
            </Text>
            <Text className="mt-1 text-brand-muted">
              {ROLE_LABEL[member.role]}
            </Text>
          </Card>
        </Pressable>
      ))}
    </>
  );
}
