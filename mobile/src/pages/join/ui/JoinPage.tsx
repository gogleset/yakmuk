import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCareRecipientJoinMutation,
  usePeekInviteQuery,
} from '@/features/care-recipient-join';
import { ROLE_LABEL } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { LIMITS } from '@/shared/config/theme';
import { Body, FunnelShell, Input, Muted } from '@/shared/ui';

type JoinStep = 0 | 1;

/** P2 — 초대코드 → 닉네임 */
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
    code.trim().length === LIMITS.inviteCodeLength && !peekError;

  const onJoin = async () => {
    try {
      console.log('[join-debug] onJoin press', { code });
      const joined = await join.mutateAsync({
        inviteCode: code,
        nickname: nickname.trim() || undefined,
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
        title="초대코드를 입력해 주세요"
        kokiVariant="welcome"
        ctaLabel="다음"
        ctaDisabled={!codeReady}
        dirty={dirty}
        onClose={() => router.back()}
        onCtaPress={() => setStep(1)}
      >
        <Input
          className="p-4 text-center text-2xl"
          style={{ letterSpacing: LIMITS.inviteCodeLetterSpacing }}
          autoCapitalize="characters"
          maxLength={LIMITS.inviteCodeLength}
          value={code}
          onChangeText={setCode}
          placeholder="ABCDEF"
          autoFocus
        />
        {peekLoading ? <Muted>초대 확인 중…</Muted> : null}
        {peekError ? (
          <Text className="text-sm text-destructive">{peekError}</Text>
        ) : null}
        {peek ? (
          <Body className="text-sm">
            {peek.kind === 'recovery'
              ? `${peek.familyName} · 기기 복구\n${peek.nickname ?? peek.invitedAs} (${ROLE_LABEL[peek.targetRole as 'guardian' | 'care_recipient']}) · 약·기록 유지`
              : `${peek.familyName} · ${peek.leaderNickname}의 ${peek.invitedAs}\n${ROLE_LABEL[peek.targetRole as 'guardian' | 'care_recipient']}(으)로 참여해요`}
          </Body>
        ) : null}
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      stepIndex={1}
      stepCount={2}
      title="뭐라고 불러드릴까요?"
      ctaLabel={join.isPending ? '연결 중…' : '참여하기'}
      ctaDisabled={join.isPending}
      ctaLoading={join.isPending}
      dirty={dirty}
      onBack={() => setStep(0)}
      onClose={() => router.back()}
      onCtaPress={() => void onJoin()}
    >
      <Input
        value={nickname}
        onChangeText={setNickname}
        placeholder={
          peek?.kind === 'recovery'
            ? `비우면 ${peek.nickname ?? peek.invitedAs}`
            : peek?.invitedAs
              ? `비우면 ${peek.invitedAs}`
              : '선택 · 비우면 초대 호칭'
        }
        maxLength={LIMITS.nicknameMaxLength}
        autoCorrect={false}
        autoFocus
      />
      <Pressable
        accessibilityRole="button"
        disabled={join.isPending}
        onPress={() => void onJoin()}
      >
        <Muted className="mt-1 text-center text-sm underline">나중에</Muted>
      </Pressable>
    </FunnelShell>
  );
}
