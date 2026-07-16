import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCreateFamilyMutation,
  useGuardianSignInDevMutation,
  useGuardianSignInOAuthMutation,
} from '@/features/guardian-auth';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Body, Button, Icons, Input, SectionTitle } from '@/shared/ui';

export default function WelcomeScreen() {
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('guardian@yakmuk.local');
  const [password, setPassword] = useState('yakmuk-dev-123');

  const signInDev = useGuardianSignInDevMutation();
  const signInOAuth = useGuardianSignInOAuthMutation();
  const createFamily = useCreateFamilyMutation(refreshProfile);
  const busy =
    signInDev.isPending || signInOAuth.isPending || createFamily.isPending;

  const onGuardianDev = async () => {
    try {
      await signInDev.mutateAsync({ email: email.trim(), password });
      await createFamily.mutateAsync('보호자');
      router.replace(ROUTES.home);
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  const onOAuth = async (provider: 'google' | 'apple') => {
    try {
      await signInOAuth.mutateAsync(provider);
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center gap-2.5 bg-canvas px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="mb-1 flex-row items-center gap-2.5">
        <Icons.Pill size={LAYOUT.icon.hero} color={COLORS.brand} />
        <Text className="text-4xl font-bold text-brand">약먹었약</Text>
      </View>
      <Body className="mb-4">
        멀리 있는 가족과 약 먹은 소식을 나눠요. 보호자는 계정으로, 가족은
        초대코드로 시작해요.
      </Body>

      <View className="mt-2 flex-row items-center gap-1.5">
        <Icons.Shield size={LAYOUT.icon.sm} color={COLORS.brand} />
        <SectionTitle className="text-sm">보호자로 시작</SectionTitle>
      </View>
      <Input
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
      />
      <Input
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
      />
      <Button
        label={busy ? '잠시만요…' : '이메일로 시작하기'}
        disabled={busy}
        icon={Icons.Shield}
        onPress={() => void onGuardianDev()}
      />
      <Button
        label="Google로 계속"
        variant="outline"
        disabled={busy}
        onPress={() => void onOAuth('google')}
      />
      <Button
        label="Apple로 계속"
        variant="outline"
        disabled={busy}
        onPress={() => void onOAuth('apple')}
      />

      <View className="mt-7 flex-row items-center gap-1.5">
        <Icons.UserPlus size={LAYOUT.icon.sm} color={COLORS.brand} />
        <SectionTitle className="text-sm">가족으로 참여</SectionTitle>
      </View>
      <Link href={ROUTES.join} asChild>
        <Button
          label="초대코드로 참여하기"
          variant="outline"
          icon={Icons.QrCode}
        />
      </Link>
    </KeyboardAvoidingView>
  );
}
