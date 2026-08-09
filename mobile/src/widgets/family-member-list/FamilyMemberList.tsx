import { Pressable } from 'react-native';
import type { FamilyMember } from '@/entities/family/model/types';
import { ROLE_LABEL } from '@/entities/user';
import { COPY } from '@/shared/copy';
import { Body, Card, Fallback, KokiIllustration, TitleLg } from '@/shared/ui';

type Props = {
  members: FamilyMember[];
  onPressMember: (userId: string, nickname: string) => void;
};

/** 피보호자용: 다른 가족 프로필 목록 */
export function FamilyMemberList({ members, onPressMember }: Props) {
  if (members.length === 0) {
    return (
      <Fallback
        image={<KokiIllustration variant="family" size={72} />}
        message={COPY.family.emptyMembers}
      />
    );
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
            <TitleLg>{member.nickname}</TitleLg>
            <Body className="mt-1">{ROLE_LABEL[member.role]}</Body>
          </Card>
        </Pressable>
      ))}
    </>
  );
}
