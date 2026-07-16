import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useCareRecipientJoinMutation } from '@/features/care-recipient-join';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import {
  Body,
  Button,
  Icons,
  Input,
  PageTitle,
  Screen,
} from '@/shared/ui';

/** 가족: 초대코드만 입력 */
export default function JoinScreen() {
  const { refreshProfile } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState('');
  const join = useCareRecipientJoinMutation();

  useEffect(() => {
    if (params.code) setCode(String(params.code).toUpperCase());
  }, [params.code]);

  const onJoin = async () => {
    try {
      await join.mutateAsync(code);
      await refreshProfile();
      router.replace(ROUTES.home);
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  return (
    <Screen className="justify-center gap-3 px-6">
      <View className="flex-row items-center gap-2">
        <Icons.QrCode size={LAYOUT.icon.xl} color={COLORS.brand} />
        <PageTitle className="text-[28px]">초대코드 입력</PageTitle>
      </View>
      <Body>
        보호자가 알려준 6자리 코드를 입력하면 바로 연결돼요. 이름 입력은 필요
        없어요.
      </Body>
      <Input
        className="p-4 text-center text-2xl tracking-[6px]"
        autoCapitalize="characters"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholder="ABCDEF"
      />
      <Button
        label={join.isPending ? '연결 중…' : '참여하기'}
        disabled={join.isPending || code.trim().length !== 6}
        icon={Icons.Check}
        onPress={() => void onJoin()}
      />
      <Button label="뒤로" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
