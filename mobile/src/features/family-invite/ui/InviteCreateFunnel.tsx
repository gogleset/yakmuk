import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { InviteTargetRole } from '@/entities/user/model/types';
import { ROLE_LABEL } from '@/entities/user';
import { useFamilyInviteMutations } from '@/features/family-invite/model/useFamilyInviteMutations';
import { joinDeepLink } from '@/shared/config/routes';
import { LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import { FunnelShell, Input, Body, Code } from '@/shared/ui';

type Step = 0 | 1 | 2;

type Props = {
  onClose: () => void;
};

const QR_SIZE = 160;

/** P5 초대 생성 — 역할 → 호칭 → 코드 공유 */
export function InviteCreateFunnel({ onClose }: Props) {
  const { createInvite } = useFamilyInviteMutations();
  const [step, setStep] = useState<Step>(0);
  const [targetRole, setTargetRole] = useState<InviteTargetRole>('guardian');
  const [invitedAs, setInvitedAs] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const dirty = invitedAs.trim().length > 0 || step > 0;

  const onCreate = () => {
    const trimmed = invitedAs.trim();
    if (!trimmed) {
      Alert.alert(COPY.invite.labelAlertTitle, COPY.invite.labelAlertBody);
      return;
    }
    createInvite.mutate(
      { invitedAs: trimmed, targetRole },
      {
        onSuccess: (invite) => {
          setInviteCode(invite.inviteCode);
          setStep(2);
        },
      },
    );
  };

  if (step === 0) {
    return (
      <FunnelShell
        stepIndex={0}
        stepCount={3}
        title="누구를 초대할까요?"
        kokiVariant="family"
        ctaLabel="다음"
        dirty={dirty}
        onClose={onClose}
        onCtaPress={() => setStep(1)}
      >
        <View className="flex-row gap-2">
          {(
            [
              { role: 'guardian' as const },
              { role: 'care_recipient' as const },
            ] as const
          ).map((opt) => {
            const selected = targetRole === opt.role;
            return (
              <Pressable
                key={opt.role}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setTargetRole(opt.role)}
                className={cn(
                  'flex-1 items-center rounded-xl py-3.5',
                  selected ? 'bg-brand' : 'bg-surface-soft',
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    selected ? 'text-ink' : 'text-brand',
                  )}
                >
                  {ROLE_LABEL[opt.role]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FunnelShell>
    );
  }

  if (step === 1) {
    return (
      <FunnelShell
        stepIndex={1}
        stepCount={3}
        title="초대할 분의 호칭은?"
        ctaLabel={createInvite.isPending ? '발급 중…' : '초대코드 만들기'}
        ctaDisabled={!invitedAs.trim() || createInvite.isPending}
        ctaLoading={createInvite.isPending}
        dirty={dirty}
        onBack={() => setStep(0)}
        onClose={onClose}
        onCtaPress={onCreate}
      >
        <Input
          value={invitedAs}
          onChangeText={setInvitedAs}
          placeholder="예: 아빠, 할머니"
          maxLength={LIMITS.nicknameMaxLength}
          autoCorrect={false}
          autoFocus
        />
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      stepIndex={2}
      stepCount={3}
      title="초대코드를 공유해요"
      kokiVariant="family"
      ctaLabel="완료"
      dirty={false}
      onCtaPress={onClose}
    >
      {inviteCode ? (
        <View className="items-center gap-3 py-2">
          <Code tone="brand">{inviteCode}</Code>
          <QRCode value={joinDeepLink(inviteCode)} size={QR_SIZE} />
          <Body className="text-center text-sm">
            {invitedAs} · {ROLE_LABEL[targetRole]}
          </Body>
        </View>
      ) : null}
    </FunnelShell>
  );
}
