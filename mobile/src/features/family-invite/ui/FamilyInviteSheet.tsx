import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/providers/AuthProvider';
import { useCareInvitesQuery } from '@/entities/user/model/queries';
import { useFamilyInviteMutations } from '@/features/family-invite/model/useFamilyInviteMutations';
import { joinDeepLink } from '@/shared/config/routes';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import {
  Badge,
  Body,
  Button,
  Card,
  EmptyHint,
  Icons,
  Input,
  PageSheet,
} from '@/shared/ui';

type Props = {
  visible: boolean;
  onClose: () => void;
};

/** 보호자: 가족 초대 발급 */
export function FamilyInviteSheet({ visible, onClose }: Props) {
  const { profile, refreshProfile } = useAuth();
  const [nickname, setNickname] = useState('엄마');

  const invitesQuery = useCareInvitesQuery({
    enabled: visible && profile?.role === 'guardian',
  });

  const { ensureFamily, createInvite } = useFamilyInviteMutations({
    guardianNickname: profile?.nickname ?? '보호자',
    refreshProfile,
  });

  const invites = invitesQuery.data ?? [];

  return (
    <PageSheet
      visible={visible}
      title="가족 초대"
      onClose={onClose}
      headerIcon={
        <Icons.UserPlus size={LAYOUT.icon.lg} color={COLORS.brand} />
      }
    >
      <ScrollView contentContainerClassName="gap-3 px-5 pb-8">
        <Body>
          부를 이름을 정한 뒤 초대코드나 QR을 보내세요. 가족은 코드만 입력하면
          됩니다.
        </Body>

        {!profile?.familyId ? (
          <Button
            label="가족 공간 만들기"
            icon={Icons.Home}
            onPress={() => ensureFamily.mutate()}
          />
        ) : (
          <>
            <Input
              value={nickname}
              onChangeText={setNickname}
              placeholder="예: 엄마, 아빠"
            />
            <Button
              label="초대코드 만들기"
              icon={Icons.QrCode}
              onPress={() => createInvite.mutate(nickname.trim() || '가족')}
            />

            {invites.length === 0 ? (
              <EmptyHint message="아직 만든 초대가 없어요" />
            ) : (
              invites.map((invite) => (
                <Card key={invite.id} className="items-center gap-2 p-4">
                  <Text className="text-[28px] font-bold tracking-widest text-brand">
                    {invite.inviteCode}
                  </Text>
                  <Text className="text-brand-muted">
                    {invite.nickname}님 초대
                  </Text>
                  <QRCode
                    value={joinDeepLink(invite.inviteCode)}
                    size={140}
                  />
                  {invite.claimedBy ? (
                    <Badge label="연결됨" variant="soft" />
                  ) : (
                    <Badge label="기다리는 중" variant="warning" />
                  )}
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </PageSheet>
  );
}
