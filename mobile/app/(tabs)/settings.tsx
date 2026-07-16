import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useSignOutMutation } from '@/features/guardian-auth';
import { ensureNotificationPermission } from '@/features/medication-notifications';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { ROLE_LABEL } from '@/shared/lib/format';
import {
  Body,
  Button,
  Card,
  Icons,
  Muted,
  PageTitle,
  Screen,
} from '@/shared/ui';

export default function SettingsScreen() {
  const { profile } = useAuth();
  const signOut = useSignOutMutation();

  const onSignOut = async () => {
    await signOut.mutateAsync();
    router.replace(ROUTES.welcome);
  };

  const onNotifPermission = async () => {
    const ok = await ensureNotificationPermission();
    Alert.alert(
      '알림',
      ok
        ? '약 먹을 시간에 알려드릴 수 있어요'
        : '알림을 켜 주시면 약 시간을 알려드릴게요',
    );
  };

  return (
    <Screen className="gap-3 p-5">
      <PageTitle>설정</PageTitle>

      <Card className="gap-1.5">
        <View className="flex-row items-center gap-2">
          <Icons.Shield size={LAYOUT.icon.md} color={COLORS.brand} />
          <Text className="text-base font-bold text-brand">
            {profile?.nickname ?? '이름 없음'}
          </Text>
        </View>
        <Body>
          {profile?.role ? ROLE_LABEL[profile.role] : '역할 없음'}
        </Body>
        <Muted className="text-xs">
          {profile?.familyId ? '가족에 연결되어 있어요' : '가족이 아직 없어요'}
        </Muted>
      </Card>

      <Button
        label="약 알림 설정 확인"
        variant="outline"
        icon={Icons.Radio}
        onPress={() => void onNotifPermission()}
      />

      <View className="flex-1" />

      <Button
        label="로그아웃"
        variant="destructive"
        icon={Icons.LogOut}
        onPress={() => void onSignOut()}
      />
    </Screen>
  );
}
