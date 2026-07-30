import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  FamilyPeekCard,
  useCareRecipientJoinMutation,
  usePeekInviteQuery,
} from '@/features/care-recipient-join';
import { ROUTES } from '@/shared/config/routes';
import { LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  FunnelShell,
  Input,
  InviteCodeInput,
  Muted,
} from '@/shared/ui';

type JoinStep = 0 | 1;

/** P2 — 초대코드 6칸 → 호칭(선택) */
export function JoinPage() {
  const { refreshProfile } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();
  const [step, setStep] = useState<JoinStep>(0);
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const join = useCareRecipientJoinMutation();
  const peekQuery = usePeekInviteQuery(code);

  useEffect(() => {
    if (params.code) setCode(String(params.code).toUpperCase());
  }, [params.code]);

  const peek = peekQuery.data ?? null;
  const peekLoading = peekQuery.isFetching;
  const peekError =
    peekQuery.error instanceof Error
      ? peekQuery.error.message
      : peekQuery.error
        ? '초대를 확인할 수 없어요'
        : null;

  const codeReady =
    code.trim().length === LIMITS.inviteCodeLength &&
    !!peek &&
    !peekError &&
    !peekLoading;

  const onJoin = async (skipNickname = false) => {
    try {
      console.log('[join-debug] onJoin press', { code, skipNickname });
      const joined = await join.mutateAsync({
        inviteCode: code,
        nickname: skipNickname ? undefined : nickname.trim() || undefined,
      });
      console.log('[join-debug] mutate ok → refreshProfile', {
        familyId: joined.familyId,
      });
      await refreshProfile();
      console.log('[join-debug] refresh done → replace home');
      router.replace(ROUTES.home);
    } catch (e) {
      console.warn('[join-debug] onJoin failed', e);
      /* mutation onError에서 처리 */
    }
  };

  const dirty = code.trim().length > 0 || nickname.trim().length > 0;

  if (step === 0) {
    return (
      <FunnelShell
        stepIndex={0}
        stepCount={2}
        title={COPY.join.codeTitle}
        hideProgress
        stagger
        ctaLabel={COPY.join.next}
        ctaDisabled={!codeReady}
        dirty={dirty}
        onBack={() => router.back()}
        onCtaPress={() => setStep(1)}
      >
        <InviteCodeInput value={code} onChangeText={setCode} autoFocus />
        {peekLoading ? <Muted>{COPY.join.peekLoading}</Muted> : null}
        {peekError ? (
          <Text className="text-sm text-destructive">{peekError}</Text>
        ) : null}
        {peek && !peekError ? <FamilyPeekCard peek={peek} /> : null}
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      stepIndex={1}
      stepCount={2}
      title={COPY.join.nicknameTitle}
      kokiVariant="happy"
      hideProgress
      stagger
      ctaLabel={join.isPending ? COPY.join.connecting : COPY.join.participate}
      ctaDisabled={join.isPending}
      ctaLoading={join.isPending}
      dirty={dirty}
      onBack={() => setStep(0)}
      onCtaPress={() => void onJoin(false)}
    >
      <Input
        value={nickname}
        onChangeText={setNickname}
        placeholder={COPY.join.nicknamePlaceholder}
        maxLength={LIMITS.nicknameMaxLength}
        autoCorrect={false}
        autoFocus
      />
      <Muted className="self-end text-xs">
        {nickname.length}/{LIMITS.nicknameMaxLength}
      </Muted>
      <Pressable
        accessibilityRole="button"
        disabled={join.isPending}
        onPress={() => void onJoin(true)}
        className="items-center py-1"
      >
        <Text className="text-sm font-semibold text-brand">
          {COPY.join.later}
        </Text>
      </Pressable>
    </FunnelShell>
  );
}
