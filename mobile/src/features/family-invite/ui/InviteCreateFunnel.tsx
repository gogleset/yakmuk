import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import type { InviteTargetRole } from '@/entities/user/model/types';
import { ROLE_LABEL } from '@/entities/user';
import { canCreateInvite } from '@/features/family-invite/lib/canCreateInvite';
import { useFamilyInviteMutations } from '@/features/family-invite/model/useFamilyInviteMutations';
import { FacePlaceholder } from '@/features/family-invite/ui/FacePlaceholder';
import { InviteReadyCard } from '@/features/family-invite/ui/InviteReadyCard';
import { LIMITS } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import {
  Caption,
  FadeInView,
  FunnelShell,
  Input,
  LabelSm,
} from '@/shared/ui';

type Step = 0 | 1;

type Props = {
  onClose: () => void;
};

/** P5 부르기 — 역할+호칭 → 초대장 공유 */
export function InviteCreateFunnel({ onClose }: Props) {
  const { createInvite } = useFamilyInviteMutations();
  const [step, setStep] = useState<Step>(0);
  const [targetRole, setTargetRole] = useState<InviteTargetRole>('guardian');
  const [invitedAs, setInvitedAs] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const dirty = invitedAs.trim().length > 0 || step > 0;
  const canCreate = canCreateInvite({ targetRole, invitedAs });

  const onCreate = () => {
    const trimmed = invitedAs.trim();
    if (!canCreateInvite({ targetRole, invitedAs: trimmed })) {
      Alert.alert(COPY.invite.labelAlertTitle, COPY.invite.labelAlertBody);
      return;
    }
    createInvite.mutate(
      { invitedAs: trimmed, targetRole },
      {
        onSuccess: (invite) => {
          setInviteCode(invite.inviteCode);
          setStep(1);
        },
      },
    );
  };

  if (step === 0) {
    return (
      <FunnelShell
        stepIndex={0}
        stepCount={2}
        title={COPY.invite.funnelWhoTitle}
        ctaLabel={
          createInvite.isPending
            ? COPY.invite.funnelCreating
            : COPY.invite.funnelCreateCta
        }
        ctaDisabled={!canCreate || createInvite.isPending}
        ctaLoading={createInvite.isPending}
        dirty={dirty}
        onClose={onClose}
        onCtaPress={onCreate}
        stagger
      >
        <FadeInView step={0} className="items-center gap-4">
          <FacePlaceholder variant="solid" size={72} />
          <Caption>{COPY.invite.funnelRoleHint}</Caption>
          <View className="w-full flex-row gap-2">
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
                    'flex-1 items-center rounded-2xl py-3.5',
                    selected ? 'bg-brand' : 'bg-surface-soft',
                  )}
                >
                  <LabelSm tone={selected ? 'ink' : 'brand'}>
                    {ROLE_LABEL[opt.role]}
                  </LabelSm>
                </Pressable>
              );
            })}
          </View>

          <Caption className="self-start">{COPY.invite.funnelLabelHint}</Caption>
          <View className="w-full flex-row flex-wrap gap-2">
            {COPY.invite.labelChips.map((chip) => {
              const selected = !customMode && invitedAs === chip;
              return (
                <Pressable
                  key={chip}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setCustomMode(false);
                    setInvitedAs(chip);
                  }}
                  className={cn(
                    'w-[47%] items-center rounded-2xl py-3.5',
                    selected ? 'bg-brand' : 'bg-surface-soft',
                  )}
                >
                  <LabelSm tone={selected ? 'ink' : 'brand'}>{chip}</LabelSm>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: customMode }}
            onPress={() => {
              setCustomMode(true);
              setInvitedAs('');
            }}
            className={cn(
              'w-full items-center rounded-2xl py-3.5',
              customMode ? 'bg-brand-soft' : 'bg-surface-soft',
            )}
          >
            <LabelSm tone="brand">{COPY.invite.funnelCustomLabel}</LabelSm>
          </Pressable>

          {customMode ? (
            <Input
              value={invitedAs}
              onChangeText={setInvitedAs}
              placeholder={COPY.invite.labelAlertBody}
              maxLength={LIMITS.nicknameMaxLength}
              autoCorrect={false}
              autoFocus
              className="w-full"
            />
          ) : null}
        </FadeInView>
      </FunnelShell>
    );
  }

  return (
    <FunnelShell
      stepIndex={1}
      stepCount={2}
      title={COPY.invite.funnelReadyTitle}
      ctaLabel={COPY.invite.funnelDone}
      dirty={false}
      onClose={onClose}
      onCtaPress={onClose}
      stagger
    >
      {inviteCode ? (
        <InviteReadyCard
          inviteCode={inviteCode}
          invitedAs={invitedAs}
          targetRole={targetRole}
        />
      ) : null}
    </FunnelShell>
  );
}
