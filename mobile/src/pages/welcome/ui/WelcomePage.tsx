import { router, useIsFocused } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCreateFamilyMutation,
  useGuardianSignInDevMutation,
  useGuardianSignInNativeMutation,
  useSignOutMutation,
} from '@/features/guardian-auth';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  Button,
  FadeInView,
  FunnelShell,
  Icons,
  Input,
  KokiIllustration,
  Muted,
} from '@/shared/ui';

type Path = 'choose' | 'leader';
type FamilyFunnelStep = 0 | 1;

export function WelcomePage() {
  const { refreshProfile, sessionUserId, isAnonymous, profile, loading } =
    useAuth();
  // join 스택 아래에서도 Welcome이 mount 유지됨 → focus일 때만 stale anon 정리
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [path, setPath] = useState<Path>('choose');
  const [email, setEmail] = useState('guardian@yakmuk.local');
  const [password, setPassword] = useState('yakmuk-dev-123');
  const [familyName, setFamilyName] = useState('');
  const [nickname, setNickname] = useState('');
  const [familyStep, setFamilyStep] = useState<FamilyFunnelStep>(0);
  const [showDevLogin, setShowDevLogin] = useState(false);

  const recoverWelcomeAfterNativeAuthFailure = useCallback(() => {
    setFamilyStep(0);
    setPath('choose');
    void (async () => {
      try {
        await refreshProfile();
      } catch {
        /* ignore */
      }
      router.replace(ROUTES.welcome);
    })();
  }, [refreshProfile]);

  const signInDev = useGuardianSignInDevMutation();
  const signInNative = useGuardianSignInNativeMutation(
    recoverWelcomeAfterNativeAuthFailure,
  );
  const createFamily = useCreateFamilyMutation(refreshProfile);
  const { mutateAsync: signOutAsync, isPending: signOutPending } =
    useSignOutMutation();
  const busy =
    signInDev.isPending ||
    signInNative.isPending ||
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

  const onNativeSignIn = async (provider: 'google' | 'apple') => {
    try {
      const result = await signInNative.mutateAsync(provider);
      if (!result.cancelled) {
        await refreshProfile();
      }
    } catch {
      // 모달 확인 전에도 리더 화면/부분 세션에 안 남게 즉시 Welcome choose로
      setFamilyStep(0);
      setPath('choose');
      try {
        await refreshProfile();
      } catch {
        /* ignore */
      }
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

  const onLeaveFamilySetup = () => {
    void (async () => {
      try {
        await signOutAsync();
        await refreshProfile();
        setFamilyStep(0);
        setPath('leader');
      } catch {
        /* mutation onError에서 처리 */
      }
    })();
  };

  // P1 가족 만들기 퍼널
  if (needsFamilySetup) {
    const dirty = familyName.trim().length > 0 || nickname.trim().length > 0;
    if (familyStep === 0) {
      return (
        <FunnelShell
          stepIndex={0}
          stepCount={2}
          title={COPY.welcome.familyNameTitle}
          kokiVariant="family"
          hideProgress
          stagger
          ctaLabel={COPY.welcome.next}
          ctaDisabled={!familyName.trim()}
          dirty={dirty}
          onBack={onLeaveFamilySetup}
          onCtaPress={() => setFamilyStep(1)}
        >
          <Input
            value={familyName}
            onChangeText={setFamilyName}
            placeholder={COPY.welcome.familyNamePlaceholder}
            maxLength={LIMITS.familyNameMaxLength}
            autoFocus
          />
          <Muted className="self-end text-xs">
            {familyName.length}/{LIMITS.familyNameMaxLength}
          </Muted>
        </FunnelShell>
      );
    }
    return (
      <FunnelShell
        stepIndex={1}
        stepCount={2}
        title={COPY.welcome.nicknameTitle}
        kokiVariant="happy"
        hideProgress
        stagger
        ctaLabel={busy ? '잠시만요…' : COPY.welcome.create}
        ctaDisabled={busy || !nickname.trim()}
        ctaLoading={busy}
        dirty={dirty}
        onBack={() => setFamilyStep(0)}
        onCtaPress={() => void onCreateFamily()}
      >
        <Input
          value={nickname}
          onChangeText={setNickname}
          placeholder={COPY.welcome.nicknamePlaceholder}
          maxLength={LIMITS.nicknameMaxLength}
          autoFocus
        />
        <Muted className="self-end text-xs">
          {nickname.length}/{LIMITS.nicknameMaxLength}
        </Muted>
      </FunnelShell>
    );
  }

  // choose: 인사·콕이·CTA를 세로 중앙에 한 덩어리로
  if (path === 'choose') {
    return (
      <View
        className="flex-1 justify-center bg-canvas px-6"
        style={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <View className="gap-8">
          <FadeInView step={0} className="gap-2.5">
            <Text className="text-3xl font-bold leading-snug text-text">
              {COPY.welcome.title}
            </Text>
            <Muted className="text-base leading-relaxed">
              {COPY.welcome.subtitle}
            </Muted>
          </FadeInView>

          <FadeInView step={1} className="items-center">
            <KokiIllustration variant="welcome" size={240} />
          </FadeInView>

          <FadeInView step={2} className="gap-3">
            <Button
              label={COPY.welcome.createFamily}
              shape="round"
              onPress={() => setPath('leader')}
            />
            <Button
              label={COPY.welcome.hasInvite}
              variant="outline"
              onPress={() => router.push(ROUTES.join)}
            />
          </FadeInView>
        </View>
      </View>
    );
  }

  // leader: 네이티브 로그인 / 개발 로그인
  return (
    <View
      className="flex-1 bg-canvas px-6"
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="이전"
        hitSlop={LAYOUT.hitSlop.md}
        onPress={() => setPath('choose')}
        className="mb-2 self-start"
      >
        <Icons.ChevronLeft size={LAYOUT.icon.lg} color={COLORS.brand} />
      </Pressable>

      <View className="flex-1 justify-center gap-8">
        <FadeInView step={0}>
          <Text className="text-center text-2xl font-bold leading-snug text-text">
            {COPY.welcome.loginTitle}
          </Text>
        </FadeInView>

        <FadeInView step={1} className="gap-3">
          <Button
            label={COPY.welcome.continueGoogle}
            variant="oauth"
            disabled={busy}
            onPress={() => void onNativeSignIn('google')}
          />
          {Platform.OS === 'ios' ? (
            <Button
              label={COPY.welcome.continueApple}
              variant="oauth"
              disabled={busy}
              onPress={() => void onNativeSignIn('apple')}
            />
          ) : null}

          {__DEV__ ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowDevLogin((v) => !v)}
                className="mt-1"
              >
                <Muted className="text-center text-xs underline">
                  {showDevLogin ? '개발 로그인 접기' : '개발용 이메일 로그인'}
                </Muted>
              </Pressable>
              {showDevLogin ? (
                <View className="gap-2.5">
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
                    shape="round"
                    disabled={busy}
                    onPress={() => void onLeaderDev()}
                  />
                </View>
              ) : null}
            </>
          ) : null}
        </FadeInView>
      </View>
    </View>
  );
}
