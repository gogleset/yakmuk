import { View } from 'react-native';
import type { InvitePeek } from '@/entities/user/api/peek-invite';
import { ROLE_LABEL } from '@/entities/user';
import { COPY } from '@/shared/copy';
import { Body, Caption, KokiIllustration, SectionTitle } from '@/shared/ui';

type Props = {
  peek: InvitePeek;
};

/** 초대코드 peek 성공 시 가족 프리뷰 카드 */
export function FamilyPeekCard({ peek }: Props) {
  const title = COPY.join.familyOf(peek.leaderNickname || '가족장');
  const members =
    peek.memberNicknames.length > 0
      ? peek.memberNicknames.join(' · ')
      : peek.invitedAs ||
        ROLE_LABEL[peek.targetRole as 'guardian' | 'care_recipient'] ||
        '';

  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-surface-soft px-3.5 py-3">
      <KokiIllustration variant="family" size={56} />
      <View className="min-w-0 flex-1 gap-0.5">
        <SectionTitle tone="text" numberOfLines={1}>
          {title}
        </SectionTitle>
        {members ? (
          <Body className="text-sm" numberOfLines={2}>
            {members}
          </Body>
        ) : null}
        {peek.kind === 'recovery' ? (
          <Caption>{COPY.join.recoveryHint}</Caption>
        ) : null}
      </View>
    </View>
  );
}
