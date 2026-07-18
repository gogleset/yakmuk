import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import {
  useCareRecipientJoinMutation,
  usePeekInviteQuery,
} from '@/features/care-recipient-join';
import { ROLE_LABEL } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import {
  Body,
  Button,
  FadeInView,
  Icons,
  Input,
  Muted,
  PageTitle,
  Screen,
} from '@/shared/ui';

/** 보호자·피보호자: 초대코드 + 닉네임(선택) */
export function JoinPage() {
  const { refreshProfile } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();
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

  const onJoin = async () => {
    try {
      await join.mutateAsync({
        inviteCode: code,
        nickname: nickname.trim() || undefined,
      });
      await refreshProfile();
      router.replace(ROUTES.home);
    } catch {
      /* mutation onError에서 처리 */
    }
  };

  return (
    <Screen className="justify-center gap-3 px-6">
      <FadeInView className="gap-3">
        <View className="flex-row items-center gap-2">
          <Icons.QrCode size={LAYOUT.icon.xl} color={COLORS.brand} />
          <PageTitle className="text-[28px]">초대코드를 입력해요</PageTitle>
        </View>
        <Input
          className="p-4 text-center text-2xl"
          style={{ letterSpacing: LIMITS.inviteCodeLetterSpacing }}
          autoCapitalize="characters"
          maxLength={LIMITS.inviteCodeLength}
          value={code}
          onChangeText={setCode}
          placeholder="ABCDEF"
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

        <Input
          value={nickname}
          onChangeText={setNickname}
          placeholder={
            peek?.kind === 'recovery'
              ? `내 닉네임 (비우면 ${peek.nickname ?? peek.invitedAs})`
              : peek?.invitedAs
                ? `내 닉네임 (비우면 ${peek.invitedAs})`
                : '내 닉네임 (선택 · 비우면 초대 호칭)'
          }
          maxLength={LIMITS.nicknameMaxLength}
          autoCorrect={false}
        />
        <Button
          label={join.isPending ? '연결 중…' : '참여하기'}
          disabled={
            join.isPending ||
            code.trim().length !== LIMITS.inviteCodeLength ||
            !!peekError
          }
          icon={Icons.Check}
          onPress={() => void onJoin()}
        />
        <Button label="뒤로" variant="ghost" onPress={() => router.back()} />
      </FadeInView>
    </Screen>
  );
}
