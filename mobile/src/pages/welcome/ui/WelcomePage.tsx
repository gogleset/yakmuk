import { router, useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCreateFamilyMutation,
  useGuardianSignInDevMutation,
  useGuardianSignInOAuthMutation,
  useSignOutMutation,
} from '@/features/guardian-auth';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import {
  Body,
  Button,
  ChoiceCard,
  FadeInView,
  FunnelShell,
  Icons,
  Input,
  KokiIllustration,
  Muted,
  SectionTitle,
} from '@/shared/ui';

type Path = 'choose' | 'leader';
type FamilyFunnelStep = 0 | 1;

export function WelcomePage() {
  const { refreshProfile, sessionUserId, isAnonymous, profile, loading } =
    useAuth();
  // join 스택 아래에서도 Welcome이 mount 유지됨 → focus일 때만 stale anon 정리
  const isFocused = useIsFocused();
  const [path, setPath] = useState<Path>('choose');
  const [email, setEmail] = useState('guardian@yakmuk.local');
  const [password, setPassword] = useState('yakmuk-dev-123');
  const [familyName, setFamilyName] = useState('');
  const [nickname, setNickname] = useState('');
  const [familyStep, setFamilyStep] = useState<FamilyFunnelStep>(0);
  const [showDevLogin, setShowDevLogin] = useState(false);

  const signInDev = useGuardianSignInDevMutation();
  const signInOAuth = useGuardianSignInOAuthMutation();
  const createFamily = useCreateFamilyMutation(refreshProfile);
  const { mutateAsync: signOutAsync, isPending: signOutPending } =
    useSignOutMutation();
  const busy =
    signInDev.isPending ||
    signInOAuth.isPending ||
    createFamily.isPending ||
    signOutPending;

  // 강퇴/복구 후 남은 anon 세션 정리 — 가족 생성 폼으로 빠지지 않게
  // join 중 signInAnonymously 레이스: unfocused면 signOut 금지
  useEffect(() => {
    console.log('[auth-debug] welcome gate', {
      loading,
      isFocused,
      sessionUserId,
      isAnonymous,
      familyId: profile?.familyId ?? null,
    });
    if (!isFocused || loading) return;
    if (profile?.familyId) return;
    if (!sessionUserId || !isAnonymous) return;
    console.warn(
      '[auth-debug] welcome → anon + no familyId → signOut (stale anon)',
    );
    let cancelled = false;
    void (async () => {
      try {
        await signOutAsync();
        if (cancelled) return;
        await refreshProfile();
        console.log('[auth-debug] welcome signOut done');
      } catch (e) {
        if (cancelled) return;
        console.warn('[auth-debug] welcome signOut failed', e);
        /* mutation onError에서 처리 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isFocused,
    loading,
    sessionUserId,
    profile?.familyId,
    isAnonymous,
    refreshProfile,
    signOutAsync,
  ]);

  // 이미 가족이 있으면 홈으로
  useEffect(() => {
    if (profile?.familyId) {
      router.replace(ROUTES.home);
    }
  }, [profile?.familyId]);

  // OAuth 로그인됨 + 가족 없음 → 가족 생성 (anon은 위에서 정리)
  const needsFamilySetup =
    !!sessionUserId && !profile?.familyId && !isAnonymous;

  const onLeaderDev = async () => {
    try {
      await signInDev.mutateAsync({ email: email.trim(), password });
      await refreshProfile();
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  const onOAuth = async (provider: 'google' | 'apple') => {
    try {
      await signInOAuth.mutateAsync(provider);
      await refreshProfile();
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  const onCreateFamily = async () => {
    try {
      await createFamily.mutateAsync({
        familyName: familyName.trim(),
        nickname: nickname.trim() || '가족장',
      });
      router.replace(ROUTES.home);
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  // P1 가족 만들기 퍼널
  if (needsFamilySetup) {
    const dirty = familyName.trim().length > 0 || nickname.trim().length > 0;
    if (familyStep === 0) {
      return (
        <FunnelShell
          stepIndex={0}
          stepCount={2}
          title="가족 이름을 알려주세요"
          kokiVariant="family"
          ctaLabel="다음"
          ctaDisabled={!familyName.trim()}
          dirty={dirty}
          onClose={() => void signOutAsync().then(() => refreshProfile())}
          onCtaPress={() => setFamilyStep(1)}
        >
          <Input
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="예: 우리집"
            maxLength={LIMITS.familyNameMaxLength}
            autoFocus
          />
        </FunnelShell>
      );
    }
    return (
      <FunnelShell
        stepIndex={1}
        stepCount={2}
        title="뭐라고 불러드릴까요?"
        ctaLabel={busy ? '잠시만요…' : '만들기'}
        ctaDisabled={busy}
        ctaLoading={busy}
        dirty={dirty}
        onBack={() => setFamilyStep(0)}
        onClose={() => void signOutAsync().then(() => refreshProfile())}
        onCtaPress={() => void onCreateFamily()}
      >
        <Input
          value={nickname}
          onChangeText={setNickname}
          placeholder="예: 민수"
          maxLength={LIMITS.nicknameMaxLength}
          autoFocus
        />
      </FunnelShell>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow justify-center gap-3 px-6 py-10"
      >
        <FadeInView>
          <View className="mb-1 items-center gap-2">
            <KokiIllustration variant="welcome" size={140} />
            <Text className="text-4xl font-bold text-brand">약콕</Text>
          </View>
          <Body className="mb-1 text-center">
            멀리 있는 가족과 안부를 나눠요.
          </Body>
          <Muted className="mb-2 text-center text-sm">콕이가 함께해요</Muted>
        </FadeInView>

        {path === 'choose' ? (
          <FadeInView className="mt-2 gap-3">
            <ChoiceCard
              title="가족을 만들어요"
              description="가족장으로 시작해요"
              icon={Icons.Shield}
              onPress={() => setPath('leader')}
            />
            <ChoiceCard
              title="초대코드를 받았어요"
              description="보호자·피보호자로 참여해요"
              icon={Icons.QrCode}
              onPress={() => router.push(ROUTES.join)}
            />
          </FadeInView>
        ) : (
          <FadeInView className="gap-2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전"
              hitSlop={LAYOUT.hitSlop.md}
              onPress={() => setPath('choose')}
              className="mb-1 self-start"
            >
              <Icons.ChevronLeft size={LAYOUT.icon.xl} color={COLORS.brand} />
            </Pressable>
            <View className="flex-row items-center gap-1.5">
              <Icons.Shield size={LAYOUT.icon.sm} color={COLORS.brand} />
              <SectionTitle className="text-sm">가족장으로 시작</SectionTitle>
            </View>
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

            {__DEV__ ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowDevLogin((v) => !v)}
                  className="mt-2"
                >
                  <Muted className="text-xs underline">
                    {showDevLogin ? '개발 로그인 접기' : '개발용 이메일 로그인'}
                  </Muted>
                </Pressable>
                {showDevLogin ? (
                  <>
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
                      onPress={() => void onLeaderDev()}
                    />
                  </>
                ) : null}
              </>
            ) : null}
          </FadeInView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
