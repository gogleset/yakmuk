import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useFamilyRosterSubscription } from '@/entities/family/model/queries';
import { useFamilyInvitesQuery } from '@/entities/user/model/queries';
import { InviteReadyCard } from '@/features/family-invite/ui/InviteReadyCard';
import { ROUTES } from '@/shared/config/routes';
import { LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  Body,
  FadeInView,
  Screen,
  ScreenScrollView,
  ScreenLoading,
  StackHeader,
} from '@/shared/ui';

/** 초대장 상세 — 코드·QR·공유 (자리표 메뉴 →) */
export function InviteDetailPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const isLeader = profile?.role === 'family_leader';
  const familyId = profile?.familyId;
  const params = useLocalSearchParams<{ inviteId?: string }>();
  const inviteId = params.inviteId ? String(params.inviteId) : null;

  useFamilyRosterSubscription(familyId, qc);
  const invitesQuery = useFamilyInvitesQuery({ enabled: isLeader });
  const invite = (invitesQuery.data ?? []).find((i) => i.id === inviteId);

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.family);
  };

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <StackHeader
        title={COPY.family.manageTitle}
        tone="brand"
        onBack={onClose}
      />
      <ScreenScrollView contentContainerClassName="gap-4 px-5 pb-10 pt-2">
        {invitesQuery.isLoading && !invitesQuery.data ? (
          <ScreenLoading />
        ) : !invite ? (
          <Body className="text-center">{COPY.invite.detailNotFound}</Body>
        ) : (
          <FadeInView step={0}>
            <InviteReadyCard
              inviteCode={invite.inviteCode}
              invitedAs={invite.invitedAs}
              targetRole={invite.targetRole}
            />
          </FadeInView>
        )}
      </ScreenScrollView>
    </Screen>
  );
}
